import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Brain, CheckCircle, AlertCircle, Loader, Zap, Activity } from 'lucide-react';
import { Button } from './Button';
import { useDeepgramLive } from '../hooks/useDeepgramLive';
import { LiveConnectionState } from '@deepgram/sdk';

interface DeepgramLiveSpeechProps {
  onTranscriptReady?: (transcript: string, confidence: number) => void;
  onFinalTranscript?: (transcript: string) => void;
  autoStart?: boolean;
  showInterimResults?: boolean;
  enableWordTimestamps?: boolean;
}

export const DeepgramLiveSpeech: React.FC<DeepgramLiveSpeechProps> = ({
  onTranscriptReady,
  onFinalTranscript,
  autoStart = false,
  showInterimResults = true,
  enableWordTimestamps = false
}) => {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    confidence,
    isConnected,
    isListening,
    error,
    connectionState,
    startListening,
    stopListening,
    clearTranscript,
    words
  } = useDeepgramLive();

  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !hasStarted) {
      handleStartListening();
      setHasStarted(true);
    }
  }, [autoStart, hasStarted]);

  // Notify parent components of transcript updates
  useEffect(() => {
    if (transcript && onTranscriptReady) {
      onTranscriptReady(transcript, confidence);
    }
  }, [transcript, confidence, onTranscriptReady]);

  useEffect(() => {
    if (finalTranscript && onFinalTranscript) {
      onFinalTranscript(finalTranscript);
    }
  }, [finalTranscript, onFinalTranscript]);

  const handleStartListening = async () => {
    try {
      await startListening({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: showInterimResults,
        endpointing: 300,
        vad_events: true
      });
    } catch (err) {
      console.error('Failed to start listening:', err);
    }
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleReset = () => {
    stopListening();
    clearTranscript();
    setHasStarted(false);
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case LiveConnectionState.OPEN:
        return 'text-green-600';
      case LiveConnectionState.CONNECTING:
        return 'text-yellow-600';
      case LiveConnectionState.CLOSED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    if (error) return 'Connection Error';
    
    switch (connectionState) {
      case LiveConnectionState.OPEN:
        return isListening ? 'Live Transcription Active' : 'Connected';
      case LiveConnectionState.CONNECTING:
        return 'Connecting...';
      case LiveConnectionState.CLOSED:
        return 'Disconnected';
      default:
        return 'Ready to Connect';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'text-green-600';
    if (conf >= 0.7) return 'text-blue-600';
    if (conf >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <Activity size={20} className="mr-2 text-blue-500" />
          Live Speech Recognition
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Powered by Deepgram
          </span>
        </h3>
        <p className="text-sm text-gray-600">
          Real-time speech-to-text conversion using Deepgram's Nova-2 model for high accuracy transcription.
        </p>
      </div>

      {/* Connection Status */}
      <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
        error ? 'bg-red-100' :
        isConnected ? 'bg-green-50' :
        connectionState === LiveConnectionState.CONNECTING ? 'bg-yellow-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center">
          {error ? (
            <AlertCircle size={20} className="mr-2 text-red-600" />
          ) : isListening ? (
            <Mic size={20} className="mr-2 text-green-500 animate-pulse" />
          ) : isConnected ? (
            <CheckCircle size={20} className="mr-2 text-green-600" />
          ) : connectionState === LiveConnectionState.CONNECTING ? (
            <Loader size={20} className="mr-2 text-yellow-500 animate-spin" />
          ) : (
            <MicOff size={20} className="mr-2 text-gray-500" />
          )}
          <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
        </div>
        
        {confidence > 0 && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Confidence:</span>
            <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-3 mb-6">
        {!isListening ? (
          <Button
            onClick={handleStartListening}
            variant="primary"
            icon={<Mic size={18} />}
            size="lg"
            disabled={connectionState === LiveConnectionState.CONNECTING}
          >
            {connectionState === LiveConnectionState.CONNECTING ? 'Connecting...' : 'Start Listening'}
          </Button>
        ) : (
          <Button
            onClick={handleStopListening}
            variant="danger"
            icon={<MicOff size={18} />}
            size="lg"
          >
            Stop Listening
          </Button>
        )}

        {(transcript || finalTranscript) && (
          <Button
            onClick={handleReset}
            variant="secondary"
            size="lg"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Live Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Volume2 size={16} className="mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Live Transcript:</span>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 min-h-[100px]">
            <div className="text-gray-800">
              {/* Final transcript */}
              {finalTranscript && (
                <span className="text-gray-900">{finalTranscript}</span>
              )}
              
              {/* Interim results */}
              {showInterimResults && interimTranscript && (
                <span className="text-gray-600 italic ml-1">
                  {interimTranscript}
                  <span className="animate-pulse">|</span>
                </span>
              )}
              
              {/* Show cursor when listening but no speech */}
              {isListening && !interimTranscript && !finalTranscript && (
                <span className="text-gray-400 animate-pulse">Listening...</span>
              )}
            </div>
            
            {/* Word-level confidence (if enabled) */}
            {enableWordTimestamps && words.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-xs text-gray-600 mb-2">Word-level Analysis:</div>
                <div className="flex flex-wrap gap-1">
                  {words.slice(-10).map((word, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs ${
                        word.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                        word.confidence >= 0.7 ? 'bg-blue-100 text-blue-800' :
                        word.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                      title={`Confidence: ${Math.round(word.confidence * 100)}%`}
                    >
                      {word.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deepgram Info */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-1">
          <Zap size={16} className="mr-2 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Why Deepgram?</span>
        </div>
        <p className="text-xs text-blue-700">
          Deepgram's Nova-2 model provides industry-leading accuracy for real-time speech recognition, 
          with low latency and excellent performance across different accents and audio conditions - 
          perfect for analyzing scam response training in real-time.
        </p>
      </div>
    </div>
  );
};