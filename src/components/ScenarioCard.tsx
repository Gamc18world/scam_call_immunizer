import React from 'react';
import { Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { ScamScenario } from '../types';
import { Button } from './Button';

interface ScenarioCardProps {
  scenario: ScamScenario;
  completed?: boolean;
  onSelect: (scenario: ScamScenario) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  completed = false,
  onSelect
}) => {
  const { title, type, content } = scenario;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-blue-700">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${type === 'call' ? 'bg-blue-100' : 'bg-purple-100'} mr-3`}>
              {type === 'call' ? 
                <Phone size={20} className="text-blue-800" /> : 
                <MessageSquare size={20} className="text-purple-800" />
              }
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          {completed && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{content}</p>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => onSelect(scenario)}
            variant="primary"
            size="sm"
          >
            Practice
          </Button>
        </div>
      </div>
    </div>
  );
};