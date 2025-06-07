import { createClient, LiveTranscriptionEvents, LiveConnectionState } from '@deepgram/sdk';

export interface DeepgramConfig {
  model?: string;
  language?: string;
  smart_format?: boolean;
  punctuate?: boolean;
  diarize?: boolean;
  interim_results?: boolean;
  endpointing?: number;
  vad_events?: boolean;
  encoding?: string;
  sample_rate?: number;
  channels?: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  is_final: boolean;
  speaker?: number;
  start?: number;
  end?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class DeepgramLiveTranscription {
  private client: any;
  private connection: any;
  private isConnected: boolean = false;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = createClient(apiKey);
  }

  /**
   * Start live transcription session
   */
  async startLiveTranscription(
    config: DeepgramConfig = {},
    onTranscript?: (result: TranscriptionResult) => void,
    onError?: (error: any) => void,
    onConnectionChange?: (state: LiveConnectionState) => void
  ): Promise<void> {
    try {
      // Default configuration optimized for scam response analysis
      const defaultConfig = {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: true,
        endpointing: 300, // 300ms of silence before finalizing
        vad_events: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        ...config
      };

      // Create live transcription connection
      this.connection = this.client.listen.live(defaultConfig);

      // Set up event listeners
      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
        this.isConnected = true;
        if (onConnectionChange) {
          onConnectionChange(LiveConnectionState.OPEN);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        this.isConnected = false;
        if (onConnectionChange) {
          onConnectionChange(LiveConnectionState.CLOSED);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
        if (onError) {
          onError(error);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const result = data.channel?.alternatives?.[0];
        if (result && onTranscript) {
          const transcriptionResult: TranscriptionResult = {
            transcript: result.transcript || '',
            confidence: result.confidence || 0,
            is_final: data.is_final || false,
            speaker: data.channel?.speaker,
            start: data.start,
            end: data.end,
            words: result.words?.map((word: any) => ({
              word: word.word,
              start: word.start,
              end: word.end,
              confidence: word.confidence
            }))
          };
          onTranscript(transcriptionResult);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
        console.log('Deepgram metadata:', data);
      });

      this.connection.on(LiveTranscriptionEvents.SpeechStarted, () => {
        console.log('Speech started');
      });

      this.connection.on(LiveTranscriptionEvents.UtteranceEnd, (data: any) => {
        console.log('Utterance ended:', data);
      });

    } catch (error) {
      console.error('Failed to start Deepgram live transcription:', error);
      throw error;
    }
  }

  /**
   * Send audio data to Deepgram
   */
  sendAudio(audioData: ArrayBuffer | Uint8Array): void {
    if (this.connection && this.isConnected) {
      this.connection.send(audioData);
    } else {
      console.warn('Deepgram connection not ready');
    }
  }

  /**
   * Stop live transcription
   */
  stopTranscription(): void {
    if (this.connection) {
      this.connection.finish();
      this.isConnected = false;
    }
  }

  /**
   * Check if connection is active
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Transcribe pre-recorded audio file
   */
  async transcribeFile(
    audioFile: File | Blob,
    config: DeepgramConfig = {}
  ): Promise<TranscriptionResult> {
    try {
      const defaultConfig = {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        diarize: false,
        ...config
      };

      const response = await this.client.listen.prerecorded.transcribeFile(
        audioFile,
        defaultConfig
      );

      const result = response.result?.channels?.[0]?.alternatives?.[0];
      
      if (!result) {
        throw new Error('No transcription result received');
      }

      return {
        transcript: result.transcript || '',
        confidence: result.confidence || 0,
        is_final: true,
        words: result.words?.map((word: any) => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        }))
      };

    } catch (error) {
      console.error('Deepgram file transcription error:', error);
      throw error;
    }
  }

  /**
   * Test API key validity
   */
  async testConnection(): Promise<boolean> {
    try {
      // Create a minimal test by checking projects
      const response = await this.client.manage.getProjects();
      return response.projects && Array.isArray(response.projects);
    } catch (error) {
      console.error('Deepgram API key test failed:', error);
      return false;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsage(startDate?: string, endDate?: string): Promise<any> {
    try {
      const projectId = await this.getProjectId();
      return await this.client.manage.getUsage(projectId, {
        start: startDate,
        end: endDate
      });
    } catch (error) {
      console.error('Failed to get usage:', error);
      return null;
    }
  }

  /**
   * Get project ID for usage tracking
   */
  private async getProjectId(): Promise<string> {
    const response = await this.client.manage.getProjects();
    return response.projects[0]?.project_id;
  }
}

// Create singleton instance with your API key
export const deepgramClient = new DeepgramLiveTranscription('c7da5cd5af50454da3ff48443be2e67221c9a43d');