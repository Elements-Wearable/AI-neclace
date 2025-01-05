import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../config/constants';
import { baseModalStyles } from '../styles/components/modalStyles';
import BaseModal from './BaseModal';

const LanguageModal = ({ visible, onClose, onSelect, currentLanguage }) => (
  <BaseModal visible={visible} onClose={onClose}>
    <Text style={baseModalStyles.title}>Select Language</Text>
    <FlatList
      data={SUPPORTED_LANGUAGES}
      keyExtractor={(item) => item.code}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            baseModalStyles.listItem,
            currentLanguage === item.code && baseModalStyles.selectedOption
          ]}
          onPress={() => {
            onSelect(item.code);
            onClose();
          }}
        >
          <Text style={[
            baseModalStyles.optionText,
            currentLanguage === item.code && baseModalStyles.selectedText
          ]}>
            {item.name}
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

export default LanguageModal; 