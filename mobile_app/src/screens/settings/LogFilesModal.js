import React from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import logger from '../../utils/logger';
import styles from './styles';

export default function LogFilesModal({
  showLogFiles,
  setShowLogFiles,
  logFiles,
  selectedLogs,
  setSelectedLogs
}) {
  return (
    <Modal
      visible={showLogFiles}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowLogFiles(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Debug Logs</Text>
          
          <ScrollView style={styles.logFilesList}>
            {logFiles.map((file) => (
              <TouchableOpacity
                key={file.name}
                style={[
                  styles.logFileItem,
                  selectedLogs.includes(file) && styles.logFileItemSelected
                ]}
                onPress={() => {
                  setSelectedLogs(prev => 
                    prev.includes(file)
                      ? prev.filter(f => f !== file)
                      : [...prev, file]
                  );
                }}
              >
                <View style={styles.logFileInfo}>
                  <Text style={styles.logFileDate}>
                    {new Date(file.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.logFileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.logFileShareButton}
                  onPress={() => logger.shareLogFile(new Date(file.date))}
                >
                  <Text style={styles.logFileShareText}>Share</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            {selectedLogs.length > 0 && (
              <TouchableOpacity
                style={[styles.modalButton, styles.exportButton]}
                onPress={async () => {
                  try {
                    await logger.shareMultipleLogFiles(selectedLogs);
                    setSelectedLogs([]);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to export logs');
                  }
                }}
              >
                <Text style={styles.modalButtonText}>
                  Export Selected ({selectedLogs.length})
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowLogFiles(false);
                setSelectedLogs([]);
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 