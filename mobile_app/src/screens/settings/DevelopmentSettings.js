import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import appJson from '../../../app.json';
import logger from '../../utils/logger';
import styles from './styles';

export default function DevelopmentSettings({ 
  settings, 
  generateSampleData,
  clearSampleData,
  getAllAsyncStorageData,
  updateSetting,
  manageSampleMemories
}) {
  const [versionTaps, setVersionTaps] = useState(0);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [availableLogs, setAvailableLogs] = useState([]);

  const handleVersionPress = () => {
    const newCount = versionTaps + 1;
    setVersionTaps(newCount);
    
    if (newCount === 5) {
      if (!settings.debugMode) {
        logger.debug('Developer options unlocked');
        Alert.alert('🎉 Developer Mode', 'Developer options enabled!');
        updateSetting('debugMode', true);
      } else {
        logger.debug('Developer options locked');
        Alert.alert('Developer Mode', 'Developer options disabled');
        updateSetting('debugMode', false);
      }
      setVersionTaps(0);
    }
  };

  const loadAvailableLogs = async () => {
    try {
      const logs = await logger.getLogFiles();
      setAvailableLogs(logs);
      setShowLogsModal(true);
    } catch (error) {
      logger.error('Failed to load log files:', error);
      Alert.alert('Error', 'Failed to load log files');
    }
  };

  const shareLog = async (logFile) => {
    try {
      await logger.shareLogFile(new Date(logFile.date));
    } catch (error) {
      logger.error('Failed to share log file:', error);
      Alert.alert('Error', 'Failed to share log file');
    }
  };

  const shareAllLogs = async () => {
    try {
      await logger.shareMultipleLogFiles(availableLogs);
      setShowLogsModal(false);
    } catch (error) {
      logger.error('Failed to share log files:', error);
      Alert.alert('Error', 'Failed to share log files');
    }
  };

  return (
    <View>
      {/* Hidden development options */}
      {settings.debugMode && (
        <>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Debug Mode</Text>
            <Switch
              value={settings.debugMode}
              onValueChange={async (value) => {
                try {
                  if (value) {
                    await logger.createNewLogFile();
                    logger.debug('Debug mode enabled');
                  } else {
                    logger.debug('Debug mode disabled');
                    await logger.closeCurrentLogFile();
                  }
                  updateSetting('debugMode', value);
                } catch (error) {
                  console.error('Failed to handle debug mode change:', error);
                  Alert.alert('Error', 'Failed to handle debug mode change');
                }
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Add Sample Transcripts</Text>
            <TouchableOpacity
              style={[styles.selector, styles.exportSelector]}
              onPress={generateSampleData}
            >
              <Text style={[styles.selectorText, styles.exportText]}>Generate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Clear Sample Transcripts</Text>
            <TouchableOpacity
              style={[styles.selector, styles.dangerSelector]}
              onPress={clearSampleData}
            >
              <Text style={[styles.selectorText, styles.dangerText]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Add Sample Memories</Text>
            <TouchableOpacity
              style={[styles.selector, styles.exportSelector]}
              onPress={() => manageSampleMemories('add')}
            >
              <Text style={[styles.selectorText, styles.exportText]}>Generate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Clear Sample Memories</Text>
            <TouchableOpacity
              style={[styles.selector, styles.dangerSelector]}
              onPress={() => manageSampleMemories('remove')}
            >
              <Text style={[styles.selectorText, styles.dangerText]}>Clear</Text>
            </TouchableOpacity>
          </View>

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

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Export Logs</Text>
            <TouchableOpacity
              style={[styles.selector, styles.exportSelector]}
              onPress={loadAvailableLogs}
            >
              <Text style={[styles.selectorText, styles.exportText]}>View Logs</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Version number always visible */}
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>App Version</Text>
        <TouchableOpacity style={[styles.selector, styles.exportSelector]} onPress={handleVersionPress}>
          <Text style={[styles.selectorText, styles.exportText]}>{appJson.expo.version}</Text>
        </TouchableOpacity>
      </View>

      {/* Logs Modal */}
      <Modal
        visible={showLogsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Debug Logs</Text>
            
            <View style={styles.searchContainer}>
              <Text style={styles.logCount}>
                {availableLogs.length} log file{availableLogs.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <ScrollView 
              style={styles.logsList}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.logsListContent}
            >
              {availableLogs.length === 0 ? (
                <Text style={styles.emptyText}>No log files available</Text>
              ) : (
                availableLogs.map((log) => (
                  <TouchableOpacity
                    key={log.name}
                    style={styles.logItem}
                    onPress={() => {
                      Alert.alert(
                        'Log Preview',
                        log.preview,
                        [
                          { text: 'Share', onPress: () => shareLog(log) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <View style={styles.logInfo}>
                      <Text style={styles.logDate}>
                        {new Date(log.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.logTime}>
                        {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.logDetails}>
                        {log.lines} entries • {(log.size / 1024).toFixed(1)} KB
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.selector, styles.exportSelector, styles.smallButton]}
                      onPress={() => shareLog(log)}
                    >
                      <Text style={[styles.selectorText, styles.exportText]}>Share</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              {availableLogs.length > 0 && (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.exportButton]}
                    onPress={shareAllLogs}
                  >
                    <View style={styles.modalButtonContent}>
                      <Text style={styles.modalButtonText}>Share All</Text>
                      <Text style={styles.modalButtonCount}>({availableLogs.length})</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.dangerButton]}
                    onPress={() => {
                      Alert.alert(
                        'Delete All Logs',
                        'Are you sure you want to delete all log files?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                const logsDir = `${FileSystem.documentDirectory}logs/`;
                                await FileSystem.deleteAsync(logsDir, { idempotent: true });
                                await FileSystem.makeDirectoryAsync(logsDir, { intermediates: true });
                                setAvailableLogs([]);
                                Alert.alert('Success', 'All log files deleted');
                              } catch (error) {
                                logger.error('Failed to delete log files:', error);
                                Alert.alert('Error', 'Failed to delete log files');
                              }
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.modalButtonText}>Delete All</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowLogsModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 