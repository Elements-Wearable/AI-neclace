import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { isSampleMemory } from '../../../config/sampleMemories';
import { addSampleMemories, clearSampleMemories, getMemories } from '../../../services/memoriesStorage';
import styles from '../styles';

export default function SampleData({ generateSampleData, clearSampleData }) {
  const handleSampleMemories = async (action) => {
    try {
      if (action === 'add') {
        const updatedMemories = await addSampleMemories();
        Alert.alert(
          'Success',
          `Added ${updatedMemories.length - (updatedMemories.filter(m => !m.title?.startsWith('SAMPLE:')).length)} sample memories successfully`
        );
      } else if (action === 'clear') {
        // Get current memories to count samples
        const currentMemories = await getMemories();
        const sampleCount = currentMemories.filter(m => isSampleMemory(m)).length;

        if (sampleCount === 0) {
          Alert.alert('Info', 'No sample memories found to clear');
          return;
        }

        Alert.alert(
          'Clear Sample Memories',
          `Are you sure you want to remove all ${sampleCount} sample memories? This will remove all memories with "SAMPLE:" prefix.`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: async () => {
                const realMemories = await clearSampleMemories();
                const removedCount = currentMemories.length - realMemories.length;
                Alert.alert(
                  'Success',
                  `Cleared ${removedCount} sample memories successfully`
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error managing sample memories:', error);
      Alert.alert('Error', `Failed to ${action} sample memories: ${error.message}`);
    }
  };

  return (
    <>
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
          onPress={() => handleSampleMemories('add')}
        >
          <Text style={[styles.selectorText, styles.exportText]}>Generate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Clear Sample Memories</Text>
        <TouchableOpacity
          style={[styles.selector, styles.dangerSelector]}
          onPress={() => handleSampleMemories('clear')}
        >
          <Text style={[styles.selectorText, styles.dangerText]}>Clear</Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 