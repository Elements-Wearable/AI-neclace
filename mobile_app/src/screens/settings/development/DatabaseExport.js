import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import logger from '../../../utils/logger';
import styles from '../styles';

export default function DatabaseExport({ getAllAsyncStorageData }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Export Database</Text>
      <TouchableOpacity
        style={[styles.selector, styles.exportSelector]}
        onPress={async () => {
          try {
            const data = await getAllAsyncStorageData();
            const jsonPath = `${FileSystem.cacheDirectory}backup.json`;
            await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(data, null, 2));
            await Sharing.shareAsync(jsonPath, {
              mimeType: 'application/json',
              dialogTitle: 'Export Database',
              UTI: 'public.json'
            });
          } catch (error) {
            logger.error('Error exporting database:', error);
            Alert.alert('Error', 'Failed to export database');
          }
        }}
      >
        <Text style={[styles.selectorText, styles.exportText]}>Export</Text>
      </TouchableOpacity>
    </View>
  );
} 