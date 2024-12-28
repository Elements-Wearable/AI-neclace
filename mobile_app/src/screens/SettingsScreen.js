import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LanguageModal from '../components/LanguageModal';
import MaxSpeakersModal from '../components/MaxSpeakersModal';
import ThemeModal from '../components/ThemeModal';
import {
    SETTINGS_KEY, SUPPORTED_LANGUAGES,
    THEME_OPTIONS,
    TRANSCRIPTIONS_KEY
} from '../config/constants';
import { SAMPLE_CONVERSATIONS } from '../config/sampleData';
import logger from '../utils/logger';
import DevelopmentSettings from './settings/DevelopmentSettings';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recording</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Language</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text style={styles.selectorText}>
                  {SUPPORTED_LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>High Quality Audio</Text>
              <Switch
                value={settings.highQualityAudio}
                onValueChange={(value) => updateSetting('highQualityAudio', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transcription</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Speaker Detection</Text>
              <Switch
                value={settings.autoSpeakerDetection}
                onValueChange={(value) => updateSetting('autoSpeakerDetection', value)}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Maximum Speakers</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowMaxSpeakersModal(true)}
              >
                <Text style={styles.selectorText}>{settings.maxSpeakers}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Smart Formatting</Text>
              <Switch
                value={settings.smartFormatting}
                onValueChange={(value) => updateSetting('smartFormatting', value)}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Punctuation</Text>
              <Switch
                value={settings.autoPunctuation}
                onValueChange={(value) => updateSetting('autoPunctuation', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interface</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Theme</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowThemeModal(true)}
              >
                <Text style={styles.selectorText}>
                  {settings.theme === THEME_OPTIONS.LIGHT ? 'Light' :
                   settings.theme === THEME_OPTIONS.DARK ? 'Dark' : 'System'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Show Tab Labels</Text>
              <Switch
                value={settings.showTabLabels}
                onValueChange={(value) => updateSetting('showTabLabels', value)}
              />
            </View>
          </View>

          <DevelopmentSettings 
            settings={settings}
            generateSampleData={generateSampleData}
            clearSampleData={() => {
              Alert.alert(
                'Clear Sample Data',
                'Are you sure you want to remove all sample data? This will only remove generated sample data, not your actual recordings.',
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
                          Alert.alert('Info', 'No sample data found to clear');
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
                          `Cleared ${sampleCount} sample transcription${sampleCount !== 1 ? 's' : ''}`
                        );

                        loadSettings();
                      } catch (error) {
                        console.error('Error clearing sample data:', error);
                        Alert.alert(
                          'Error', 
                          'Failed to clear sample data: ' + (error.message || 'Unknown error')
                        );
                      }
                    }
                  }
                ]
              );
            }}
            getAllAsyncStorageData={getAllAsyncStorageData}
            updateSetting={updateSetting}
          />

          <TouchableOpacity 
            style={[styles.settingRow, styles.resetButtonContainer]}
            onPress={resetSettings}
          >
            <Text style={styles.settingLabel}>Reset All Settings</Text>
            <View style={[styles.selector, styles.resetSelector]}>
              <Text style={[styles.selectorText, styles.resetText]}>Reset</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 4,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  selector: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resetButtonContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  resetSelector: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    minWidth: 100,
  },
  resetText: {
    color: '#dc3545',
  },
  button: undefined,
  buttonText: undefined,
  resetButton: undefined,
  resetButtonText: undefined,
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  logFilesList: {
    maxHeight: '70%',
  },
  logFileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  logFileItemSelected: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  logFileInfo: {
    flex: 1,
  },
  logFileDate: {
    fontSize: 16,
    marginBottom: 4,
  },
  logFileSize: {
    fontSize: 14,
    color: '#666',
  },
  logFileShareButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  logFileShareText: {
    color: '#6200ee',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 