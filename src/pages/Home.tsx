import React from 'react';
import { Phone, MessageSquare, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useUserProgress } from '../hooks/useUserProgress';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getCompletionPercentage } = useUserProgress();
  const completionPercentage = getCompletionPercentage();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl text-white p-8 mb-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Practice Responding to Scams</h1>
            <p className="text-xl opacity-90">
              Build confidence and protect yourself from scammers by practicing your responses in a safe environment.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => navigate('/call-practice')}
              size="lg"
              icon={<Phone size={18} />}
              className="bg-white text-blue-900 hover:bg-gray-100"
            >
              Practice Scam Calls
            </Button>
            <Button 
              onClick={() => navigate('/text-practice')}
              size="lg"
              icon={<MessageSquare size={18} />}
              className="bg-white text-blue-900 hover:bg-gray-100"
            >
              Practice Scam Texts
            </Button>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Activity size={24} className="text-blue-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
          </div>
          
          <ProgressBar 
            percentage={completionPercentage} 
            label="Scenarios Completed" 
            size="lg"
          />
          
          {completionPercentage === 0 && (
            <p className="mt-4 text-gray-600">Complete scenarios to track your progress.</p>
          )}
          
          {completionPercentage === 100 && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
              <ShieldCheck size={20} className="mr-2" />
              <p>Congratulations! You've completed all scenarios.</p>
            </div>
          )}
        </div>
        
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Practice?</h2>
            <p className="text-gray-600 mb-4">
              Scammers prey on panic and urgency. By practicing responses in advance, 
              you'll be better prepared to recognize and respond to scams calmly and effectively.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Build confidence in recognizing scams</li>
              <li>Develop automatic responses</li>
              <li>Reduce anxiety when faced with real scams</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Common Scam Red Flags</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Urgent demands for immediate action</li>
              <li>Threats of arrest, lawsuits, or account suspension</li>
              <li>Requests for unusual payment methods (gift cards, wire transfers)</li>
              <li>Claims of prizes or unexpected money</li>
              <li>Poor grammar or spelling in messages</li>
              <li>Requests for personal information or account details</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};