import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TinderCard from 'react-tinder-card';
import { MEMORY_STATES, MEMORY_STATUS, MEMORY_TYPES } from '../config/memoryConstants';
import { getMemories, updateMemory } from '../services/memoriesStorage';
import { memoriesStyles } from '../styles/screens/memoriesScreen';

// Helper function to check memory type
const getMemoryType = (memory) => {
  if (!memory?.type) return null;
  return Object.values(MEMORY_TYPES).find(type => type.id === memory.type) || null;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

const MemoriesScreen = () => {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // Animation values for hint opacity
  const leftOpacity = useRef(new Animated.Value(0.4)).current;
  const rightOpacity = useRef(new Animated.Value(0.4)).current;
  const downOpacity = useRef(new Animated.Value(0.4)).current;

  const animateHint = (direction) => {
    // Reset all opacities
    Animated.parallel([
      Animated.timing(leftOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rightOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(downOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate the active direction
    const activeOpacity = direction === 'left' ? leftOpacity : 
                         direction === 'right' ? rightOpacity : 
                         direction === 'down' ? downOpacity : null;
    
    if (activeOpacity) {
      Animated.timing(activeOpacity, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Load memories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
    }, [])
  );

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedMemories = await getMemories();
      console.log('Loaded memories:', loadedMemories.length);
      // Show only unreviewed memories (not accepted, rejected, or skipped)
      const newMemories = loadedMemories.filter(m => 
        m.state === MEMORY_STATES.NEW && m.type && Object.values(MEMORY_TYPES).some(type => type.id === m.type)
      ).sort((a, b) => 
        // Sort by datetime, newest first
        new Date(b.datetime) - new Date(a.datetime)
      );
      console.log('Filtered new memories:', newMemories.length);
      setMemories(newMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
      setError('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction, memory) => {
    const [newState, newStatus] = (() => {
      switch(direction) {
        case 'right':
          return [MEMORY_STATES.REVIEWED, MEMORY_STATUS.ACCEPTED];
        case 'left':
          return [MEMORY_STATES.REVIEWED, MEMORY_STATUS.REJECTED];
        case 'down':
          return [MEMORY_STATES.SKIPPED, MEMORY_STATUS.NEW];
        default:
          return [null, null];
      }
    })();

    if (!newState || !newStatus) return;

    // Optimistically update UI
    setMemories(prevMemories => prevMemories.filter(m => m.id !== memory.id));

    try {
      await updateMemory(memory.id, {
        state: newState,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Memory ${memory.id} ${direction === 'right' ? 'accepted' : direction === 'left' ? 'rejected' : 'skipped'}`);
      
    } catch (error) {
      console.error('Error updating memory:', error);
      // Revert optimistic update on error
      setMemories(prevMemories => [...prevMemories, memory]);
      setError('Failed to update memory');
    }
  };

  const onCardLeftScreen = (direction, memory) => {
    // Only remove card if it wasn't already removed by handleSwipe
    setMemories(prevMemories => prevMemories.filter(m => m.id !== memory.id));
  };

  const renderMemoryCard = (memory) => (
    <View style={memoriesStyles.cardContent}>
      <View style={memoriesStyles.cardHeader}>
        <Text style={memoriesStyles.cardTitle}>{memory.title || 'Untitled Memory'}</Text>
        <Text style={memoriesStyles.cardType}>{getMemoryType(memory)?.label || 'Memory'}</Text>
      </View>
      <Text style={memoriesStyles.cardDescription}>{memory.body || 'No description available'}</Text>
      
      <View style={memoriesStyles.memoryDetails}>
        <Text style={memoriesStyles.timestamp}>
          {memory.datetime ? new Date(memory.datetime).toLocaleString() : 'No date'}
        </Text>
        {memory.geolocation?.placeName && (
          <Text style={memoriesStyles.memoryLocation}>📍 {memory.geolocation.placeName}</Text>
        )}
        {memory.attendees?.length > 0 && (
          <Text style={memoriesStyles.attendees}>
            👥 {memory.attendees.length} {memory.attendees.length === 1 ? 'person' : 'people'}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={memoriesStyles.container}>
      <SafeAreaView style={memoriesStyles.safeArea}>
        <View style={memoriesStyles.cardContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <View style={memoriesStyles.errorContainer}>
              <Text style={memoriesStyles.errorText}>{error}</Text>
              <Text style={memoriesStyles.retryText} onPress={loadMemories}>Tap to retry</Text>
            </View>
          ) : memories.length === 0 ? (
            <Text style={memoriesStyles.noMemoriesText}>No more memories to review</Text>
          ) : (
            <View style={memoriesStyles.cardsWrapper}>
              {memories.map((memory, index) => (
                <TinderCard
                  key={memory.id}
                  onSwipe={(dir) => handleSwipe(dir, memory)}
                  onCardLeftScreen={(dir) => onCardLeftScreen(dir, memory)}
                  onSwipeRequirementFulfilled={(dir) => {
                    setSwipeDirection(dir);
                    animateHint(dir);
                  }}
                  onSwipeRequirementUnfulfilled={() => {
                    setSwipeDirection(null);
                    animateHint(null);
                  }}
                  preventSwipe={['up']}
                  swipeRequirementType="position"
                  swipeThreshold={Math.min(SCREEN_WIDTH * 0.3, 150)}
                  flickOnSwipe={true}>
                  <View style={[
                    memoriesStyles.card,
                    index === 0 && swipeDirection && memoriesStyles.cardSwiping,
                    index === 0 && swipeDirection === 'left' && memoriesStyles.swipingLeft,
                    index === 0 && swipeDirection === 'right' && memoriesStyles.swipingRight,
                    index === 0 && swipeDirection === 'down' && memoriesStyles.swipingDown,
                  ]}>
                    {renderMemoryCard(memory)}
                  </View>
                </TinderCard>
              ))}
            </View>
          )}
        </View>
        
        <View style={memoriesStyles.hintContainer}>
          <Animated.View style={[memoriesStyles.hint, { opacity: leftOpacity }]}>
            <Text style={[memoriesStyles.hintIcon, memoriesStyles.rejectColor]}>×</Text>
            <Text style={memoriesStyles.hintText}>Reject</Text>
          </Animated.View>
          <Animated.View style={[memoriesStyles.hint, { opacity: downOpacity }]}>
            <Text style={[memoriesStyles.hintIcon, memoriesStyles.skipColor]}>↓</Text>
            <Text style={memoriesStyles.hintText}>Skip</Text>
          </Animated.View>
          <Animated.View style={[memoriesStyles.hint, { opacity: rightOpacity }]}>
            <Text style={[memoriesStyles.hintIcon, memoriesStyles.acceptColor]}>✓</Text>
            <Text style={memoriesStyles.hintText}>Accept</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default MemoriesScreen; 