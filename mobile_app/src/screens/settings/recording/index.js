import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles';
import AudioQuality from './AudioQuality';
import LanguageSelector from './LanguageSelector';

export default function RecordingSettings({ settings, updateSetting }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recording</Text>
      <LanguageSelector settings={settings} updateSetting={updateSetting} />
      <AudioQuality settings={settings} updateSetting={updateSetting} />
    </View>
  );
} 