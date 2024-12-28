import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TabAnimationModal = ({ visible, onClose, currentAnimation, onSelect }) => {
  // Animation options with descriptions
  const ANIMATION_OPTIONS = [
    { 
      id: 'none', 
      label: 'None',
      description: 'No animation between tab transitions',
      icon: 'remove-circle-outline'
    },
    { 
      id: 'fade', 
      label: 'Fade',
      description: 'Smooth fade transition between tabs',
      icon: 'flash-outline'
    },
    { 
      id: 'shift', 
      label: 'Shift',
      description: 'Sliding shift effect between tabs',
      icon: 'move-outline'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Tab Animation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {ANIMATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                currentAnimation === option.id && styles.selectedOption
              ]}
              onPress={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <View style={styles.optionContent}>
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color={currentAnimation === option.id ? '#6200ee' : '#666'} 
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              {currentAnimation === option.id && (
                <Ionicons name="checkmark" size={24} color="#6200ee" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#f0e6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 15,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default TabAnimationModal; 