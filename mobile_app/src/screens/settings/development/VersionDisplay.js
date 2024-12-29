import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import appJson from '../../../../app.json';
import styles from '../styles';

export default function VersionDisplay({ onPress }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>App Version</Text>
      <TouchableOpacity style={[styles.selector, styles.exportSelector]} onPress={onPress}>
        <Text style={[styles.selectorText, styles.exportText]}>{appJson.expo.version}</Text>
      </TouchableOpacity>
    </View>
  );
} 