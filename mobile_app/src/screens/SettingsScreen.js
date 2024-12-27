import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SETTINGS_KEY, SUPPORTED_LANGUAGES, THEME_OPTIONS, TRANSCRIPTIONS_KEY } from '../config/constants';
import { SAMPLE_CONVERSATIONS } from '../config/sampleData';
import logger from '../utils/logger';

const defaultSettings = {
  language: 'en',
  autoSpeakerDetection: true,
  maxSpeakers: 2,
  highQualityAudio: true,
  smartFormatting: true,
  utteranceThreshold: 0.3,
  autoPunctuation: true,
  showTabLabels: true,
  tabBarAnimation: true,
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
  const [logFiles, setLogFiles] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showLogFiles, setShowLogFiles] = useState(false);

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
                onPress={() => {
                  Alert.alert(
                    'Select Language',
                    '',
                    SUPPORTED_LANGUAGES.map(lang => ({
                      text: lang.name,
                      onPress: () => updateSetting('language', lang.code)
                    }))
                  );
                }}
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
                onPress={() => {
                  Alert.alert(
                    'Select Maximum Speakers',
                    '',
                    [2,3,4,5,6].map(num => ({
                      text: num.toString(),
                      onPress: () => updateSetting('maxSpeakers', num)
                    }))
                  );
                }}
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
                onPress={() => {
                  Alert.alert(
                    'Select Theme',
                    '',
                    [
                      {
                        text: 'Light',
                        onPress: () => updateSetting('theme', THEME_OPTIONS.LIGHT)
                      },
                      {
                        text: 'Dark',
                        onPress: () => updateSetting('theme', THEME_OPTIONS.DARK)
                      },
                      {
                        text: 'System',
                        onPress: () => updateSetting('theme', THEME_OPTIONS.SYSTEM)
                      }
                    ]
                  );
                }}
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

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tab Animation</Text>
              <Switch
                value={settings.tabBarAnimation}
                onValueChange={(value) => updateSetting('tabBarAnimation', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Add Sample Data</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={generateSampleData}
              >
                <Text style={styles.selectorText}>Generate</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Clear Sample Data</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => {
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
                            // Get and parse transcriptions
                            const rawTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
                            if (!rawTranscriptions) {
                              Alert.alert('Info', 'No data to clear');
                              return;
                            }

                            const transcriptions = JSON.parse(rawTranscriptions);
                            
                            // Count sample data before filtering
                            const sampleCount = transcriptions.filter(t => 
                              t.id?.startsWith('sample_') || 
                              t.sessionId?.includes('sample') ||
                              t.metadata?.isSampleData
                            ).length;

                            if (sampleCount === 0) {
                              Alert.alert('Info', 'No sample data found to clear');
                              return;
                            }

                            // Filter out sample data
                            const filtered = transcriptions.filter(t => 
                              // Keep items that don't match any sample data criteria
                              !t.id?.startsWith('sample_') && 
                              !t.sessionId?.includes('sample') &&
                              !t.metadata?.isSampleData
                            );

                            // Save filtered data
                            await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(filtered));
                            
                            // Show success message with count
                            Alert.alert(
                              'Success', 
                              `Cleared ${sampleCount} sample transcription${sampleCount !== 1 ? 's' : ''}`
                            );

                            // Optionally refresh settings/UI if needed
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
              >
                <Text style={styles.selectorText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Export Database</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={async () => {
                  try {
                    // Show loading state
                    Alert.alert('Preparing Export', 'Please wait while we prepare your data...');

                    // Create a temporary directory for export
                    const tempDir = `${FileSystem.cacheDirectory}export/`;
                    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

                    // Get all data dynamically
                    const storageData = await getAllAsyncStorageData();

                    const exportData = {
                      data: storageData,
                      metadata: {
                        exportDate: new Date().toISOString(),
                        appVersion: require('../../app.json').expo.version,
                        platform: Platform.OS,
                        platformVersion: Platform.Version,
                        storageKeys: Object.keys(storageData),
                        dataTypes: Object.entries(storageData).reduce((acc, [key, value]) => {
                          acc[key] = {
                            type: typeof value,
                            isArray: Array.isArray(value),
                            itemCount: Array.isArray(value) ? value.length : null,
                            size: JSON.stringify(value).length
                          };
                          return acc;
                        }, {})
                      }
                    };

                    // Save JSON data with formatted output
                    const jsonPath = `${tempDir}voicenotes_backup_${new Date().toISOString().split('T')[0]}.json`;
                    await FileSystem.writeAsStringAsync(
                      jsonPath,
                      JSON.stringify(exportData, null, 2)
                    );

                    // Check if sharing is available
                    const isSharingAvailable = await Sharing.isAvailableAsync();
                    
                    if (isSharingAvailable) {
                      // Share the JSON file directly
                      await Sharing.shareAsync(jsonPath, {
                        mimeType: 'application/json',
                        dialogTitle: 'Export Voice Notes Data',
                        UTI: 'public.json'
                      });

                      // Show export summary
                      Alert.alert(
                        'Export Complete',
                        `Successfully exported ${Object.keys(storageData).length} data items\n` +
                        `Total size: ${(JSON.stringify(exportData).length / 1024).toFixed(2)} KB`
                      );
                    } else {
                      Alert.alert('Error', 'Sharing is not available on this device');
                    }

                    // Cleanup temporary files
                    await FileSystem.deleteAsync(tempDir, { idempotent: true });

                  } catch (error) {
                    console.error('Error exporting data:', error);
                    Alert.alert(
                      'Export Error',
                      'Failed to export data: ' + (error.message || 'Unknown error')
                    );
                  }
                }}
              >
                <Text style={styles.selectorText}>Export</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Debug Mode</Text>
              <Switch
                value={settings.debugMode}
                onValueChange={(value) => updateSetting('debugMode', value)}
              />
            </View>

            {settings.debugMode && (
              <>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Debug Logs</Text>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={async () => {
                      try {
                        await loadLogFiles();
                        setShowLogFiles(true);
                      } catch (error) {
                        logger.error('Failed to load log files:', error);
                        Alert.alert(
                          'Error',
                          'Failed to load log files: ' + (error.message || 'Unknown error')
                        );
                      }
                    }}
                  >
                    <Text style={styles.selectorText}>View Logs</Text>
                  </TouchableOpacity>
                </View>

                {/* Debug Logs Modal */}
                <Modal
                  visible={showLogFiles}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setShowLogFiles(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Debug Logs</Text>
                      
                      <ScrollView style={styles.logFilesList}>
                        {logFiles.map((file) => (
                          <TouchableOpacity
                            key={file.name}
                            style={[
                              styles.logFileItem,
                              selectedLogs.includes(file) && styles.logFileItemSelected
                            ]}
                            onPress={() => {
                              setSelectedLogs(prev => 
                                prev.includes(file)
                                  ? prev.filter(f => f !== file)
                                  : [...prev, file]
                              );
                            }}
                          >
                            <View style={styles.logFileInfo}>
                              <Text style={styles.logFileDate}>
                                {new Date(file.date).toLocaleDateString()}
                              </Text>
                              <Text style={styles.logFileSize}>
                                {(file.size / 1024).toFixed(1)} KB
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.logFileShareButton}
                              onPress={() => logger.shareLogFile(new Date(file.date))}
                            >
                              <Text style={styles.logFileShareText}>Share</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <View style={styles.modalButtons}>
                        {selectedLogs.length > 0 && (
                          <TouchableOpacity
                            style={[styles.modalButton, styles.exportButton]}
                            onPress={async () => {
                              try {
                                await logger.shareMultipleLogFiles(selectedLogs);
                                setSelectedLogs([]);
                              } catch (error) {
                                Alert.alert('Error', 'Failed to export logs');
                              }
                            }}
                          >
                            <Text style={styles.modalButtonText}>
                              Export Selected ({selectedLogs.length})
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => {
                            setShowLogFiles(false);
                            setSelectedLogs([]);
                          }}
                        >
                          <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>App Version</Text>
              <View style={styles.selector}>
                {/* Display app version from app.json dynamically */}
                <Text style={styles.selectorText}>
                  {require('../../app.json').expo.version}
                </Text>
              </View>
            </View>
          </View>

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
}); 