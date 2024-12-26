import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
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
import { SETTINGS_KEY, SUPPORTED_LANGUAGES, TRANSCRIPTIONS_KEY } from '../config/constants';
import { SAMPLE_CONVERSATIONS } from '../config/sampleData';

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
};

export default function SettingsScreen() {
  const [settings, setSettings] = React.useState(defaultSettings);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Force an immediate update
      if (key === 'showTabLabels') {
        // Add a small delay to ensure the AsyncStorage write is complete
        setTimeout(async () => {
          const verify = await AsyncStorage.getItem(SETTINGS_KEY);
          console.log('Updated settings:', verify);
        }, 100);
      }
    } catch (error) {
      console.error('Error saving setting:', error);
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
      // Get existing transcriptions
      const existingTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
      const parsedExisting = existingTranscriptions ? JSON.parse(existingTranscriptions) : [];
      
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
        
        newTranscriptions.push({
          id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: `session_${conversation.title.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timestamp.toISOString(),
          utterances: conversation.utterances
        });
      });
      
      // Combine with existing transcriptions
      const allTranscriptions = [...parsedExisting, ...newTranscriptions];
      
      // Save to storage
      await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(allTranscriptions));
      
      Alert.alert('Success', 'Sample transcriptions have been added!');
    } catch (error) {
      console.error('Error generating sample data:', error);
      Alert.alert('Error', 'Failed to generate sample data');
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
            
            <TouchableOpacity 
              style={styles.button}
              onPress={generateSampleData}
            >
              <Text style={styles.buttonText}>
                Add Sample Data
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetSettings}
          >
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
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
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  selector: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  selectorText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    margin: 20,
    padding: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: '#999',
  },
}); 