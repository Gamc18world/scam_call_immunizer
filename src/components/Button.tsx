import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  type = 'button',
  icon,
}) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-blue-800 text-white hover:bg-blue-900 focus:ring-4 focus:ring-blue-300",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-4 focus:ring-green-300"
  };
  
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3"
  };
  
  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};