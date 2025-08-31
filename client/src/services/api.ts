import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  LoginForm,
  RegisterForm,
  SendMessageForm,
  SendMessageResponse,
  ChatSession,
  Professional,
  HabitSuggestion,
  User,
  UserPreferences,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async validateToken(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/validate');
    return response.data.data;
  }

  // Chat endpoints
  async sendMessage(messageData: SendMessageForm): Promise<SendMessageResponse> {
    const response: AxiosResponse<SendMessageResponse> = await this.api.post('/chat/messages', messageData);
    return response.data;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const response: AxiosResponse<ApiResponse<ChatSession[]>> = await this.api.get('/chat/sessions');
    return response.data.data;
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = await this.api.get(`/chat/sessions/${sessionId}`);
    return response.data.data;
  }

  async createChatSession(title: string): Promise<ChatSession> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = await this.api.post('/chat/sessions', { title });
    return response.data.data;
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.api.delete(`/chat/sessions/${sessionId}`);
  }

  // Professional endpoints
  async getProfessionals(): Promise<Professional[]> {
    const response: AxiosResponse<ApiResponse<Professional[]>> = await this.api.get('/professionals');
    return response.data.data;
  }

  async getProfessional(id: string): Promise<Professional> {
    const response: AxiosResponse<ApiResponse<Professional>> = await this.api.get(`/professionals/${id}`);
    return response.data.data;
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    const response: AxiosResponse<ApiResponse<Professional[]>> = await this.api.get(`/professionals/search?q=${query}`);
    return response.data.data;
  }

  async rateProfessional(professionalId: string, rating: number): Promise<Professional> {
    const response: AxiosResponse<ApiResponse<Professional>> = await this.api.post(`/professionals/${professionalId}/rate`, { rating });
    return response.data.data;
  }

  // Habits endpoints
  async getHabitSuggestions(): Promise<HabitSuggestion[]> {
    const response: AxiosResponse<ApiResponse<HabitSuggestion[]>> = await this.api.get('/habits/suggestions');
    return response.data.data;
  }

  async trackHabit(habitId: string, completed: boolean): Promise<void> {
    await this.api.post('/habits/track', { habitId, completed });
  }

  async getHabitStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/habits/stats');
    return response.data.data;
  }

  // User preferences
  async updateUserPreferences(preferences: UserPreferences): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/auth/preferences', preferences);
    return response.data.data;
  }

  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    return response.data.data;
  }

  // Mood tracking
  async getMoodHistory(days: number = 30): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/mood/history?days=${days}`);
    return response.data.data;
  }

  async getMoodStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/mood/stats');
    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService;