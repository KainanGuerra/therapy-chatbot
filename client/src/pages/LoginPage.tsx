import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginForm as LoginFormType } from '../types';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LoginCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing['2xl']};
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-out;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  
  .icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    border-radius: ${({ theme }) => theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto ${({ theme }) => theme.spacing.md};
    color: white;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray[800]};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    color: ${({ theme }) => theme.colors.gray[600]};
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
  
  .icon {
    position: absolute;
    left: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.gray[400]};
    z-index: 1;
  }
  
  .toggle-password {
    position: absolute;
    right: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.gray[400]};
    cursor: pointer;
    padding: 0;
    
    &:hover {
      color: ${({ theme }) => theme.colors.gray[600]};
    }
  }
`;

const Input = styled.input<{ hasIcon?: boolean; hasToggle?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ hasIcon, theme }) => hasIcon ? '2.75rem' : theme.spacing.md};
  padding-right: ${({ hasToggle, theme }) => hasToggle ? '2.75rem' : theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    outline: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ variant = 'primary', theme }) => {
    if (variant === 'primary') {
      return `
        background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.lg};
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `;
    }
    return `
      background: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[700]};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.gray[200]};
      }
    `;
  }}
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error}10;
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.error}20;
`;

const Footer = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 0.9rem;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/chat');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <div className="icon">
            <Heart size={30} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your mental health journey</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <Mail className="icon" size={20} />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                hasIcon
                required
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <Lock className="icon" size={20} />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                hasIcon
                hasToggle
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </InputWrapper>
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>

        <Footer>
          Don't have an account?{' '}
          <Link to="/register">Sign up here</Link>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};