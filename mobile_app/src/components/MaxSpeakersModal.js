import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { baseModalStyles } from '../styles/components/modalStyles';
import BaseModal from './BaseModal';

const SPEAKER_OPTIONS = [2, 3, 4, 5, 6];

const MaxSpeakersModal = ({ visible, onClose, onSelect, currentValue }) => (
  <BaseModal visible={visible} onClose={onClose}>
    <Text style={baseModalStyles.title}>Select Maximum Speakers</Text>
    <FlatList
      data={SPEAKER_OPTIONS}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            baseModalStyles.listItem,
            currentValue === item && baseModalStyles.selectedOption
          ]}
          onPress={() => {
            onSelect(item);
            onClose();
          }}
        >
          <Text style={[
            baseModalStyles.optionText,
            currentValue === item && baseModalStyles.selectedText
          ]}>
            {item} Speakers
          </Text>
        </TouchableOpacity>
      )}
    />
    <TouchableOpacity 
      style={baseModalStyles.secondaryButton} 
      onPress={onClose}
    >
      <Text style={baseModalStyles.secondaryButtonText}>Cancel</Text>
    </TouchableOpacity>
  </BaseModal>
);

export default MaxSpeakersModal; 