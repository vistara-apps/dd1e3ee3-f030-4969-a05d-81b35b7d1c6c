import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateId } from '@/lib/utils';
import { z } from 'zod';

const WalletAuthSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  signature: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } = WalletAuthSchema.parse(body);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let user = existingUser;

    // Create new user if doesn't exist
    if (!user) {
      const newUser = {
        user_id: generateId(),
        wallet_address: walletAddress.toLowerCase(),
        subscription_status: 'free' as const,
        preferred_language: 'en' as const,
        trusted_contacts: [],
        selected_state: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = createdUser;
    } else {
      // Update last login
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error('Error updating user:', updateError);
      }
    }

    // Return user data (excluding sensitive information)
    const userData = {
      userId: user.user_id,
      walletAddress: user.wallet_address,
      subscriptionStatus: user.subscription_status,
      preferredLanguage: user.preferred_language,
      trustedContacts: user.trusted_contacts,
      selectedState: user.selected_state,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });

  } catch (error) {
    console.error('Wallet auth error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    const userData = {
      userId: user.user_id,
      walletAddress: user.wallet_address,
      subscriptionStatus: user.subscription_status,
      preferredLanguage: user.preferred_language,
      trustedContacts: user.trusted_contacts,
      selectedState: user.selected_state,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
