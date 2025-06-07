import { useState, useRef, useCallback } from 'react';

type RecordingState = 'inactive' | 'recording' | 'paused' | 'stopped';

interface AudioRecorderResult {
  recordingState: RecordingState;
  audioURL: string | null;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  duration: number;
}

export function useAudioRecorder(): AudioRecorderResult {
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  
  const startRecording = useCallback(async () => {
    try {
      // Reset previous recordings and errors
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      audioChunksRef.current = [];
      setError(null);
      setDuration(0);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
      }
      
      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in your browser.');
      }
      
      // Determine the best audio format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorder.addEventListener('stop', () => {
        if (audioChunksRef.current.length === 0) {
          setError('No audio data was recorded. Please try again.');
          setRecordingState('inactive');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/wav' 
        });
        
        if (audioBlob.size === 0) {
          setError('Recording failed - no audio data captured.');
          setRecordingState('inactive');
          return;
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingState('stopped');
        
        // Stop duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        
        // Stop all tracks from the stream to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          streamRef.current = null;
        }
      });
      
      mediaRecorder.addEventListener('error', (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed due to an error. Please try again.');
        setRecordingState('inactive');
      });
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');
      startTimeRef.current = Date.now();
      
      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      
      let errorMessage = 'Could not access microphone. ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please allow microphone access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please connect a microphone and try again.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Your browser does not support audio recording.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Please check your microphone permissions and try again.';
      }
      
      setError(errorMessage);
      setRecordingState('inactive');
      
      // Clean up stream if it was created
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [audioURL]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);
  
  const resetRecording = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up audio URL
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    setAudioURL(null);
    setRecordingState('inactive');
    setError(null);
    setDuration(0);
    audioChunksRef.current = [];
  }, [audioURL, recordingState]);
  
  return {
    recordingState,
    audioURL,
    isRecording: recordingState === 'recording',
    startRecording,
    stopRecording,
    resetRecording,
    error,
    duration
  };
}