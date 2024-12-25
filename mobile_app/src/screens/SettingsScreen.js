import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SETTINGS_KEY, SUPPORTED_LANGUAGES } from '../config/constants';

const defaultSettings = {
  language: 'en',
  autoSpeakerDetection: true,
  maxSpeakers: 2,
  highQualityAudio: true,
  smartFormatting: true,
  utteranceThreshold: 0.3,
  autoPunctuation: true,
};

export default function SettingsScreen({ navigation }) {
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
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ label, children }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <SettingSection title="Transcription">
          <SettingRow label="Language">
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => {
                Alert.alert(
                  'Select Language',
                  '',
                  SUPPORTED_LANGUAGES.map(lang => ({
                    text: lang.name,
                    onPress: () => saveSettings({ ...settings, language: lang.code })
                  }))
                );
              }}
            >
              <Text style={styles.languageText}>
                {SUPPORTED_LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}
              </Text>
            </TouchableOpacity>
          </SettingRow>

          <SettingRow label="Auto Speaker Detection">
            <Switch
              value={settings.autoSpeakerDetection}
              onValueChange={(value) => 
                saveSettings({ ...settings, autoSpeakerDetection: value })
              }
            />
          </SettingRow>

          <SettingRow label="Maximum Speakers">
            <TouchableOpacity
              style={styles.numberSelector}
              onPress={() => {
                Alert.alert(
                  'Select Maximum Speakers',
                  '',
                  [2,3,4,5,6].map(num => ({
                    text: num.toString(),
                    onPress: () => saveSettings({ ...settings, maxSpeakers: num })
                  }))
                );
              }}
            >
              <Text style={styles.numberText}>{settings.maxSpeakers}</Text>
            </TouchableOpacity>
          </SettingRow>
        </SettingSection>

        <SettingSection title="Audio">
          <SettingRow label="High Quality Recording">
            <Switch
              value={settings.highQualityAudio}
              onValueChange={(value) => 
                saveSettings({ ...settings, highQualityAudio: value })
              }
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Processing">
          <SettingRow label="Smart Formatting">
            <Switch
              value={settings.smartFormatting}
              onValueChange={(value) => 
                saveSettings({ ...settings, smartFormatting: value })
              }
            />
          </SettingRow>

          <SettingRow label="Auto Punctuation">
            <Switch
              value={settings.autoPunctuation}
              onValueChange={(value) => 
                saveSettings({ ...settings, autoPunctuation: value })
              }
            />
          </SettingRow>
        </SettingSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  sectionContent: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  languageSelector: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  numberSelector: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  numberText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 28,
    color: '#6200ee',
  },
}); 