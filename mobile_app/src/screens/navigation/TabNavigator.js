import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Import screens
import HistoryScreen from '../HistoryScreen';
import HomeScreen from '../HomeScreen';
import LiveTranscriptionScreen from '../LiveTranscriptionScreen';
import MemoriesScreen from '../MemoriesScreen';
import SettingsScreen from '../SettingsScreen';
import SummaryScreen from '../SummaryScreen';

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
  {
    name: 'Live',
    component: LiveTranscriptionScreen,
    iconName: 'radio',
    iconOutline: 'radio-outline',
  },
  {
    name: 'History',
    component: HistoryScreen,
    iconName: 'time',
    iconOutline: 'time-outline',
  },
  {
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
  },
];

// TabNavigator component with settings prop
const TabNavigator = ({ settings }) => {
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
    headerShown: false,
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