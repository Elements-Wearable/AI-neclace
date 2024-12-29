import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles';
import TabLabels from './TabLabels';
import ThemeSelector from './ThemeSelector';

export default function InterfaceSettings({ settings, updateSetting }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interface</Text>
      <ThemeSelector settings={settings} updateSetting={updateSetting} />
      <TabLabels settings={settings} updateSetting={updateSetting} />
    </View>
  );
} 