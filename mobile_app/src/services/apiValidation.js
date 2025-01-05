import logger from '../utils/logger';

export const validateDeepgramKey = async (apiKey) => {
  try {
    logger.debug('Validating Deepgram API key...');
    // Test endpoint that requires authentication
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
      }
    });

    if (response.status === 401 || response.status === 403) {
      logger.warn('Deepgram API key validation failed: Invalid credentials');
      throw new Error('Invalid API key');
    }

    logger.info('Deepgram API key validation successful');
    return response.ok;
  } catch (error) {
    logger.error('Deepgram key validation error:', {
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

export const validateOpenAIKey = async (apiKey) => {
  try {
    logger.debug('Validating OpenAI API key...');
    // Test endpoint that requires authentication
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (response.status === 401 || response.status === 403) {
      logger.warn('OpenAI API key validation failed: Invalid credentials');
      throw new Error('Invalid API key');
    }

    logger.info('OpenAI API key validation successful');
    return response.ok;
  } catch (error) {
    logger.error('OpenAI key validation error:', {
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}; 