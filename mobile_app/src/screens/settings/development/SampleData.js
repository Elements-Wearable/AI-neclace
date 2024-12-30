import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { addSampleMemories, clearSampleMemories } from '../../../services/memoriesStorage';
import styles from '../styles';

export default function SampleData({ generateSampleData, clearSampleData }) {
  const handleSampleMemories = async (action) => {
    try {
      if (action === 'add') {
        await addSampleMemories();
        Alert.alert('Success', 'Sample memories added successfully');
      } else if (action === 'clear') {
        await clearSampleMemories();
        Alert.alert('Success', 'Sample memories cleared successfully');
      }
    } catch (error) {
      console.error('Error managing sample memories:', error);
      Alert.alert('Error', `Failed to ${action} sample memories`);
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