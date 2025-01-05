import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { THEME_OPTIONS } from '../config/constants';
import { baseModalStyles } from '../styles/components/modalStyles';
import BaseModal from './BaseModal';

const THEME_ITEMS = [
  { id: THEME_OPTIONS.LIGHT, label: 'Light' },
  { id: THEME_OPTIONS.DARK, label: 'Dark' },
  { id: THEME_OPTIONS.SYSTEM, label: 'System' },
];

const ThemeModal = ({ visible, onClose, onSelect, currentTheme }) => (
  <BaseModal visible={visible} onClose={onClose}>
    <Text style={baseModalStyles.title}>Select Theme</Text>
    <FlatList
      data={THEME_ITEMS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            baseModalStyles.listItem,
            currentTheme === item.id && baseModalStyles.selectedOption
          ]}
          onPress={() => {
            onSelect(item.id);
            onClose();
          }}
        >
          <Text style={[
            baseModalStyles.optionText,
            currentTheme === item.id && baseModalStyles.selectedText
          ]}>
            {item.label}
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

export default ThemeModal; 