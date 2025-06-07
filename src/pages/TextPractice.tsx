import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ScenarioCard } from '../components/ScenarioCard';
import { ScenarioDetail } from '../components/ScenarioDetail';
import { scamScenarios } from '../data/scamScenarios';
import { ScamScenario } from '../types';
import { useUserProgress } from '../hooks/useUserProgress';
import { MessageSquare } from 'lucide-react';

export const TextPractice: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScamScenario | null>(null);
  const { isScenarioCompleted, updateProgress } = useUserProgress();
  
  // Filter for text scenarios only
  const textScenarios = scamScenarios.filter(scenario => scenario.type === 'text');
  
  const handleSelectScenario = (scenario: ScamScenario) => {
    setSelectedScenario(scenario);
  };
  
  const handleBack = () => {
    setSelectedScenario(null);
  };
  
  const handleComplete = (scenarioId: string, wasSuccessful: boolean) => {
    updateProgress(scenarioId, wasSuccessful);
  };
  
  return (
    <Layout>
      {selectedScenario ? (
        <ScenarioDetail 
          scenario={selectedScenario}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare size={24} className="text-purple-700 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Scam Text Practice</h1>
            </div>
            <p className="text-gray-600">
              Review these simulated scam text messages and practice how you would respond.
              Select any scenario to begin your practice session.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {textScenarios.map(scenario => (
              <ScenarioCard 
                key={scenario.id}
                scenario={scenario}
                completed={isScenarioCompleted(scenario.id)}
                onSelect={handleSelectScenario}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};