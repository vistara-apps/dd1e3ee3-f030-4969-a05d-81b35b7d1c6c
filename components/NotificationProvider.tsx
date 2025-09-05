'use client';

import { Toaster } from 'sonner';

export function NotificationProvider() {
  return (
    <Toaster
      position="top-center"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        },
        className: 'glass-toast',
      }}
    />
  );
}

// Utility functions for consistent notifications
export const notify = {
  success: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    const { toast } = require('sonner');
    return toast.loading(message);
  },

  dismiss: (toastId: string | number) => {
    const { toast } = require('sonner');
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    const { toast } = require('sonner');
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
