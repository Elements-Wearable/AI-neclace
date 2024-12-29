import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SPEAKER_OPTIONS = [2, 3, 4, 5, 6];

const MaxSpeakersModal = ({ visible, onClose, onSelect, currentValue }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Maximum Speakers</Text>
          <FlatList
            data={SPEAKER_OPTIONS}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.speakerItem,
                  currentValue === item && styles.selectedItem
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.speakerText}>{item} Speakers</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  speakerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  speakerText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MaxSpeakersModal; 