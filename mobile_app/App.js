import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Import your screens
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 5,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Record" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'mic' : 'mic-outline'} 
                size={32} 
                color={focused ? '#6200ee' : color}
                style={styles.recordIcon} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Summary" 
          component={SummaryScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'document-text' : 'document-text-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'time' : 'time-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  recordIcon: {
    marginBottom: -5,
  }
});
