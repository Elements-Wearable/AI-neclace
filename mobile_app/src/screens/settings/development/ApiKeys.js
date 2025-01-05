import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import ApiKeyModal from '../../../components/ApiKeyModal';
import { validateDeepgramKey, validateOpenAIKey } from '../../../services/apiValidation';
import { API_KEYS, hasApiKey, saveApiKey } from '../../../services/secureStorage';
import logger from '../../../utils/logger';
import styles from '../styles';

export default function ApiKeys() {
  const [showDeepgramModal, setShowDeepgramModal] = useState(false);
  const [showOpenAIModal, setShowOpenAIModal] = useState(false);
  const [hasDeepgramKey, setHasDeepgramKey] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    checkApiKeys();
  }, []);

  const checkApiKeys = async () => {
    setHasDeepgramKey(await hasApiKey(API_KEYS.DEEPGRAM));
    setHasOpenAIKey(await hasApiKey(API_KEYS.OPENAI));
  };

  const handleSaveDeepgramKey = async (key) => {
    setIsValidating(true);
    try {
      logger.debug('Starting Deepgram API key validation process');
      const isValid = await validateDeepgramKey(key);
      if (isValid) {
        await saveApiKey(API_KEYS.DEEPGRAM, key);
        checkApiKeys();
        logger.info('Deepgram API key successfully validated and saved');
        Alert.alert('Success', 'Deepgram API key validated and saved successfully');
        setShowDeepgramModal(false);
      } else {
        logger.warn('Invalid Deepgram API key provided');
        Alert.alert('Error', 'Invalid Deepgram API key. Please check and try again.');
      }
    } catch (error) {
      logger.error('Deepgram API key validation process failed:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Alert.alert('Error', 'Failed to validate Deepgram API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveOpenAIKey = async (key) => {
    setIsValidating(true);
    try {
      logger.debug('Starting OpenAI API key validation process');
      const isValid = await validateOpenAIKey(key);
      if (isValid) {
        await saveApiKey(API_KEYS.OPENAI, key);
        checkApiKeys();
        logger.info('OpenAI API key successfully validated and saved');
        Alert.alert('Success', 'OpenAI API key validated and saved successfully');
        setShowOpenAIModal(false);
      } else {
        logger.warn('Invalid OpenAI API key provided');
        Alert.alert('Error', 'Invalid OpenAI API key. Please check and try again.');
      }
    } catch (error) {
      logger.error('OpenAI API key validation process failed:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Alert.alert('Error', 'Failed to validate OpenAI API key');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusText = (hasKey, type) => {
    if (hasKey) {
      return `${type} API key is configured`;
    }
    return `${type} API key not set`;
  };

  return (
    <>
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Deepgram API Key</Text>
          <Text style={[
            styles.apiKeyStatus,
            hasDeepgramKey ? styles.apiKeyStatusSet : styles.apiKeyStatusUnset
          ]}>
            {getStatusText(hasDeepgramKey, 'Deepgram')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.selector, hasDeepgramKey ? styles.successSelector : styles.warningSelector]}
          onPress={() => setShowDeepgramModal(true)}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Text style={[styles.selectorText, hasDeepgramKey ? styles.successText : styles.warningText]}>
              {hasDeepgramKey ? 'Update Key' : 'Set Key'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>OpenAI API Key</Text>
          <Text style={[
            styles.apiKeyStatus,
            hasOpenAIKey ? styles.apiKeyStatusSet : styles.apiKeyStatusUnset
          ]}>
            {getStatusText(hasOpenAIKey, 'OpenAI')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.selector, hasOpenAIKey ? styles.successSelector : styles.warningSelector]}
          onPress={() => setShowOpenAIModal(true)}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Text style={[styles.selectorText, hasOpenAIKey ? styles.successText : styles.warningText]}>
              {hasOpenAIKey ? 'Update Key' : 'Set Key'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ApiKeyModal
        visible={showDeepgramModal}
        onClose={() => setShowDeepgramModal(false)}
        onSave={handleSaveDeepgramKey}
        title="Deepgram API Key"
        placeholder="Enter your Deepgram API key"
        isValidating={isValidating}
      />

      <ApiKeyModal
        visible={showOpenAIModal}
        onClose={() => setShowOpenAIModal(false)}
        onSave={handleSaveOpenAIKey}
        title="OpenAI API Key"
        placeholder="Enter your OpenAI API key"
        isValidating={isValidating}
      />
    </>
  );
} 