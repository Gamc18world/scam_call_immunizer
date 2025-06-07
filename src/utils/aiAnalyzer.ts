/**
 * AI Analyzer utility for integrating with Python-based scam response analysis
 */

export interface AIAnalysisResult {
  confidence_score: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'error';
  message: string;
  positive_keywords: string[];
  negative_keywords: string[];
  scenario_matches: string[];
  recommendations: string[];
  word_count: number;
  response_length: 'short' | 'medium' | 'long';
  error?: string;
}

export class AIAnalyzer {
  /**
   * Analyze user response using Python AI model
   */
  static async analyzeResponse(
    responseText: string, 
    scenarioId?: string
  ): Promise<AIAnalysisResult> {
    try {
      // In a real application, this would call your Python backend
      // For demo purposes, we'll simulate the Python analysis
      const simulatedResult = this.simulatePythonAnalysis(responseText, scenarioId);
      
      // In production, you would make an API call like:
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: responseText, scenario_id: scenarioId })
      // });
      // return await response.json();
      
      return simulatedResult;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return {
        confidence_score: 0,
        quality: 'error',
        message: 'Analysis temporarily unavailable',
        positive_keywords: [],
        negative_keywords: [],
        scenario_matches: [],
        recommendations: ['Try again later'],
        word_count: 0,
        response_length: 'short',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Simulate Python AI analysis for demonstration
   * This mimics what the Python model would return
   */
  private static simulatePythonAnalysis(
    responseText: string, 
    scenarioId?: string
  ): AIAnalysisResult {
    const text = responseText.toLowerCase();
    const words = responseText.split(/\s+/);
    
    // Simulate keyword detection
    const positiveKeywords = [
      'no', 'not interested', 'hang up', 'verify', 'scam', 'fake', 'suspicious'
    ].filter(keyword => text.includes(keyword));
    
    const negativeKeywords = [
      'okay', 'yes', 'sure', 'help me', 'what do i do'
    ].filter(keyword => text.includes(keyword));
    
    // Calculate simulated confidence score
    let score = 50; // Base score
    score += positiveKeywords.length * 15;
    score -= negativeKeywords.length * 20;
    
    // Scenario-specific bonuses
    const scenarioMatches: string[] = [];
    if (scenarioId === 'call-1' && text.includes('irs')) {
      score += 10;
      scenarioMatches.push('recognized IRS scam pattern');
    }
    if (scenarioId === 'call-2' && text.includes('microsoft')) {
      score += 10;
      scenarioMatches.push('recognized tech support scam');
    }
    
    // Normalize score
    const confidence_score = Math.max(0, Math.min(100, score));
    
    // Determine quality
    let quality: AIAnalysisResult['quality'];
    let message: string;
    
    if (confidence_score >= 80) {
      quality = 'excellent';
      message = 'Outstanding response! You demonstrated strong scam awareness and would likely avoid this scam.';
    } else if (confidence_score >= 60) {
      quality = 'good';
      message = 'Good response! You showed awareness of scam tactics, with room for minor improvements.';
    } else if (confidence_score >= 40) {
      quality = 'fair';
      message = 'Fair response, but could be improved. Consider being more assertive in rejecting suspicious requests.';
    } else {
      quality = 'poor';
      message = 'Your response suggests vulnerability to this scam. Practice being more skeptical and assertive.';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (confidence_score < 60) {
      recommendations.push("Practice saying 'no' firmly and hanging up immediately");
      recommendations.push("Remember: legitimate organizations don't create false urgency");
    }
    if (positiveKeywords.length === 0) {
      recommendations.push("Use phrases like 'I need to verify this' or 'I'll call back through official channels'");
    }
    if (negativeKeywords.length > 0) {
      recommendations.push("Avoid showing panic or agreeing to demands from unknown callers");
    }
    if (confidence_score >= 80) {
      recommendations.push("Excellent work! Consider helping others learn these skills");
    }
    
    return {
      confidence_score,
      quality,
      message,
      positive_keywords: positiveKeywords,
      negative_keywords: negativeKeywords,
      scenario_matches: scenarioMatches,
      recommendations,
      word_count: words.length,
      response_length: words.length < 5 ? 'short' : words.length < 15 ? 'medium' : 'long'
    };
  }

  /**
   * Get detailed analysis breakdown for display
   */
  static formatAnalysisForDisplay(analysis: AIAnalysisResult): {
    scoreColor: string;
    scoreText: string;
    insights: string[];
  } {
    const scoreColor = analysis.confidence_score >= 80 ? 'green' : 
                      analysis.confidence_score >= 60 ? 'blue' : 
                      analysis.confidence_score >= 40 ? 'yellow' : 'red';
    
    const scoreText = `${analysis.confidence_score}/100 (${analysis.quality.toUpperCase()})`;
    
    const insights: string[] = [
      `Response length: ${analysis.response_length} (${analysis.word_count} words)`,
    ];
    
    if (analysis.positive_keywords.length > 0) {
      insights.push(`✅ Good phrases detected: ${analysis.positive_keywords.join(', ')}`);
    }
    
    if (analysis.negative_keywords.length > 0) {
      insights.push(`⚠️ Concerning phrases: ${analysis.negative_keywords.join(', ')}`);
    }
    
    if (analysis.scenario_matches.length > 0) {
      insights.push(`🎯 Scenario awareness: ${analysis.scenario_matches.join(', ')}`);
    }
    
    return { scoreColor, scoreText, insights };
  }
}