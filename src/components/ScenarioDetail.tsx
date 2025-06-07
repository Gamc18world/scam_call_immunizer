import React, { useState } from 'react';
import { AlertTriangle, ChevronLeft, Brain, Mic, Upload } from 'lucide-react';
import { ScamScenario } from '../types';
import { Button } from './Button';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { AudioFileUpload } from './AudioFileUpload';
import { DeepgramLiveSpeech } from './DeepgramLiveSpeech';
import { AIAnalysisDisplay } from './AIAnalysisDisplay';
import { AIAnalyzer, AIAnalysisResult } from '../utils/aiAnalyzer';

interface ScenarioDetailProps {
  scenario: ScamScenario;
  onBack: () => void;
  onComplete: (scenarioId: string, wasSuccessful: boolean) => void;
}

export const ScenarioDetail: React.FC<ScenarioDetailProps> = ({
  scenario,
  onBack,
  onComplete
}) => {
  const [stage, setStage] = useState<'intro' | 'practice' | 'feedback'>('intro');
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ file: File; url: string } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [audioSource, setAudioSource] = useState<'recording' | 'upload' | 'live' | null>(null);
  const [inputMethod, setInputMethod] = useState<'record' | 'upload' | 'live'>('live');
  
  const handleRecordingComplete = (audioURL: string) => {
    setRecordingUrl(audioURL);
    setAudioSource('recording');
    setUploadedFile(null); // Clear uploaded file if user records
  };
  
  const handleFileUpload = (file: File, audioURL: string) => {
    setUploadedFile({ file, url: audioURL });
    setAudioSource('upload');
    setRecordingUrl(null); // Clear recording if user uploads
  };

  const handleLiveTranscript = (transcript: string, confidence: number) => {
    setUserTranscript(transcript);
    setAudioSource('live');
    setRecordingUrl(null);
    setUploadedFile(null);
  };
  
  const handleAnalyzeAudio = async (audioURL: string, fileName?: string) => {
    setIsAnalyzing(true);
    
    try {
      // In a real app, you would:
      // 1. Send audio to Deepgram for speech-to-text
      // 2. Get transcript
      // 3. Send transcript to Python AI model
      
      // For demo, we'll use the live transcript if available, otherwise simulate
      let transcript = userTranscript;
      if (!transcript) {
        transcript = await simulateTranscription();
      }
      setUserTranscript(transcript);
      
      // Analyze the response using our AI model
      const analysis = await AIAnalyzer.analyzeResponse(transcript, scenario.id);
      setAiAnalysis(analysis);
      
      // Determine if the response was successful based on AI analysis
      const wasSuccessful = analysis.confidence_score >= 60;
      onComplete(scenario.id, wasSuccessful);
      
      setStage('feedback');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to simple evaluation
      const fallbackAnalysis: AIAnalysisResult = {
        confidence_score: 50,
        quality: 'fair',
        message: 'Analysis temporarily unavailable. Your response has been recorded.',
        positive_keywords: [],
        negative_keywords: [],
        scenario_matches: [],
        recommendations: ['Try practicing more scenarios to improve your skills'],
        word_count: 0,
        response_length: 'medium',
        error: 'AI analysis service unavailable'
      };
      setAiAnalysis(fallbackAnalysis);
      onComplete(scenario.id, false);
      setStage('feedback');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSubmitResponse = async () => {
    if (audioSource === 'live' && userTranscript) {
      // For live transcription, we already have the transcript
      await handleAnalyzeAudio('', 'live-transcript');
    } else {
      const audioURL = audioSource === 'recording' ? recordingUrl : uploadedFile?.url;
      if (!audioURL) return;
      
      await handleAnalyzeAudio(audioURL, uploadedFile?.file.name);
    }
  };
  
  // Simulate speech-to-text conversion
  const simulateTranscription = async (): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic responses based on scenario
    const responses = {
      'call-1': [
        "No, I don't believe this is real. The IRS sends written notices, not phone calls. I'm hanging up now.",
        "This sounds like a scam. I will verify this by calling the IRS directly using their official number.",
        "I'm not giving you any information. Government agencies don't threaten arrest over the phone.",
        "Okay, what do I need to do? How much do I owe?", // Poor response
        "Um, this is scary. Can you help me fix this problem?" // Poor response
      ],
      'call-2': [
        "Microsoft doesn't make unsolicited calls about computer problems. This is a scam. Goodbye.",
        "No, I'm not interested. I know this is a tech support scam.",
        "I don't need help with my computer. Please remove my number from your list.",
        "Oh no, my computer has a virus? Can you help me fix it?", // Poor response
        "Yes, please help me. What do I need to do?" // Poor response
      ],
      'text-1': [
        "I will check my account through the official bank app, not by calling this number.",
        "This looks like a scam text. I'm deleting it and reporting it to my bank.",
        "Banks don't send urgent texts like this. I'll ignore this message.",
        "Oh no, I better call that number right away!", // Poor response
        "This is urgent, I need to call immediately." // Poor response
      ],
      'text-2': [
        "I'll check my package status through the official delivery company website.",
        "This link looks suspicious. I'm not clicking it.",
        "I didn't order anything recently. This is probably a scam.",
        "I better click this link to reschedule my delivery.", // Poor response
        "Let me click here to fix my address." // Poor response
      ]
    };
    
    const scenarioResponses = responses[scenario.id as keyof typeof responses] || responses['call-1'];
    
    // Randomly select a response (weighted toward good responses for demo)
    const isGoodResponse = Math.random() > 0.3;
    const goodResponses = scenarioResponses.slice(0, 3);
    const poorResponses = scenarioResponses.slice(3);
    
    return isGoodResponse 
      ? goodResponses[Math.floor(Math.random() * goodResponses.length)]
      : poorResponses[Math.floor(Math.random() * poorResponses.length)];
  };
  
  const hasAudioInput = (recordingUrl && audioSource === 'recording') || 
                       (uploadedFile && audioSource === 'upload') ||
                       (userTranscript && audioSource === 'live');
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-blue-800 p-4 text-white">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-2 p-1 rounded hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">{scenario.title}</h2>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {stage === 'intro' && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Scenario:</h3>
              <div className="p-4 bg-gray-100 rounded-lg mb-4 text-gray-800">
                {scenario.content}
              </div>
              
              <div className="flex items-start mb-4">
                <AlertTriangle size={20} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-gray-700">
                  {scenario.type === 'call' 
                    ? 'Listen to this scam call and practice your response. You can use live transcription, record your voice, or upload an audio file. Our AI will analyze your response and provide personalized feedback.' 
                    : 'Read this scam message and practice how you would respond. You can use live transcription, record your voice, or upload an audio file. Our AI will evaluate your response quality.'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {scenario.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg mb-6 border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <Brain size={20} className="text-purple-600 mr-2" />
                <span className="font-medium text-purple-800">AI-Powered Analysis with Deepgram</span>
              </div>
              <p className="text-purple-700 text-sm">
                Your response will be transcribed using Deepgram's advanced speech recognition and analyzed 
                by our AI model that evaluates scam awareness, confidence level, and provides personalized 
                recommendations for improvement.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={() => setStage('practice')}>
                Start Practice
              </Button>
            </div>
          </>
        )}
        
        {stage === 'practice' && (
          <div className="space-y-6">
            {scenario.type === 'call' && scenario.audioUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Listen to the call:</h3>
                <AudioPlayer 
                  src={scenario.audioUrl} 
                  title="Scam call audio"
                />
              </div>
            )}
            
            {scenario.type === 'text' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Read the message:</h3>
                <div className="p-4 bg-gray-100 rounded-lg mb-4 border-l-4 border-blue-500">
                  <p className="text-gray-800">{scenario.content}</p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Provide your response:</h3>
              <p className="text-gray-600 mb-4">
                How would you respond to this {scenario.type === 'call' ? 'call' : 'message'}? 
                Choose your preferred input method below. Our AI will analyze your response for effectiveness.
              </p>
              
              {/* Input Method Selection */}
              <div className="mb-4">
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setInputMethod('live')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      inputMethod === 'live'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Brain size={16} className="inline mr-1" />
                    Live Speech
                  </button>
                  <button
                    onClick={() => setInputMethod('record')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      inputMethod === 'record'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Mic size={16} className="inline mr-1" />
                    Record Audio
                  </button>
                  <button
                    onClick={() => setInputMethod('upload')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      inputMethod === 'upload'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Upload size={16} className="inline mr-1" />
                    Upload File
                  </button>
                </div>
              </div>
              
              {/* Audio Input Component */}
              {inputMethod === 'live' ? (
                <DeepgramLiveSpeech 
                  onTranscriptReady={handleLiveTranscript}
                  showInterimResults={true}
                />
              ) : inputMethod === 'record' ? (
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              ) : (
                <AudioFileUpload 
                  onFileSelect={handleFileUpload}
                  onAnalysisRequest={handleAnalyzeAudio}
                />
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setStage('intro')}
              >
                Back
              </Button>
              <Button 
                disabled={!hasAudioInput || isAnalyzing}
                onClick={handleSubmitResponse}
                icon={isAnalyzing ? <Brain size={18} className="animate-pulse" /> : undefined}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Response'}
              </Button>
            </div>
          </div>
        )}
        
        {stage === 'feedback' && (
          <div className="space-y-6">
            {/* AI Analysis Results */}
            <AIAnalysisDisplay 
              analysis={aiAnalysis!} 
              isLoading={isAnalyzing}
            />
            
            {/* User's Response */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Response:</h3>
              {userTranscript && (
                <div className="mb-3 p-3 bg-white rounded border-l-4 border-blue-500">
                  <p className="text-gray-800 italic">"{userTranscript}"</p>
                  {audioSource === 'live' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Source: Live Deepgram transcription
                    </div>
                  )}
                </div>
              )}
              {(recordingUrl || uploadedFile) && (
                <div>
                  <audio 
                    src={audioSource === 'recording' ? recordingUrl! : uploadedFile!.url} 
                    controls 
                    className="w-full" 
                  />
                  {uploadedFile && (
                    <div className="mt-2 text-xs text-gray-500">
                      Source: {uploadedFile.file.name}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setStage('practice');
                  setRecordingUrl(null);
                  setUploadedFile(null);
                  setAiAnalysis(null);
                  setUserTranscript('');
                  setAudioSource(null);
                }}
              >
                Try Again
              </Button>
              <Button onClick={onBack}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};