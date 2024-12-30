import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SPLASH_MESSAGE } from '../config/constants';

const SplashScreen = ({ onComplete }) => {
  // Initialize fade animation value starting from 1 (visible)
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    // Start the fade out after a delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
      fadeAnim.setValue(1);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.message}>{SPLASH_MESSAGE}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200ee',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default SplashScreen; 