import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Available Deepgram models
const MODELS = [
  { id: 'nova-2', name: 'Nova-2', description: 'Latest and most accurate model' },
  { id: 'nova', name: 'Nova', description: 'Fast and accurate for general use' },
  { id: 'base', name: 'Base', description: 'Fastest processing, good for real-time' }
];

export default function ModelModal({ visible, onClose, onSelect, currentModel }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Model</Text>
          <ScrollView style={styles.optionsList}>
            {MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.option,
                  currentModel === model.id && styles.selectedOption
                ]}
                onPress={() => onSelect(model.id)}
              >
                <View>
                  <Text style={[
                    styles.optionText,
                    currentModel === model.id && styles.selectedText
                  ]}>
                    {model.name}
                  </Text>
                  <Text style={styles.descriptionText}>
                    {model.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
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
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  optionsList: {
    marginVertical: 15,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 