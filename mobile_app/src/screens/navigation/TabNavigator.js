import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import settingsStyles from '../settings/styles';

// Import screens
import HistoryScreen from '../HistoryScreen';
import HomeScreen from '../HomeScreen';
// import LiveTranscriptionScreen from '../LiveTranscriptionScreen';
import MemoriesScreen from '../MemoriesScreen';
// import SummaryScreen from '../SummaryScreen';
import DeviceScreen from '../DeviceScreen';
import SettingsScreen from '../SettingsScreen';

const Tab = createBottomTabNavigator();

// Screen configurations for better maintainability
const SCREEN_CONFIG = [
  {
    name: 'Memories',
    component: MemoriesScreen,
    iconName: 'heart',
    iconOutline: 'heart-outline',
  },
  {
    name: 'Record',
    component: HomeScreen,
    iconName: 'mic',
    iconOutline: 'mic-outline',
    isLarge: true,
  },
  /*{
    name: 'Live',
    component: LiveTranscriptionScreen,
    iconName: 'radio',
    iconOutline: 'radio-outline',
  },*/
  {
    name: 'History',
    component: HistoryScreen,
    iconName: 'time',
    iconOutline: 'time-outline',
  },
  /*{
    name: 'Summary',
    component: SummaryScreen,
    iconName: 'document-text',
    iconOutline: 'document-text-outline',
  },
  {
    name: 'Settings',
    component: SettingsScreen,
    iconName: 'settings',
    iconOutline: 'settings-outline',
  },*/
];

// TabNavigator component with settings prop
const TabNavigator = ({ settings }) => {
  const navigation = useNavigation();
  
  // Screen options configuration
  const screenOptions = {
    tabBarActiveTintColor: '#6200ee',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: {
      height: 60,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingBottom: 5,
      paddingTop: 5,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      paddingBottom: 5,
      display: settings.showTabLabels ? 'flex' : 'none',
    },
    tabBarShowLabel: settings.showTabLabels,
    headerShown: true,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerLeft: () => (
      <TouchableOpacity 
        onPress={() => navigation.navigate('Device')}
        style={settingsStyles.deviceIconContainer}
      >
        <Ionicons 
          name="bluetooth-outline" 
          style={settingsStyles.deviceIcon} 
        />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity 
        onPress={() => navigation.navigate('Settings')}
        style={settingsStyles.settingsIconContainer}
      >
        <Ionicons 
          name="settings-outline" 
          style={settingsStyles.settingsIcon} 
        />
      </TouchableOpacity>
    ),
    headerTitle: '',
    headerBackground: () => <View style={{ backgroundColor: '#fff' }} />,
  };

  // Render tab icon based on screen configuration
  const renderTabIcon = (focused, color, iconName, iconOutline, isLarge) => (
    <View style={isLarge ? styles.iconContainer : null}>
      <Ionicons
        name={focused ? iconName : iconOutline}
        size={isLarge ? 32 : 24}
        color={focused && isLarge ? '#6200ee' : color}
      />
    </View>
  );

  return (
    <Tab.Navigator 
      screenOptions={screenOptions}
    >
      {SCREEN_CONFIG.map(({ name, component, iconName, iconOutline, isLarge }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ focused, color }) => 
              renderTabIcon(focused, color, iconName, iconOutline, isLarge),
          }}
        />
      ))}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Device"
        component={DeviceScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
  },
});

export default TabNavigator; 