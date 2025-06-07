import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { Button } from './Button';

interface AudioFileUploadProps {
  onFileSelect?: (file: File, audioURL: string) => void;
  onAnalysisRequest?: (audioURL: string, fileName: string) => void;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
}

export const AudioFileUpload: React.FC<AudioFileUploadProps> = ({
  onFileSelect,
  onAnalysisRequest,
  acceptedFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
  maxSizeInMB = 10
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `File type not supported. Please upload: ${acceptedFormats.join(', ')}`;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB.`;
    }
    
    // Check if it's actually an audio file
    if (!file.type.startsWith('audio/')) {
      return 'Please upload a valid audio file.';
    }
    
    return null;
  };
  
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Clean up previous file
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    setError(null);
    setSelectedFile(file);
    
    // Create audio URL for playback
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    
    // Notify parent component
    if (onFileSelect) {
      onFileSelect(file, url);
    }
  };
  
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setSelectedFile(null);
    setAudioURL(null);
    setError(null);
    setIsAnalyzing(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAnalyzeFile = async () => {
    if (!audioURL || !selectedFile) return;
    
    setIsAnalyzing(true);
    
    try {
      if (onAnalysisRequest) {
        await onAnalysisRequest(audioURL, selectedFile.name);
      }
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div className="w-full bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Audio File</h3>
        <p className="text-sm text-gray-600">
          Upload an audio file to analyze your scam response. Supported formats: {acceptedFormats.join(', ')}
        </p>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {!selectedFile ? (
        /* Upload Area */
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={48} className={`mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragOver ? 'Drop your audio file here' : 'Drag and drop your audio file here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            icon={<Upload size={18} />}
          >
            Choose File
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Maximum file size: {maxSizeInMB}MB</p>
            <p>Supported formats: {acceptedFormats.join(', ')}</p>
          </div>
        </div>
      ) : (
        /* File Selected */
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <File size={24} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Audio Player */}
          {audioURL && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
              <audio 
                src={audioURL} 
                controls 
                className="w-full"
                preload="metadata"
              />
            </div>
          )}
          
          {/* Success Message */}
          <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <p>File uploaded successfully! Ready for AI analysis.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleAnalyzeFile}
              variant="primary"
              icon={isAnalyzing ? <Brain size={18} className="animate-pulse" /> : <Brain size={18} />}
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
            </Button>
            
            <Button
              onClick={handleRemoveFile}
              variant="secondary"
              icon={<X size={18} />}
              size="lg"
            >
              Remove File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};