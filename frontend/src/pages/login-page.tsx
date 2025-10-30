import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { authAtom } from '../store/auth';
import { LoginForm } from '../components/login-form';

export const LoginPage: React.FC = () => {
  const [auth] = useAtom(authAtom);
  const { isAuthenticated } = auth;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <LoginForm />;
};