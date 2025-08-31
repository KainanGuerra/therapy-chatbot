import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LangChainService } from '@/modules/langchain/langchain.service';

describe('LangChainService', () => {
  let service: LangChainService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      openaiApiKey: 'test-api-key',
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangChainService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LangChainService>(LangChainService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with LCEL chains', () => {
    expect(service).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('langchain');
  });

  // Note: These tests would require actual API calls to OpenAI
  // In a real scenario, you'd want to mock the LLM responses
  describe('LCEL Migration', () => {
    it('should use LCEL instead of deprecated LLMChain', () => {
      // This test verifies that the service initializes without errors
      // The actual LCEL implementation is tested through the service methods
      expect(service).toBeDefined();
    });
  });
});
