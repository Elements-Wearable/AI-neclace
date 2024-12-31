import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DeviceScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Device Connection</Text>
      <Text style={styles.subtitle}>Manage your BLE device connections</Text>
    </View>
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default DeviceScreen; 