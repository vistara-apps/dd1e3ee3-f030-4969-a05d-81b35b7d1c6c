import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  planType: z.enum(['monthly', 'lifetime']),
  walletAddress: z.string(),
});

const GetSubscriptionSchema = z.object({
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params = {
      userId: searchParams.get('userId') || undefined,
    };

    const { userId } = GetSubscriptionSchema.parse(params);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'No subscription found'
        });
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        userId: subscription.user_id,
        status: subscription.status,
        planType: subscription.plan_type,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planType, walletAddress } = CreateSubscriptionSchema.parse(body);

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: `${walletAddress}@lexiguard.app`, // Use wallet address as email
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: `${walletAddress}@lexiguard.app`,
          metadata: {
            userId,
            walletAddress,
          },
        });
      }
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    if (planType === 'lifetime') {
      // Create one-time payment for lifetime access
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 2999, // $29.99
          currency: 'usd',
          customer: customer.id,
          metadata: {
            userId,
            planType: 'lifetime',
            walletAddress,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          }
        });
      } catch (stripeError) {
        console.error('Stripe payment intent error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create payment intent' },
          { status: 500 }
        );
      }
    } else {
      // Create monthly subscription
      try {
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'LexiGuard Premium Monthly',
                description: 'Full access to all state guides, scripts, and premium features',
              },
              unit_amount: 499, // $4.99
              recurring: {
                interval: 'month',
              },
            },
          }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId,
            walletAddress,
          },
        });

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

        return NextResponse.json({
          success: true,
          data: {
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          }
        });
      } catch (stripeError) {
        console.error('Stripe subscription error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Create subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get user's subscription
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Cancel Stripe subscription if it exists
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription status in database
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    // Update user subscription status
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
