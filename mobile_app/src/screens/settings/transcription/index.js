import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles';
import AutoPunctuation from './AutoPunctuation';
import SmartFormatting from './SmartFormatting';
import SpeakerDetection from './SpeakerDetection';

export default function TranscriptionSettings({ settings, updateSetting }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transcription</Text>
      <SpeakerDetection settings={settings} updateSetting={updateSetting} />
      <SmartFormatting settings={settings} updateSetting={updateSetting} />
      <AutoPunctuation settings={settings} updateSetting={updateSetting} />
    </View>
  );
} 