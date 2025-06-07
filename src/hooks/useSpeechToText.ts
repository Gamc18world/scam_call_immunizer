import { useState, useCallback } from 'react';
import { speechToText, SpeechRecognitionResult, WhisperConfig } from '../utils/speechToText';

interface UseSpeechToTextResult {
  transcript: string;
  confidence: number;
  language?: string;
  duration?: number;
  isTranscribing: boolean;
  error: string | null;
  transcribeAudio: (audioBlob: Blob, config?: WhisperConfig) => Promise<void>;
  clearTranscript: () => void;
  validateApiKey: () => Promise<boolean>;
}

export function useSpeechToText(): UseSpeechToTextResult {
  const [transcript, setTranscript] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeAudio = useCallback(async (
    audioBlob: Blob, 
    config?: WhisperConfig
  ) => {
    setIsTranscribing(true);
    setError(null);
    
    try {
      // Check if audio format is supported
      if (!speechToText.constructor.isFormatSupported(audioBlob.type)) {
        console.warn(`Audio format ${audioBlob.type} might not be optimal for Whisper. Converting...`);
      }

      const result: SpeechRecognitionResult = await speechToText.transcribeAudio(audioBlob, {
        response_format: 'verbose_json',
        language: 'en', // Can be made configurable
        temperature: 0, // More deterministic results
        ...config
      });
      
      setTranscript(result.transcript);
      setConfidence(result.confidence);
      setLanguage(result.language);
      setDuration(result.duration);
      
      if (!result.transcript || result.transcript.trim().length === 0) {
        setError('No speech detected in the audio. Please try speaking more clearly or check your microphone.');
      }
    } catch (err) {
      let errorMessage = 'Failed to transcribe audio';
      
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
        } else if (err.message.includes('quota')) {
          errorMessage = 'API quota exceeded. Please check your OpenAI usage limits.';
        } else if (err.message.includes('file size')) {
          errorMessage = 'Audio file is too large. Please try a shorter recording.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Speech-to-text error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setLanguage(undefined);
    setDuration(undefined);
    setError(null);
  }, []);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    try {
      return await speechToText.validateApiKey();
    } catch (err) {
      console.error('API key validation error:', err);
      return false;
    }
  }, []);

  return {
    transcript,
    confidence,
    language,
    duration,
    isTranscribing,
    error,
    transcribeAudio,
    clearTranscript,
    validateApiKey
  };
}