import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles';

export default function LogExport({ loadAvailableLogs }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Export Logs</Text>
      <TouchableOpacity
        style={[styles.selector, styles.exportSelector]}
        onPress={loadAvailableLogs}
      >
        <Text style={[styles.selectorText, styles.exportText]}>View Logs</Text>
      </TouchableOpacity>
    </View>
  );
} 