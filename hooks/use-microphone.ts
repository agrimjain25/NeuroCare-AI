'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type MicrophoneStatus = 'idle' | 'requesting' | 'granted' | 'recording' | 'stopped' | 'error';

export interface UseMicrophoneReturn {
  status: MicrophoneStatus;
  error: string | null;
  stream: MediaStream | null;
  requestPermission: () => Promise<MediaStream | null>;
  stopStream: () => void;
  clearError: () => void;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [status, setStatus] = useState<MicrophoneStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    setError(null);
    
    // 1. Pre-checks
    if (typeof window === 'undefined') return null;

    if (!window.isSecureContext) {
      const msg = "Microphone access requires a secure (HTTPS) connection. Please check your URL.";
      setError(msg);
      setStatus('error');
      return null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = "Your browser doesn't support microphone access. Please use a modern browser like Chrome or Safari.";
      setError(msg);
      setStatus('error');
      return null;
    }

    setStatus('requesting');

    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      setStream(newStream);
      setStatus('granted');
      return newStream;
    } catch (err: any) {
      console.error("Microphone access error:", err);
      
      let errorMessage = "Unable to access microphone.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        errorMessage = isIOS 
          ? "Microphone access denied. Please go to Settings > Safari > Microphone and allow access for this site."
          : "Microphone access denied. Please click the lock icon in your browser's address bar and allow microphone access.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No microphone detected. Please plug in a microphone or check your device settings.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Microphone is being used by another app. Please close other apps and try again.";
      } else if (err.name === 'SecurityError') {
        errorMessage = "Microphone requires HTTPS to function.";
      } else if (err.name === 'AbortError' || err.name === 'OverconstrainedError') {
        // Fallback retry with simple constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = fallbackStream;
          setStream(fallbackStream);
          setStatus('granted');
          return fallbackStream;
        } catch (retryErr) {
          errorMessage = "Unable to initialize microphone after multiple attempts.";
        }
      }

      setError(errorMessage);
      setStatus('error');
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    status,
    error,
    stream,
    requestPermission,
    stopStream,
    clearError
  };
}
