import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Brain, CheckCircle, AlertCircle, Loader, Zap } from 'lucide-react';
import { Button } from './Button';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useDeepgramLive } from '../hooks/useDeepgramLive';

interface LiveSpeechRecognitionProps {
  onTranscriptReady?: (transcript: string, confidence: number) => void;
  onRecordingComplete?: (audioURL: string, transcript: string) => void;
  autoTranscribe?: boolean;
}

export const LiveSpeechRecognition: React.FC<LiveSpeechRecognitionProps> = ({
  onTranscriptReady,
  onRecordingComplete,
  autoTranscribe = true
}) => {
  const {
    recordingState,
    audioURL,
    isRecording,
    startRecording,
    stopRecording,
    resetRecording,
    error: recordingError,
    duration
  } = useAudioRecorder();

  const {
    transcript,
    finalTranscript,
    confidence,
    isConnected,
    isListening,
    error: transcriptionError,
    startListening,
    stopListening,
    clearTranscript
  } = useDeepgramLive();

  const [mode, setMode] = useState<'live' | 'record'>('live');
  const [hasTranscribed, setHasTranscribed] = useState(false);

  // Notify parent when transcript is ready
  useEffect(() => {
    if (finalTranscript && onTranscriptReady) {
      onTranscriptReady(finalTranscript, confidence);
    }
  }, [finalTranscript, confidence, onTranscriptReady]);

  // Notify parent when recording and transcription are complete
  useEffect(() => {
    if (audioURL && finalTranscript && onRecordingComplete) {
      onRecordingComplete(audioURL, finalTranscript);
    }
  }, [audioURL, finalTranscript, onRecordingComplete]);

  const handleStartLiveMode = async () => {
    setMode('live');
    clearTranscript();
    await startListening();
  };

  const handleStopLiveMode = () => {
    stopListening();
  };

  const handleStartRecording = async () => {
    setMode('record');
    setHasTranscribed(false);
    clearTranscript();
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReset = () => {
    if (mode === 'live') {
      stopListening();
      clearTranscript();
    } else {
      resetRecording();
      clearTranscript();
      setHasTranscribed(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatusColor = () => {
    if (recordingError || transcriptionError) return 'text-red-600';
    if (mode === 'live') {
      if (isListening) return 'text-green-500';
      if (isConnected) return 'text-blue-500';
      return 'text-gray-600';
    } else {
      if (isRecording) return 'text-red-500';
      if (finalTranscript) return 'text-green-600';
      return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    if (recordingError) return `Recording error: ${recordingError}`;
    if (transcriptionError) return `Transcription error: ${transcriptionError}`;
    
    if (mode === 'live') {
      if (isListening) return 'Live transcription active - speak now';
      if (isConnected) return 'Connected to Deepgram - ready to listen';
      return 'Ready to start live transcription';
    } else {
      if (isRecording) return 'Recording your response...';
      if (finalTranscript) return 'Speech recognition complete!';
      if (recordingState === 'stopped') return 'Recording complete';
      return 'Ready to record your response';
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
          <Zap size={20} className="mr-2 text-orange-500" />
          Live Speech Recognition
          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            Powered by Deepgram
          </span>
        </h3>
        <p className="text-sm text-gray-600">
          Choose between live real-time transcription or record-then-transcribe mode using Deepgram's advanced speech recognition.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setMode('live')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'live'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Zap size={16} className="inline mr-1" />
            Live Mode
          </button>
          <button
            onClick={() => setMode('record')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'record'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Mic size={16} className="inline mr-1" />
            Record Mode
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
        recordingError || transcriptionError ? 'bg-red-100' :
        (mode === 'live' && isListening) || (mode === 'record' && isRecording) ? 'bg-green-50' :
        finalTranscript ? 'bg-green-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center">
          {recordingError || transcriptionError ? (
            <AlertCircle size={20} className="mr-2 text-red-600" />
          ) : (mode === 'live' && isListening) || (mode === 'record' && isRecording) ? (
            <Mic size={20} className="mr-2 text-green-500 animate-pulse" />
          ) : finalTranscript ? (
            <CheckCircle size={20} className="mr-2 text-green-600" />
          ) : (
            <MicOff size={20} className="mr-2 text-gray-500" />
          )}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
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

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        {/* Timer (for record mode) */}
        {mode === 'record' && (
          <div className="text-2xl font-bold text-gray-800">
            {formatTime(duration)}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-3">
          {mode === 'live' ? (
            <>
              {!isListening ? (
                <Button
                  onClick={handleStartLiveMode}
                  variant="primary"
                  icon={<Zap size={18} />}
                  size="lg"
                >
                  Start Live Transcription
                </Button>
              ) : (
                <Button
                  onClick={handleStopLiveMode}
                  variant="danger"
                  icon={<MicOff size={18} />}
                  size="lg"
                >
                  Stop Listening
                </Button>
              )}
            </>
          ) : (
            <>
              {!isRecording && recordingState !== 'stopped' && (
                <Button
                  onClick={handleStartRecording}
                  variant="primary"
                  icon={<Mic size={18} />}
                  size="lg"
                >
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={handleStopRecording}
                  variant="danger"
                  icon={<MicOff size={18} />}
                  size="lg"
                >
                  Stop Recording
                </Button>
              )}
            </>
          )}

          {(finalTranscript || (mode === 'record' && recordingState === 'stopped')) && (
            <Button
              onClick={handleReset}
              variant="secondary"
              size="lg"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Audio Playback (record mode only) */}
      {mode === 'record' && audioURL && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-3">
            <Volume2 size={16} className="mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Your Recording:</span>
          </div>
          <audio 
            src={audioURL} 
            controls 
            className="w-full"
            preload="metadata"
          />
          <div className="mt-2 text-xs text-gray-500">
            Duration: {formatTime(duration)}
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {finalTranscript && (
        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800 flex items-center">
              <Zap size={14} className="mr-1" />
              Deepgram Transcript:
            </span>
            <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
              Confidence: {Math.round(confidence * 100)}%
            </span>
          </div>
          <p className="text-gray-800 italic mb-2">"{finalTranscript}"</p>
        </div>
      )}

      {/* Live transcript preview (live mode only) */}
      {mode === 'live' && transcript && !finalTranscript && (
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-blue-800 flex items-center">
              <Zap size={14} className="mr-1" />
              Live Preview:
            </span>
          </div>
          <p className="text-gray-800 italic">
            "{transcript}"
            <span className="animate-pulse ml-1">|</span>
          </p>
        </div>
      )}

      {/* Deepgram Info */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center mb-1">
          <Zap size={16} className="mr-2 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Why Deepgram?</span>
        </div>
        <p className="text-xs text-orange-700">
          Deepgram provides industry-leading real-time speech recognition with low latency, high accuracy, 
          and excellent performance across different accents and audio conditions - perfect for analyzing 
          scam response training with immediate feedback.
        </p>
      </div>
    </div>
  );
};