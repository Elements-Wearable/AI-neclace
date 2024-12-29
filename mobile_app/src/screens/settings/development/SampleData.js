import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles';

export default function SampleData({ generateSampleData, clearSampleData, manageSampleMemories }) {
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
          onPress={() => manageSampleMemories('add')}
        >
          <Text style={[styles.selectorText, styles.exportText]}>Generate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Clear Sample Memories</Text>
        <TouchableOpacity
          style={[styles.selector, styles.dangerSelector]}
          onPress={() => manageSampleMemories('remove')}
        >
          <Text style={[styles.selectorText, styles.dangerText]}>Clear</Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 