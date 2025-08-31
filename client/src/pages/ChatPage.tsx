import React from 'react';
import styled from 'styled-components';
import { ChatInterface } from '../components/ChatInterface';

const ChatPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ChatPage: React.FC = () => {
  return (
    <ChatPageContainer>
      <ChatInterface />
    </ChatPageContainer>
  );
};