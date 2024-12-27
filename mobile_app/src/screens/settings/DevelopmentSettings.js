import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import logger from '../../utils/logger';
import styles from './styles';

export default function DevelopmentSettings({ 
  settings, 
  generateSampleData,
  logFiles,
  selectedLogs,
  setSelectedLogs,
  showLogFiles,
  setShowLogFiles,
  loadLogFiles 
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Development</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Add Sample Data</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={generateSampleData}
        >
          <Text style={styles.selectorText}>Generate</Text>
        </TouchableOpacity>
      </View>

      {settings.debugMode && (
        <>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Debug Logs</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={async () => {
                try {
                  await loadLogFiles();
                  setShowLogFiles(true);
                } catch (error) {
                  logger.error('Failed to load log files:', error);
                  Alert.alert(
                    'Error',
                    'Failed to load log files: ' + (error.message || 'Unknown error')
                  );
                }
              }}
            >
              <Text style={styles.selectorText}>View Logs</Text>
            </TouchableOpacity>
          </View>

          <LogFilesModal
            showLogFiles={showLogFiles}
            setShowLogFiles={setShowLogFiles}
            logFiles={logFiles}
            selectedLogs={selectedLogs}
            setSelectedLogs={setSelectedLogs}
          />
        </>
      )}

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>App Version</Text>
        <View style={styles.selector}>
          <Text style={styles.selectorText}>
            {require('../../../app.json').expo.version}
          </Text>
        </View>
      </View>
    </View>
  );
} 