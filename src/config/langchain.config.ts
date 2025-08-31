import { registerAs } from '@nestjs/config';

export default registerAs('langchain', () => ({
  openaiApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  contextWindowSize: 4000,
}));
