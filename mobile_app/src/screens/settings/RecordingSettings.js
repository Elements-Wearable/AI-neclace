import React from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../../config/constants';
import styles from './styles';

export default function RecordingSettings({ settings, updateSetting }) {
  return (
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
  );
} 