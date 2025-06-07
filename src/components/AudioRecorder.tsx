import React, { useState, useEffect } from 'react';
import { Mic, Square, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Button } from './Button';

interface AudioRecorderProps {
  onRecordingComplete?: (audioURL: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const {
    recordingState,
    audioURL,
    isRecording,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    duration
  } = useAudioRecorder();
  
  const [animatePulse, setAnimatePulse] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  // Check microphone permissions on component mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicrophonePermission(permission.state);
          
          permission.addEventListener('change', () => {
            setMicrophonePermission(permission.state);
          });
        }
      } catch (err) {
        console.log('Permission API not supported');
      }
    };
    
    checkMicrophonePermission();
  }, []);
  
  // Notify parent component when recording is complete
  useEffect(() => {
    if (audioURL && onRecordingComplete) {
      onRecordingComplete(audioURL);
    }
  }, [audioURL, onRecordingComplete]);
  
  // Animate recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulseInterval = window.setInterval(() => {
        setAnimatePulse(prev => !prev);
      }, 1000);
      
      return () => {
        clearInterval(pulseInterval);
      };
    } else {
      setAnimatePulse(false);
    }
  }, [isRecording]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg p-6 shadow-md border border-gray-200">
      {/* Permission Status */}
      {microphonePermission === 'denied' && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Microphone access denied</p>
            <p className="text-sm">Please enable microphone permissions in your browser settings and refresh the page.</p>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Recording Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {audioURL && recordingState === 'stopped' && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
          <CheckCircle size={20} className="mr-2 flex-shrink-0" />
          <p>Recording completed successfully! Duration: {formatTime(duration)}</p>
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Indicator */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {isRecording && (
            <>
              <div className={`absolute inset-0 rounded-full bg-red-500 opacity-20 ${animatePulse ? 'scale-125' : 'scale-100'} transition-all duration-1000`}></div>
              <div className={`absolute inset-2 rounded-full bg-red-500 opacity-30 ${animatePulse ? 'scale-110' : 'scale-100'} transition-all duration-1000`}></div>
            </>
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording ? 'bg-red-500 shadow-lg' : 
            recordingState === 'stopped' ? 'bg-green-500' :
            'bg-gray-200 hover:bg-gray-300'
          }`}>
            <Mic size={28} className={`${
              isRecording ? 'text-white' : 
              recordingState === 'stopped' ? 'text-white' :
              'text-gray-500'
            }`} />
          </div>
        </div>
        
        {/* Timer and Status */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {formatTime(duration)}
          </div>
          <div className="text-sm text-gray-600">
            {isRecording ? 'Recording...' : 
             recordingState === 'stopped' ? 'Recording complete' :
             'Ready to record'}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex space-x-3">
          {!isRecording && recordingState !== 'stopped' && (
            <Button 
              onClick={handleStartRecording}
              variant="primary"
              icon={<Mic size={18} />}
              disabled={microphonePermission === 'denied'}
              size="lg"
            >
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <Button 
              onClick={stopRecording}
              variant="danger"
              icon={<Square size={18} />}
              size="lg"
            >
              Stop Recording
            </Button>
          )}
          
          {recordingState === 'stopped' && (
            <Button 
              onClick={resetRecording}
              variant="secondary"
              icon={<RotateCcw size={18} />}
              size="lg"
            >
              Record Again
            </Button>
          )}
        </div>
        
        {/* Browser Compatibility Info */}
        {microphonePermission === 'unknown' && (
          <div className="text-xs text-gray-500 text-center max-w-md">
            <p>Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge) for the best recording experience.</p>
          </div>
        )}
      </div>
      
      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Your recording:</p>
          <audio 
            src={audioURL} 
            controls 
            className="w-full"
            preload="metadata"
          />
          <div className="mt-2 text-xs text-gray-500">
            Duration: {formatTime(duration)} • Ready for AI analysis
          </div>
        </div>
      )}
    </div>
  );
};