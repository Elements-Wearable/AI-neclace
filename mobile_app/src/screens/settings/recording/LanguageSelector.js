import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../../../config/constants';
import styles from '../styles';

export default function LanguageSelector({ settings, updateSetting }) {
  return (
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
  );
} 