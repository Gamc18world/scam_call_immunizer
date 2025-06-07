import { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { scamScenarios } from '../data/scamScenarios';

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress[]>(() => {
    const savedProgress = localStorage.getItem('scamImmunizer-progress');
    return savedProgress ? JSON.parse(savedProgress) : [];
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scamImmunizer-progress', JSON.stringify(progress));
  }, [progress]);

  // Check if a scenario has been completed
  const isScenarioCompleted = (scenarioId: string): boolean => {
    return progress.some(p => p.scenarioId === scenarioId && p.completed);
  };

  // Get completion percentage
  const getCompletionPercentage = (): number => {
    if (scamScenarios.length === 0) return 0;
    const completedCount = progress.filter(p => p.completed).length;
    return Math.round((completedCount / scamScenarios.length) * 100);
  };

  // Update progress for a scenario
  const updateProgress = (scenarioId: string, wasSuccessful: boolean) => {
    setProgress(prevProgress => {
      // Find existing progress
      const existingIndex = prevProgress.findIndex(p => p.scenarioId === scenarioId);
      
      if (existingIndex >= 0) {
        // Update existing progress
        const updated = [...prevProgress];
        const current = updated[existingIndex];
        updated[existingIndex] = {
          ...current,
          completed: true,
          successRate: wasSuccessful 
            ? (current.successRate + 100) / 2 
            : (current.successRate) / 2,
          lastPracticed: new Date()
        };
        return updated;
      } else {
        // Add new progress
        return [
          ...prevProgress,
          {
            scenarioId,
            completed: true,
            successRate: wasSuccessful ? 100 : 0,
            lastPracticed: new Date()
          }
        ];
      }
    });
  };

  return {
    progress,
    isScenarioCompleted,
    getCompletionPercentage,
    updateProgress
  };
}