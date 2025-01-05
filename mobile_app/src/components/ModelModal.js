import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { baseModalStyles } from '../styles/components/modalStyles';
import BaseModal from './BaseModal';

// Available Deepgram models
const MODELS = [
  { id: 'nova-2', name: 'Nova-2', description: 'Latest and most accurate model' },
  { id: 'nova', name: 'Nova', description: 'Fast and accurate for general use' },
  { id: 'base', name: 'Base', description: 'Fastest processing, good for real-time' }
];

export default function ModelModal({ visible, onClose, onSelect, currentModel }) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <Text style={baseModalStyles.title}>Select Model</Text>
      <ScrollView style={baseModalStyles.scrollableContent}>
        {MODELS.map((model) => (
          <TouchableOpacity
            key={model.id}
            style={[
              baseModalStyles.option,
              currentModel === model.id && baseModalStyles.selectedOption
            ]}
            onPress={() => onSelect(model.id)}
          >
            <View>
              <Text style={[
                baseModalStyles.optionText,
                currentModel === model.id && baseModalStyles.selectedText
              ]}>
                {model.name}
              </Text>
              <Text style={baseModalStyles.descriptionText}>
                {model.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={baseModalStyles.secondaryButton}
        onPress={onClose}
      >
        <Text style={baseModalStyles.secondaryButtonText}>Close</Text>
      </TouchableOpacity>
    </BaseModal>
  );
} 