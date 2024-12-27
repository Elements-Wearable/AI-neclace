import React from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { THEME_OPTIONS } from '../../config/constants';
import styles from './styles';

export default function AppearanceSettings({ settings, updateSetting }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Theme</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => {
            Alert.alert(
              'Select Theme',
              '',
              Object.entries(THEME_OPTIONS).map(([key, value]) => ({
                text: key.charAt(0) + key.slice(1).toLowerCase(),
                onPress: () => updateSetting('theme', value)
              }))
            );
          }}
        >
          <Text style={styles.selectorText}>
            {Object.entries(THEME_OPTIONS)
              .find(([_, value]) => value === settings.theme)?.[0]
              .charAt(0) + 
              Object.entries(THEME_OPTIONS)
                .find(([_, value]) => value === settings.theme)?.[0]
                .slice(1).toLowerCase() || 'System'}
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
  );
} 