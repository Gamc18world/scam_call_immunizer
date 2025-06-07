/**
 * OpenAI Whisper API integration for speech-to-text
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language?: string;
  duration?: number;
}

export interface WhisperConfig {
  model?: 'whisper-1';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export class OpenAIWhisper {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/audio/transcriptions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Convert audio blob to text using OpenAI Whisper API
   */
  async transcribeAudio(
    audioBlob: Blob,
    config: WhisperConfig = {}
  ): Promise<SpeechRecognitionResult> {
    try {
      // Prepare form data
      const formData = new FormData();
      
      // Convert blob to file with proper extension
      const audioFile = new File([audioBlob], 'audio.webm', { 
        type: audioBlob.type || 'audio/webm' 
      });
      
      formData.append('file', audioFile);
      formData.append('model', config.model || 'whisper-1');
      formData.append('response_format', config.response_format || 'verbose_json');
      
      if (config.language) {
        formData.append('language', config.language);
      }
      
      if (config.prompt) {
        formData.append('prompt', config.prompt);
      }
      
      if (config.temperature !== undefined) {
        formData.append('temperature', config.temperature.toString());
      }

      // Make API request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI Whisper API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (config.response_format === 'verbose_json') {
        return {
          transcript: data.text || '',
          confidence: this.calculateConfidence(data),
          isFinal: true,
          language: data.language,
          duration: data.duration
        };
      } else {
        // Simple text response
        return {
          transcript: typeof data === 'string' ? data : (data.text || ''),
          confidence: 0.95, // Whisper doesn't provide confidence, so we use a high default
          isFinal: true
        };
      }
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence score from Whisper response
   * Whisper doesn't provide confidence directly, so we estimate based on other factors
   */
  private calculateConfidence(data: any): number {
    // Base confidence for Whisper (generally very accurate)
    let confidence = 0.95;
    
    // Reduce confidence if text is very short (might be unclear audio)
    if (data.text && data.text.length < 10) {
      confidence -= 0.1;
    }
    
    // Reduce confidence if duration is very short
    if (data.duration && data.duration < 1) {
      confidence -= 0.05;
    }
    
    // Check for segments with low probability (if available)
    if (data.segments && Array.isArray(data.segments)) {
      const avgProbability = data.segments.reduce((sum: number, segment: any) => {
        return sum + (segment.avg_logprob || 0);
      }, 0) / data.segments.length;
      
      // Convert log probability to confidence (rough approximation)
      if (avgProbability < -1) {
        confidence -= 0.1;
      }
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Check if the API key is valid by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Create a minimal test audio (silence)
      const testAudio = this.createSilentAudioBlob();
      await this.transcribeAudio(testAudio);
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Create a small silent audio blob for testing
   */
  private createSilentAudioBlob(): Blob {
    // Create a minimal WAV file with silence
    const sampleRate = 16000;
    const duration = 0.5; // 500ms
    const numSamples = sampleRate * duration;
    
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Silent audio data (all zeros)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Get supported audio formats for Whisper
   */
  static getSupportedFormats(): string[] {
    return [
      'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
    ];
  }

  /**
   * Check if audio format is supported
   */
  static isFormatSupported(mimeType: string): boolean {
    const supportedTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a',
      'audio/wav', 'audio/webm', 'audio/ogg'
    ];
    return supportedTypes.some(type => mimeType.includes(type));
  }
}

// Create singleton instance
export const speechToText = new OpenAIWhisper(
  import.meta.env.VITE_OPENAI_API_KEY || ''
);