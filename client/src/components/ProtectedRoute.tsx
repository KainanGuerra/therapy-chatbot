import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { Loader } from 'lucide-react';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingContent = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  
  .icon {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  p {
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <div className="icon">
            <Loader className="spinner" size={40} />
          </div>
          <p>Loading...</p>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};