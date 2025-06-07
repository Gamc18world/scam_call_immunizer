import React from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { AIAnalysisResult } from '../utils/aiAnalyzer';

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
  isLoading?: boolean;
}

export const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ 
  analysis, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
        <div className="flex items-center mb-4">
          <Brain size={24} className="text-blue-600 mr-2 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-800">AI Analysis in Progress...</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'good':
        return <TrendingUp size={20} className="text-blue-600" />;
      case 'fair':
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <AlertCircle size={20} className="text-red-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
      <div className="flex items-center mb-4">
        <Brain size={24} className="text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">AI Analysis Results</h3>
      </div>

      {/* Confidence Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Confidence Score</span>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(analysis.confidence_score)}`}>
            {analysis.confidence_score}/100
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              analysis.confidence_score >= 80 ? 'bg-green-500' :
              analysis.confidence_score >= 60 ? 'bg-blue-500' :
              analysis.confidence_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${analysis.confidence_score}%` }}
          ></div>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          {getQualityIcon(analysis.quality)}
          <span className="ml-2 font-medium text-gray-800 capitalize">
            {analysis.quality} Response
          </span>
        </div>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
          {analysis.message}
        </p>
      </div>

      {/* Keywords Analysis */}
      {(analysis.positive_keywords.length > 0 || analysis.negative_keywords.length > 0) && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Detected Keywords</h4>
          
          {analysis.positive_keywords.length > 0 && (
            <div className="mb-3">
              <span className="text-sm font-medium text-green-700">✅ Positive indicators:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.positive_keywords.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.negative_keywords.length > 0 && (
            <div className="mb-3">
              <span className="text-sm font-medium text-red-700">⚠️ Areas of concern:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.negative_keywords.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scenario-Specific Insights */}
      {analysis.scenario_matches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Target size={16} className="text-purple-600 mr-1" />
            <span className="text-sm font-medium text-gray-800">Scenario Awareness</span>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
            {analysis.scenario_matches.map((match, idx) => (
              <li key={idx}>{match}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Response Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-xs text-gray-600">Word Count</span>
          <div className="text-lg font-semibold text-gray-800">{analysis.word_count}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-xs text-gray-600">Response Length</span>
          <div className="text-lg font-semibold text-gray-800 capitalize">{analysis.response_length}</div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">💡 Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
          <strong>Error:</strong> {analysis.error}
        </div>
      )}
    </div>
  );
};