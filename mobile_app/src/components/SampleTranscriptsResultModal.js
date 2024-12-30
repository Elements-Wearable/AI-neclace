import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SampleTranscriptsResultModal({ visible, onClose, success, action, count }) {
  const title = success ? 'Success' : 'Error';
  const message = success
    ? action === 'add'
      ? `Successfully added ${count} sample transcripts`
      : `Successfully cleared ${count} sample transcripts`
    : action === 'add'
      ? 'Failed to add sample transcripts'
      : 'Failed to clear sample transcripts';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, success ? styles.successTitle : styles.errorTitle]}>
            {title}
          </Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity 
            style={[styles.button, success ? styles.successButton : styles.errorButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 500,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  successTitle: {
    color: '#4CAF50',
  },
  errorTitle: {
    color: '#f44336',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
}); 