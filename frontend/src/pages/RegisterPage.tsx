import React from 'react';
import { LoginPage } from './LoginPage';

interface RegisterPageProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  return (
    <LoginPage 
      onSuccess={onSuccess} 
      onSwitchToRegister={onSwitchToLogin} 
      initialMode="register" 
    />
  );
};
