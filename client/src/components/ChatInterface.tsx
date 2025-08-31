import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader } from 'lucide-react';
import { ChatMessage, SendMessageForm, MoodLevel } from '../types';
import { apiService } from '../services/api';
import { format } from 'date-fns';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  ${({ isUser }) => isUser && 'flex-direction: row-reverse;'}
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ isUser, theme }) => isUser ? theme.colors.primary : theme.colors.secondary};
    color: white;
    flex-shrink: 0;
  }
  
  .message-content {
    max-width: 70%;
    background: ${({ isUser, theme }) => isUser ? theme.colors.primary : theme.colors.gray[100]};
    color: ${({ isUser, theme }) => isUser ? 'white' : theme.colors.gray[800]};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    ${({ isUser }) => isUser ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;'}
    
    .message-text {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      line-height: 1.5;
    }
    
    .message-meta {
      font-size: 0.75rem;
      opacity: 0.7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
`;

const MoodIndicator = styled.div<{ mood: MoodLevel }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ mood, theme }) => {
    switch (mood) {
      case MoodLevel.VERY_LOW:
        return `background: ${theme.colors.error}20; color: ${theme.colors.error};`;
      case MoodLevel.LOW:
        return `background: ${theme.colors.warning}20; color: ${theme.colors.warning};`;
      case MoodLevel.NEUTRAL:
        return `background: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
      case MoodLevel.GOOD:
        return `background: ${theme.colors.success}20; color: ${theme.colors.success};`;
      case MoodLevel.EXCELLENT:
        return `background: ${theme.colors.success}30; color: ${theme.colors.success};`;
      default:
        return `background: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const InputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: white;
`;

const InputForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.gray[500]};
  font-style: italic;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const getMoodLabel = (mood: MoodLevel): string => {
  switch (mood) {
    case MoodLevel.VERY_LOW:
      return 'Very Low';
    case MoodLevel.LOW:
      return 'Low';
    case MoodLevel.NEUTRAL:
      return 'Neutral';
    case MoodLevel.GOOD:
      return 'Good';
    case MoodLevel.EXCELLENT:
      return 'Excellent';
    default:
      return 'Unknown';
  }
};

interface ChatInterfaceProps {
  sessionId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      content: inputValue,
      timestamp: new Date(),
      type: 'user' as any,
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const messageData: SendMessageForm = {
        content: inputValue,
        sessionId: currentSessionId,
      };

      const response = await apiService.sendMessage(messageData);
      
      // // If we didn't have a session ID, we now have one
      // if (!currentSessionId && response?.message?.id) {
      //   // Extract session ID from response or create new session
      //   // This would depend on your backend implementation
      // }
      console.log(response);

      const assistantMessage: ChatMessage = {
        ...response.assistantMessage,
        timestamp: new Date(response?.assistantMessage?.createdAt as unknown as any),
        type: 'assistant' as any,
        role: 'assistant',
        moodAnalysis: response?.moodAnalysis,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'assistant' as any,
        role: 'assistant',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h1>Therapy Chatbot</h1>
        <p>Your AI-powered mental health companion</p>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 && (
          <MessageBubble isUser={false}>
            <div className="avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="message-text">
                Hello! I'm here to support your mental health and wellbeing. 
                Feel free to share what's on your mind, and I'll do my best to help.
              </div>
              <div className="message-meta">
                <span>{format(new Date(), 'HH:mm')}</span>
              </div>
            </div>
          </MessageBubble>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.role === 'user'}>
            <div className="avatar">
              {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              {/* <div className="message-meta">
                <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                {message.moodAnalysis && (
                  <MoodIndicator mood={message.moodAnalysis.level}>
                    {getMoodLabel(message.moodAnalysis.level)}
                  </MoodIndicator>
                )}
              </div> */}
            </div>
          </MessageBubble>
        ))}

        {isLoading && (
          <LoadingIndicator>
            <Loader className="spinner" size={16} />
            <span>Thinking...</span>
          </LoadingIndicator>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputForm onSubmit={handleSubmit}>
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <SendButton type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send size={20} />
          </SendButton>
        </InputForm>
      </InputContainer>
    </ChatContainer>
  );
};