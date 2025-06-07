#!/usr/bin/env python3
"""
Test script for the Scam Response Analyzer
Demonstrates the AI model functionality with sample inputs
"""

from scam_analyzer import ScamResponseAnalyzer
import json

def test_analyzer():
    """Test the analyzer with various response types"""
    analyzer = ScamResponseAnalyzer()
    
    print("🤖 Voice Scam Immunizer - AI Model Test\n")
    print("=" * 50)
    
    # Test cases with different response qualities
    test_cases = [
        {
            'scenario_id': 'call-1',
            'response': "No, I don't believe this is real. The IRS sends written notices, not phone calls. I'm hanging up now.",
            'expected': 'excellent'
        },
        {
            'scenario_id': 'call-1', 
            'response': "This sounds suspicious. I will verify this by calling the IRS directly.",
            'expected': 'good'
        },
        {
            'scenario_id': 'call-1',
            'response': "Um, okay. What do I need to do? How much do I owe?",
            'expected': 'poor'
        },
        {
            'scenario_id': 'call-2',
            'response': "Microsoft doesn't make unsolicited calls. This is a scam. Goodbye.",
            'expected': 'excellent'
        },
        {
            'scenario_id': 'text-1',
            'response': "I'll check my account through the official bank app instead.",
            'expected': 'good'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['scenario_id']}")
        print(f"Response: \"{test_case['response']}\"")
        print(f"Expected Quality: {test_case['expected']}")
        print("-" * 30)
        
        # Analyze the response
        result_json = analyzer.analyze_response(
            test_case['response'], 
            test_case['scenario_id']
        )
        
        result = json.loads(result_json)
        
        print(f"🎯 AI Analysis Results:")
        print(f"   Confidence Score: {result['confidence_score']}/100")
        print(f"   Quality Rating: {result['quality']}")
        print(f"   Message: {result['message']}")
        
        if result['positive_keywords']:
            print(f"   ✅ Positive Keywords: {', '.join(result['positive_keywords'])}")
        
        if result['negative_keywords']:
            print(f"   ⚠️  Negative Keywords: {', '.join(result['negative_keywords'])}")
        
        if result['scenario_matches']:
            print(f"   🎯 Scenario Matches: {', '.join(result['scenario_matches'])}")
        
        print(f"   📊 Word Count: {result['word_count']} ({result['response_length']})")
        
        if result['recommendations']:
            print(f"   💡 Top Recommendation: {result['recommendations'][0]}")
        
        # Check if prediction matches expectation
        quality_match = result['quality'] == test_case['expected']
        print(f"   ✅ Prediction Accuracy: {'CORRECT' if quality_match else 'NEEDS TUNING'}")
        
        print("=" * 50)
    
    print("\n🎉 AI Model Testing Complete!")
    print("\nTo integrate with your web app:")
    print("1. Set up a Python backend API endpoint")
    print("2. Call this analyzer from your Node.js/React frontend")
    print("3. Display the rich analysis results to users")

if __name__ == "__main__":
    test_analyzer()