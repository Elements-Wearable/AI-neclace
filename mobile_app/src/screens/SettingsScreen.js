import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LanguageModal from '../components/LanguageModal';
import MaxSpeakersModal from '../components/MaxSpeakersModal';
import ModelModal from '../components/ModelModal';
import SampleTranscriptsModal from '../components/SampleTranscriptsModal';
import SampleTranscriptsResultModal from '../components/SampleTranscriptsResultModal';
import ThemeModal from '../components/ThemeModal';
import {
    MEMORIES_STORAGE_KEY,
    SETTINGS_KEY, SUPPORTED_LANGUAGES,
    THEME_OPTIONS,
    TRANSCRIPTIONS_KEY
} from '../config/constants';
import { SAMPLE_CONVERSATIONS } from '../config/sampleData';
import { addSampleMemoriesToExisting, filterOutSampleMemories } from '../config/sampleMemories';
import { addSampleTranscripts, clearSampleTranscripts, countSampleTranscripts } from '../services/sampleTranscriptsService';
import { settingsStyles } from '../styles/screens/settingsScreen';
import logger from '../utils/logger';
import DevelopmentSettings from './settings/development';

const defaultSettings = {
  language: 'en',
  autoSpeakerDetection: true,
  maxSpeakers: 2,
  highQualityAudio: true,
  smartFormatting: true,
  utteranceThreshold: 0.3,
  autoPunctuation: true,
  showTabLabels: true,
  theme: THEME_OPTIONS.SYSTEM,
  model: 'nova-2',
};

const getAllAsyncStorageData = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Get all values for the keys
    const result = await AsyncStorage.multiGet(keys);
    
    // Convert to object with proper error handling
    const data = {};
    result.forEach(([key, value]) => {
      try {
        // Try to parse JSON values
        data[key] = value ? JSON.parse(value) : null;
      } catch (e) {
        // If parsing fails, store as raw value
        data[key] = value;
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error getting all AsyncStorage data:', error);
    throw error;
  }
};

export default function SettingsScreen() {
  const [settings, setSettings] = React.useState(defaultSettings);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showMaxSpeakersModal, setShowMaxSpeakersModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [sampleAction, setSampleAction] = useState(null);
  const [sampleResult, setSampleResult] = useState({ success: false, count: 0 });
  const [showModelModal, setShowModelModal] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      logger.debug('Loading settings...');
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        // Set global debug mode on app start
        global.debugMode = parsed.debugMode;
        logger.debug('Settings loaded:', parsed);
      }
      setIsLoading(false);
    } catch (error) {
      logger.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Set global debug mode when it changes
      if (key === 'debugMode') {
        global.debugMode = value;
        logger.debug('Debug mode changed:', value);
      }
      
      // Force an immediate update
      if (key === 'showTabLabels') {
        logger.debug('Tab labels visibility changed:', value);
        // Add a small delay to ensure the AsyncStorage write is complete
        setTimeout(async () => {
          const verify = await AsyncStorage.getItem(SETTINGS_KEY);
          logger.debug('Updated settings verified:', verify);
        }, 100);
      }
    } catch (error) {
      logger.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const resetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
              setSettings(defaultSettings);
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        }
      ]
    );
  };

  const generateSampleData = async () => {
    try {
      logger.debug('Generating sample data...');
      // Get existing transcriptions
      const existingTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
      const parsedExisting = existingTranscriptions ? JSON.parse(existingTranscriptions) : [];
      
      logger.debug('Existing transcriptions:', parsedExisting.length);
      
      // Generate random transcriptions over yesterday and today
      const newTranscriptions = [];
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      SAMPLE_CONVERSATIONS.forEach((conversation) => {
        // Randomly choose between today and yesterday
        const baseDate = Math.random() < 0.5 ? now : yesterday;
        
        // Random time between 8 AM and 8 PM
        const randomHours = Math.floor(Math.random() * 12) + 8;
        const randomMinutes = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(baseDate);
        timestamp.setHours(randomHours, randomMinutes, 0, 0);
        
        // Create sample transcription with proper marking
        newTranscriptions.push({
          id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: `sample_session_${conversation.title.toLowerCase().replace(/\s+/g, '_')}`,
          timestamp: timestamp.toISOString(),
          utterances: conversation.utterances,
          metadata: {
            isSampleData: true,
            sampleType: conversation.title,
            generatedAt: new Date().toISOString()
          }
        });
      });
      
      // Combine with existing transcriptions
      const allTranscriptions = [...parsedExisting, ...newTranscriptions];
      
      // Save to storage
      await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(allTranscriptions));
      
      logger.info(`Added ${newTranscriptions.length} sample transcriptions`);
    } catch (error) {
      logger.error('Error generating sample data:', error);
      Alert.alert('Error', 'Failed to generate sample data');
    }
  };

  const loadLogFiles = async () => {
    try {
      const files = await logger.getLogFiles();
      setLogFiles(files);
    } catch (error) {
      logger.error('Failed to load log files:', error);
      Alert.alert('Error', 'Failed to load log files');
    }
  };

  const manageSampleMemories = async (action) => {
    try {
      // Get existing memories
      const existingMemoriesJson = await AsyncStorage.getItem(MEMORIES_STORAGE_KEY);
      const existingMemories = existingMemoriesJson ? JSON.parse(existingMemoriesJson) : [];

      const updatedMemories = action === 'add'
        ? addSampleMemoriesToExisting(existingMemories)
        : filterOutSampleMemories(existingMemories);
      
      logger.info(action === 'add' ? 'Adding sample memories...' : 'Removing sample memories...');

      // Save updated memories
      await AsyncStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(updatedMemories));
      
      Alert.alert(
        'Success',
        action === 'add' ? 'Sample memories added successfully' : 'Sample memories removed successfully'
      );
    } catch (error) {
      logger.error(`Error ${action}ing sample memories:`, error);
      Alert.alert('Error', `Failed to ${action} sample memories`);
    }
  };

  const clearSampleData = () => {
    Alert.alert(
      'Clear Sample Transcripts',
      'Are you sure you want to remove all sample transcripts? This will only remove generated sample data, not your actual recordings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const rawTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
              if (!rawTranscriptions) {
                Alert.alert('Info', 'No data to clear');
                return;
              }

              const transcriptions = JSON.parse(rawTranscriptions);
              const sampleCount = transcriptions.filter(t => 
                t.id?.startsWith('sample_') || 
                t.sessionId?.includes('sample') ||
                t.metadata?.isSampleData
              ).length;

              if (sampleCount === 0) {
                Alert.alert('Info', 'No sample transcripts found to clear');
                return;
              }

              const filtered = transcriptions.filter(t => 
                !t.id?.startsWith('sample_') && 
                !t.sessionId?.includes('sample') &&
                !t.metadata?.isSampleData
              );

              await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(filtered));
              Alert.alert(
                'Success', 
                `Cleared ${sampleCount} sample transcript${sampleCount !== 1 ? 's' : ''}`
              );

              loadSettings();
            } catch (error) {
              logger.error('Error clearing sample data:', error);
              Alert.alert(
                'Error', 
                'Failed to clear sample data: ' + (error.message || 'Unknown error')
              );
            }
          }
        }
      ]
    );
  };

  const handleSampleAction = async (action) => {
    setSampleAction(action);
    if (action === 'add') {
      // For add action, we know the count from SAMPLE_CONVERSATIONS
      setSampleResult({ count: SAMPLE_CONVERSATIONS.length });
      setShowSampleModal(true);
    } else {
      // For clear action, we need to check existing count
      const count = await countSampleTranscripts();
      if (count > 0) {
        setSampleResult({ count });
        setShowSampleModal(true);
      }
    }
  };

  const handleSampleConfirm = async () => {
    setShowSampleModal(false);
    const result = await (sampleAction === 'add' ? addSampleTranscripts() : clearSampleTranscripts());
    setSampleResult(result);
    setShowResultModal(true);
  };

  return (
    <SafeAreaView style={settingsStyles.safeArea}>
      <View style={settingsStyles.container}>
        <ScrollView style={settingsStyles.scrollView}>
          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>Recording</Text>
            
            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Language</Text>
              <TouchableOpacity
                style={settingsStyles.selector}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text style={settingsStyles.selectorText}>
                  {SUPPORTED_LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>High Quality Audio</Text>
              <Switch
                value={settings.highQualityAudio}
                onValueChange={(value) => updateSetting('highQualityAudio', value)}
              />
            </View>
          </View>

          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>Transcription</Text>
            
            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Model</Text>
              <TouchableOpacity
                style={settingsStyles.selector}
                onPress={() => setShowModelModal(true)}
              >
                <Text style={settingsStyles.selectorText}>
                  {settings.model === 'nova-2' ? 'Nova-2' :
                   settings.model === 'nova' ? 'Nova' :
                   settings.model === 'base' ? 'Base' : 'Nova-2'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Auto Speaker Detection</Text>
              <Switch
                value={settings.autoSpeakerDetection}
                onValueChange={(value) => updateSetting('autoSpeakerDetection', value)}
              />
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Maximum Speakers</Text>
              <TouchableOpacity
                style={settingsStyles.selector}
                onPress={() => setShowMaxSpeakersModal(true)}
              >
                <Text style={settingsStyles.selectorText}>{settings.maxSpeakers}</Text>
              </TouchableOpacity>
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Smart Formatting</Text>
              <Switch
                value={settings.smartFormatting}
                onValueChange={(value) => updateSetting('smartFormatting', value)}
              />
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Auto Punctuation</Text>
              <Switch
                value={settings.autoPunctuation}
                onValueChange={(value) => updateSetting('autoPunctuation', value)}
              />
            </View>
          </View>

          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>Interface</Text>
            
            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Theme</Text>
              <TouchableOpacity
                style={settingsStyles.selector}
                onPress={() => setShowThemeModal(true)}
              >
                <Text style={settingsStyles.selectorText}>
                  {settings.theme === THEME_OPTIONS.LIGHT ? 'Light' :
                   settings.theme === THEME_OPTIONS.DARK ? 'Dark' : 'System'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={settingsStyles.settingRow}>
              <Text style={settingsStyles.settingLabel}>Show Tab Labels</Text>
              <Switch
                value={settings.showTabLabels}
                onValueChange={(value) => updateSetting('showTabLabels', value)}
              />
            </View>
          </View>

          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>Development</Text>
            
            <DevelopmentSettings 
              settings={settings} 
              updateSetting={updateSetting}
              generateSampleData={() => handleSampleAction('add')}
              clearSampleData={() => handleSampleAction('clear')}
              getAllAsyncStorageData={getAllAsyncStorageData}
              manageSampleMemories={manageSampleMemories}
            />
          </View>

          <TouchableOpacity 
            style={[settingsStyles.settingRow, settingsStyles.resetButtonContainer]}
            onPress={resetSettings}
          >
            <Text style={settingsStyles.settingLabel}>Reset All Settings</Text>
            <View style={[settingsStyles.selector, settingsStyles.resetSelector]}>
              <Text style={[settingsStyles.selectorText, settingsStyles.resetText]}>Reset</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <LanguageModal
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          onSelect={(code) => updateSetting('language', code)}
          currentLanguage={settings.language}
        />

        <MaxSpeakersModal
          visible={showMaxSpeakersModal}
          onClose={() => setShowMaxSpeakersModal(false)}
          onSelect={(value) => updateSetting('maxSpeakers', value)}
          currentValue={settings.maxSpeakers}
        />

        <ThemeModal
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          onSelect={(theme) => updateSetting('theme', theme)}
          currentTheme={settings.theme}
        />

        <ModelModal
          visible={showModelModal}
          onClose={() => setShowModelModal(false)}
          onSelect={(model) => updateSetting('model', model)}
          currentModel={settings.model}
        />

        <SampleTranscriptsModal
          visible={showSampleModal}
          onClose={() => setShowSampleModal(false)}
          onConfirm={handleSampleConfirm}
          action={sampleAction}
          count={sampleResult.count}
        />

        <SampleTranscriptsResultModal
          visible={showResultModal}
          onClose={() => setShowResultModal(false)}
          success={sampleResult.success}
          action={sampleAction}
          count={sampleResult.count}
        />
      </View>
    </SafeAreaView>
  );
} 