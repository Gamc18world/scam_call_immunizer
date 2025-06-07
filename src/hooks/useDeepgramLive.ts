import { useState, useEffect, useRef, useCallback } from 'react';
import { deepgramClient, TranscriptionResult, DeepgramConfig } from '../utils/deepgramClient';
import { LiveConnectionState } from '@deepgram/sdk';

interface UseDeepgramLiveResult {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  confidence: number;
  isConnected: boolean;
  isListening: boolean;
  error: string | null;
  connectionState: LiveConnectionState | null;
  startListening: (config?: DeepgramConfig) => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export function useDeepgramLive(): UseDeepgramLiveResult {
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<LiveConnectionState | null>(null);
  const [words, setWords] = useState<Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startListening = useCallback(async (config?: DeepgramConfig) => {
    try {
      setError(null);
      setIsListening(true);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      streamRef.current = stream;

      // Set up audio processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create script processor for audio data
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (deepgramClient.isConnectionActive()) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Convert float32 to int16
          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Send audio data to Deepgram
          deepgramClient.sendAudio(int16Array.buffer);
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // Start Deepgram live transcription
      await deepgramClient.startLiveTranscription(
        config,
        (result: TranscriptionResult) => {
          if (result.is_final) {
            setFinalTranscript(prev => prev + ' ' + result.transcript);
            setInterimTranscript('');
            setTranscript(prev => prev + ' ' + result.transcript);
          } else {
            setInterimTranscript(result.transcript);
          }
          
          setConfidence(result.confidence);
          
          if (result.words) {
            setWords(result.words);
          }
        },
        (error: any) => {
          console.error('Deepgram transcription error:', error);
          setError(error.message || 'Transcription error occurred');
        },
        (state: LiveConnectionState) => {
          setConnectionState(state);
          setIsConnected(state === LiveConnectionState.OPEN);
        }
      );

    } catch (err) {
      console.error('Failed to start listening:', err);
      setError(err instanceof Error ? err.message : 'Failed to start listening');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);

    // Stop Deepgram connection
    deepgramClient.stopTranscription();

    // Clean up audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsConnected(false);
    setConnectionState(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setConfidence(0);
    setWords([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    transcript: transcript.trim(),
    interimTranscript,
    finalTranscript: finalTranscript.trim(),
    confidence,
    isConnected,
    isListening,
    error,
    connectionState,
    startListening,
    stopListening,
    clearTranscript,
    words
  };
}