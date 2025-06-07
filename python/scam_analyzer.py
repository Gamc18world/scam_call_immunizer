#!/usr/bin/env python3
"""
Scam Response Analyzer - AI Model for evaluating user responses to scam scenarios
This is a simplified version that works with Python standard library only.
In production, you would use libraries like scikit-learn, transformers, or spaCy.
"""

import json
import re
import sys
from typing import Dict, List, Tuple
from collections import Counter
import math

class ScamResponseAnalyzer:
    def __init__(self):
        # Keywords that indicate good scam awareness
        self.positive_keywords = {
            'rejection': ['no', 'not interested', 'hang up', 'goodbye', 'stop calling'],
            'verification': ['verify', 'check', 'confirm', 'official website', 'call back'],
            'skepticism': ['suspicious', 'scam', 'fraud', 'fake', 'doubt', 'question'],
            'protection': ['report', 'police', 'authorities', 'block', 'delete'],
            'knowledge': ['government agencies', 'irs doesnt call', 'written notice', 'official mail']
        }
        
        # Keywords that indicate vulnerability to scams
        self.negative_keywords = {
            'compliance': ['okay', 'yes', 'sure', 'how much', 'what do i do', 'help me'],
            'panic': ['worried', 'scared', 'urgent', 'immediately', 'right now'],
            'information_sharing': ['social security', 'bank account', 'credit card', 'password', 'pin']
        }
        
        # Scenario-specific good responses
        self.scenario_responses = {
            'call-1': {  # IRS Tax Scam
                'good': ['irs sends written notices', 'government doesnt call', 'verify through official channels'],
                'context': 'irs_tax_scam'
            },
            'call-2': {  # Tech Support Scam
                'good': ['microsoft doesnt call', 'tech support scam', 'hang up immediately'],
                'context': 'tech_support_scam'
            },
            'text-1': {  # Bank Alert Scam
                'good': ['call bank directly', 'use official app', 'check account through website'],
                'context': 'bank_alert_scam'
            },
            'text-2': {  # Package Delivery Scam
                'good': ['check official tracking', 'go to official website', 'ignore suspicious links'],
                'context': 'delivery_scam'
            }
        }

    def preprocess_text(self, text: str) -> str:
        """Clean and normalize text for analysis"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove punctuation but keep apostrophes
        text = re.sub(r'[^\w\s\']', ' ', text)
        return text

    def extract_keywords(self, text: str) -> Dict[str, List[str]]:
        """Extract relevant keywords from the response"""
        text = self.preprocess_text(text)
        found_keywords = {
            'positive': [],
            'negative': []
        }
        
        # Check for positive keywords
        for category, keywords in self.positive_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_keywords['positive'].append(keyword)
        
        # Check for negative keywords
        for category, keywords in self.negative_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_keywords['negative'].append(keyword)
        
        return found_keywords

    def calculate_confidence_score(self, text: str, scenario_id: str = None) -> Dict:
        """Calculate confidence score based on response analysis"""
        keywords = self.extract_keywords(text)
        
        # Base scoring
        positive_score = len(keywords['positive']) * 10
        negative_score = len(keywords['negative']) * -15
        
        # Scenario-specific bonus
        scenario_bonus = 0
        scenario_matches = []
        if scenario_id and scenario_id in self.scenario_responses:
            scenario_data = self.scenario_responses[scenario_id]
            for good_response in scenario_data['good']:
                if good_response in self.preprocess_text(text):
                    scenario_bonus += 20
                    scenario_matches.append(good_response)
        
        # Length penalty for very short responses (might indicate confusion)
        length_penalty = 0
        if len(text.split()) < 3:
            length_penalty = -10
        
        # Calculate final score (0-100 scale)
        raw_score = positive_score + negative_score + scenario_bonus + length_penalty
        confidence_score = max(0, min(100, raw_score + 50))  # Normalize to 0-100
        
        # Determine response quality
        if confidence_score >= 80:
            quality = "excellent"
            message = "Outstanding response! You demonstrated strong scam awareness."
        elif confidence_score >= 60:
            quality = "good"
            message = "Good response! You showed awareness of the scam tactics."
        elif confidence_score >= 40:
            quality = "fair"
            message = "Fair response, but could be improved with more assertiveness."
        else:
            quality = "poor"
            message = "Your response suggests vulnerability to this scam. Practice being more skeptical."
        
        return {
            'confidence_score': confidence_score,
            'quality': quality,
            'message': message,
            'positive_keywords': keywords['positive'],
            'negative_keywords': keywords['negative'],
            'scenario_matches': scenario_matches,
            'recommendations': self.get_recommendations(confidence_score, keywords)
        }

    def get_recommendations(self, score: int, keywords: Dict) -> List[str]:
        """Provide personalized recommendations based on analysis"""
        recommendations = []
        
        if score < 60:
            recommendations.append("Practice saying 'no' firmly and hanging up immediately")
            recommendations.append("Remember: legitimate organizations don't create false urgency")
        
        if not keywords['positive']:
            recommendations.append("Use phrases like 'I need to verify this' or 'I'll call back through official channels'")
        
        if keywords['negative']:
            recommendations.append("Avoid showing panic or agreeing to demands from unknown callers")
            recommendations.append("Never share personal information over unsolicited calls or messages")
        
        if score >= 80:
            recommendations.append("Excellent work! Consider helping others learn these skills")
        
        return recommendations

    def analyze_response(self, response_text: str, scenario_id: str = None) -> str:
        """Main analysis function that returns JSON results"""
        try:
            analysis = self.calculate_confidence_score(response_text, scenario_id)
            
            # Add additional insights
            analysis['word_count'] = len(response_text.split())
            analysis['response_length'] = 'short' if analysis['word_count'] < 5 else 'medium' if analysis['word_count'] < 15 else 'long'
            
            return json.dumps(analysis, indent=2)
        
        except Exception as e:
            return json.dumps({
                'error': f"Analysis failed: {str(e)}",
                'confidence_score': 0,
                'quality': 'error',
                'message': 'Unable to analyze response'
            })

def main():
    """Command line interface for the analyzer"""
    if len(sys.argv) < 2:
        print("Usage: python scam_analyzer.py <response_text> [scenario_id]")
        sys.exit(1)
    
    response_text = sys.argv[1]
    scenario_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    analyzer = ScamResponseAnalyzer()
    result = analyzer.analyze_response(response_text, scenario_id)
    print(result)

if __name__ == "__main__":
    main()