/**
 * Unit Tests for AnalysisModelService
 * Tests analysis-only model for image recognition and text reasoning
 */

describe('AnalysisModelService', () => {
  let AnalysisModelService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    // Mock the @google/generative-ai module
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Mock response')
            }
          })
        })
      }))
    }));

    jest.clearAllMocks();
    AnalysisModelService = require('../AnalysisModelService').default;
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Constructor', () => {
    test('should initialize with API key', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(service).toBeDefined();
    });

    test('should handle missing API key gracefully', () => {
      const service = new AnalysisModelService();
      expect(service).toBeDefined();
      expect(service.apiKey).toBeNull();
    });
  });

  describe('Initialization', () => {
    test('should have initialize method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.initialize).toBe('function');
    });

    test('should accept configuration options', async () => {
      const service = new AnalysisModelService(mockApiKey);
      const config = { userName: 'Test User' };
      
      await expect(service.initialize(config)).resolves.not.toThrow();
    });
  });

  describe('Image Analysis', () => {
    test('should have analyzeImage method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.analyzeImage).toBe('function');
    });

    test('analyzeImage should accept image data and prompt', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const imageData = {
        base64: 'base64imagedata',
        mimeType: 'image/jpeg'
      };
      const prompt = 'Analyze this image';
      
      await expect(service.analyzeImage(imageData, prompt)).resolves.toBeDefined();
    });
  });

  describe('Text Processing', () => {
    test('should have processText method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.processText).toBe('function');
    });

    test('processText should accept text input', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const text = 'What is the price of rice today?';
      await expect(service.processText(text)).resolves.toBeDefined();
    });
  });

  describe('Tool Execution', () => {
    test('should have executeTool method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.executeTool).toBe('function');
    });

    test('should have getToolDefinitions method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.getToolDefinitions).toBe('function');
      
      const tools = service.getToolDefinitions();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should define lookup_price tool', () => {
      const service = new AnalysisModelService(mockApiKey);
      const tools = service.getToolDefinitions();
      
      const priceTool = tools.find(t => t.name === 'lookup_price');
      expect(priceTool).toBeDefined();
      expect(priceTool.description).toBeDefined();
    });

    test('should define diagnose_disease tool', () => {
      const service = new AnalysisModelService(mockApiKey);
      const tools = service.getToolDefinitions();
      
      const diagnoseTool = tools.find(t => t.name === 'diagnose_disease');
      expect(diagnoseTool).toBeDefined();
      expect(diagnoseTool.description).toBeDefined();
    });

    test('should define find_agri_store tool', () => {
      const service = new AnalysisModelService(mockApiKey);
      const tools = service.getToolDefinitions();
      
      const storeTool = tools.find(t => t.name === 'find_agri_store');
      expect(storeTool).toBeDefined();
      expect(storeTool.description).toBeDefined();
    });

    test('executeTool should handle tool calls', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const toolCall = {
        id: 'test-123',
        name: 'lookup_price',
        args: { product: 'lúa', region: 'Đồng bằng sông Cửu Long' }
      };
      
      const result = await service.executeTool(toolCall);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-123');
      expect(result.name).toBe('lookup_price');
      expect(result.response).toBeDefined();
    });
  });

  describe('Service State', () => {
    test('should have isServiceReady method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.isServiceReady).toBe('function');
    });

    test('should have cleanup method', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(typeof service.cleanup).toBe('function');
    });

    test('isServiceReady should return false before initialization', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(service.isServiceReady()).toBe(false);
    });

    test('isServiceReady should return true after initialization', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      expect(service.isServiceReady()).toBe(true);
    });
  });

  describe('Analysis Model Isolation', () => {
    test('should not have audio streaming methods', () => {
      const service = new AnalysisModelService(mockApiKey);
      expect(service.sendAudioInput).toBeUndefined();
      expect(service.sendTextForSpeech).toBeUndefined();
      expect(service.connect).toBeUndefined();
      expect(service.onAudioOutput).toBeUndefined();
    });

    test('should only handle image and text data types', () => {
      const service = new AnalysisModelService(mockApiKey);
      
      // Should have image analysis
      expect(typeof service.analyzeImage).toBe('function');
      
      // Should have text processing
      expect(typeof service.processText).toBe('function');
      
      // Should NOT have audio methods
      expect(service.sendAudioInput).toBeUndefined();
    });
  });

  describe('Tool Call Execution', () => {
    test('should execute price lookup tool', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const result = await service._lookupPrice({
        product: 'cà phê',
        region: 'Tây Nguyên'
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('cà phê');
    });

    test('should execute disease diagnosis tool', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const result = await service._diagnoseDisease({
        crop: 'lúa',
        symptoms: 'lá vàng, héo'
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should execute store finder tool', async () => {
      const service = new AnalysisModelService(mockApiKey);
      await service.initialize();
      
      const result = await service._findAgriStore({
        productType: 'phân bón',
        location: 'Hà Nội'
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
