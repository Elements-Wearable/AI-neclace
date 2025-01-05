import * as SecureStore from 'expo-secure-store';
import logger from '../utils/logger';

const API_KEYS = {
  DEEPGRAM: 'deepgram_api_key',
  OPENAI: 'openai_api_key'
};

export const saveApiKey = async (key, value) => {
  try {
    logger.debug(`Attempting to save API key for: ${key}`);
    await SecureStore.setItemAsync(key, value);
    logger.info(`API key saved successfully for: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Error saving API key for ${key}:`, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

export const getApiKey = async (key) => {
  try {
    logger.debug(`Retrieving API key for: ${key}`);
    const value = await SecureStore.getItemAsync(key);
    logger.info(`API key ${value ? 'found' : 'not found'} for: ${key}`);
    return value;
  } catch (error) {
    logger.error(`Error retrieving API key for ${key}:`, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return null;
  }
};

export const hasApiKey = async (key) => {
  try {
    logger.debug(`Checking existence of API key for: ${key}`);
    const value = await getApiKey(key);
    logger.info(`API key status check for ${key}: ${value ? 'exists' : 'not found'}`);
    return !!value;
  } catch (error) {
    logger.error(`Error checking API key existence for ${key}:`, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

export { API_KEYS };
