import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  size = 'md',
  color = 'blue'
}) => {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-4';
      case 'md':
      default: return 'h-2.5';
    }
  };
  
  const getColor = () => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'blue':
      default: return 'bg-blue-700';
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{clampedPercentage}%</span>
        </div>
      )}
      <div className={`w-full ${getHeight()} bg-gray-200 rounded-full`}>
        <div 
          className={`${getHeight()} ${getColor()} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${clampedPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};