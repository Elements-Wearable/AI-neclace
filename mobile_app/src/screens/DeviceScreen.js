import React from 'react';
import { Text, View } from 'react-native';
import { deviceStyles } from '../styles/screens/deviceScreen';

const DeviceScreen = () => (
    <View style={deviceStyles.container}>
      <Text style={deviceStyles.title}>Device Connection</Text>
      <Text style={deviceStyles.subtitle}>Manage your BLE device connections</Text>
    </View>
  );

export default DeviceScreen; 