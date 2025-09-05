import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Guide, Script, Incident, ApiResponse } from './types';

// API client functions
const apiClient = {
  // Auth
  authenticateWallet: async (walletAddress: string): Promise<ApiResponse<User>> => {
    const response = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });
    return response.json();
  },

  // Guides
  getGuides: async (params?: { state?: string; language?: string; type?: string }): Promise<ApiResponse<Guide[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.state) searchParams.set('state', params.state);
    if (params?.language) searchParams.set('language', params.language);
    if (params?.type) searchParams.set('type', params.type);
    
    const response = await fetch(`/api/guides?${searchParams}`);
    return response.json();
  },

  // Scripts
  getScripts: async (params?: { scenario?: string; language?: string; state?: string }): Promise<ApiResponse<Script[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.scenario) searchParams.set('scenario', params.scenario);
    if (params?.language) searchParams.set('language', params.language);
    if (params?.state) searchParams.set('state', params.state);
    
    const response = await fetch(`/api/scripts?${searchParams}`);
    return response.json();
  },

  // Incidents
  getIncidents: async (userId: string, params?: { limit?: number; offset?: number }): Promise<ApiResponse<Incident[]>> => {
    const searchParams = new URLSearchParams({ userId });
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const response = await fetch(`/api/incidents?${searchParams}`);
    return response.json();
  },

  createIncident: async (incident: Partial<Incident>): Promise<ApiResponse<Incident>> => {
    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    return response.json();
  },

  updateIncident: async (incidentId: string, updates: Partial<Incident>): Promise<ApiResponse<Incident>> => {
    const response = await fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, ...updates }),
    });
    return response.json();
  },

  // Subscriptions
  getSubscription: async (userId: string) => {
    const response = await fetch(`/api/subscriptions?userId=${userId}`);
    return response.json();
  },

  createSubscription: async (data: { userId: string; planType: 'monthly' | 'lifetime'; walletAddress: string }) => {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  cancelSubscription: async (userId: string) => {
    const response = await fetch(`/api/subscriptions?userId=${userId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Custom hooks
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.authenticateWallet(walletAddress);
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error during authentication');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    authenticate,
    logout,
    isAuthenticated: !!user,
  };
}

export function useGuides(state?: string, language?: string, type?: string) {
  return useQuery({
    queryKey: ['guides', state, language, type],
    queryFn: () => apiClient.getGuides({ state, language, type }),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useScripts(scenario?: string, language?: string, state?: string) {
  return useQuery({
    queryKey: ['scripts', scenario, language, state],
    queryFn: () => apiClient.getScripts({ scenario, language, state }),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIncidents(userId?: string) {
  return useQuery({
    queryKey: ['incidents', userId],
    queryFn: () => userId ? apiClient.getIncidents(userId) : Promise.resolve({ data: [] }),
    select: (data) => data.data,
    enabled: !!userId,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createIncident,
    onSuccess: (data) => {
      // Invalidate incidents query to refetch
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ incidentId, updates }: { incidentId: string; updates: Partial<Incident> }) =>
      apiClient.updateIncident(incidentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useSubscription(userId?: string) {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => userId ? apiClient.getSubscription(userId) : Promise.resolve({ data: null }),
    select: (data) => data.data,
    enabled: !!userId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// Recording hook
export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<{
    startTime: Date;
    duration: number;
    blob?: Blob;
  } | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false // Audio only for privacy
      });
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingData(prev => prev ? { ...prev, blob } : null);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingData({
        startTime: new Date(),
        duration: 0,
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  // Update duration every second while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && recordingData) {
      interval = setInterval(() => {
        setRecordingData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000),
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingData]);

  return {
    isRecording,
    recordingData,
    startRecording,
    stopRecording,
  };
}

// Location hook
export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    state?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address (optional)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        setLocation({
          latitude,
          longitude,
          address: data.locality || data.city || 'Unknown location',
          state: data.principalSubdivision || undefined,
        });
      } catch (geocodeError) {
        // Fallback without address
        setLocation({
          latitude,
          longitude,
        });
      }
      
    } catch (err) {
      setError('Failed to get location. Please enable location services.');
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
  };
}
