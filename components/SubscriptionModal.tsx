'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, CreditCard, Wallet } from 'lucide-react';
import { useCreateSubscription } from '@/lib/hooks';
import { APP_CONFIG } from '@/lib/constants';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  walletAddress: string;
  currentPlan?: 'free' | 'premium' | 'lifetime';
}

export function SubscriptionModal({
  isOpen,
  onClose,
  userId,
  walletAddress,
  currentPlan = 'free'
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const createSubscription = useCreateSubscription();

  const handleSubscribe = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await createSubscription.mutateAsync({
        userId,
        planType: selectedPlan,
        walletAddress,
      });

      if (result.success) {
        // Handle successful subscription creation
        // In a real app, you'd redirect to Stripe checkout or handle payment
        console.log('Subscription created:', result.data);
        onClose();
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Premium Monthly',
      price: APP_CONFIG.SUBSCRIPTION_PRICE,
      period: '/month',
      description: 'Full access to all features',
      features: [
        'All state-specific legal guides',
        'Advanced scenario scripts',
        'Secure incident recording',
        'Trusted contact sharing',
        'Legal aid referrals',
        'Priority support'
      ],
      popular: true,
    },
    {
      id: 'lifetime' as const,
      name: 'Lifetime Access',
      price: APP_CONFIG.LIFETIME_PRICE,
      period: 'one-time',
      description: 'Pay once, access forever',
      features: [
        'Everything in Premium',
        'Lifetime updates',
        'No recurring charges',
        'Priority feature requests',
        'Exclusive content',
        'VIP support'
      ],
      popular: false,
    },
  ];

  if (currentPlan !== 'free') {
    return null; // Don't show modal if user already has a subscription
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
                  <p className="text-white opacity-70">Unlock all features and protect your rights</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? 'border-purple-400 bg-purple-500 bg-opacity-10'
                      : 'border-white border-opacity-20 hover:border-opacity-40'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-purple-400 bg-purple-400'
                        : 'border-white border-opacity-40'
                    }`}>
                      {selectedPlan === plan.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-white opacity-70">/{plan.period}</span>
                    </div>
                    <p className="text-white opacity-70 text-sm mt-1">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white opacity-90 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 glass-card rounded-lg">
                  <CreditCard className="w-6 h-6 text-white opacity-80" />
                  <div>
                    <p className="text-white font-medium">Credit Card</p>
                    <p className="text-white opacity-70 text-sm">Secure payment via Stripe</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 glass-card rounded-lg opacity-50">
                  <Wallet className="w-6 h-6 text-white opacity-80" />
                  <div>
                    <p className="text-white font-medium">Crypto Payment</p>
                    <p className="text-white opacity-70 text-sm">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                Maybe Later
              </button>
              
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Subscribe Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-white border-opacity-20">
              <div className="flex items-center justify-center space-x-8 text-white opacity-60 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
