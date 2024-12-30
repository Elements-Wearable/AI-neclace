import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TinderCard from 'react-tinder-card';
import { MEMORY_STATES, MEMORY_STATUS, MEMORY_TYPES } from '../config/memoryConstants';
import { getMemories, updateMemory } from '../services/memoriesStorage';

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
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{memory.title || 'Untitled Memory'}</Text>
        <Text style={styles.cardType}>{getMemoryType(memory)?.label || 'Memory'}</Text>
      </View>
      <Text style={styles.cardDescription}>{memory.body || 'No description available'}</Text>
      
      <View style={styles.memoryDetails}>
        <Text style={styles.timestamp}>
          {memory.datetime ? new Date(memory.datetime).toLocaleString() : 'No date'}
        </Text>
        {memory.geolocation?.placeName && (
          <Text style={styles.memoryLocation}>📍 {memory.geolocation.placeName}</Text>
        )}
        {memory.attendees?.length > 0 && (
          <Text style={styles.attendees}>
            👥 {memory.attendees.length} {memory.attendees.length === 1 ? 'person' : 'people'}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cardContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText} onPress={loadMemories}>Tap to retry</Text>
            </View>
          ) : memories.length === 0 ? (
            <Text style={styles.noMemoriesText}>No more memories to review</Text>
          ) : (
            <View style={styles.cardsWrapper}>
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
                    styles.card,
                    index === 0 && swipeDirection && styles.cardSwiping,
                    index === 0 && swipeDirection === 'left' && styles.swipingLeft,
                    index === 0 && swipeDirection === 'right' && styles.swipingRight,
                    index === 0 && swipeDirection === 'down' && styles.swipingDown,
                  ]}>
                    {renderMemoryCard(memory)}
                  </View>
                </TinderCard>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.hintContainer}>
          <Animated.View style={[styles.hint, { opacity: leftOpacity }]}>
            <Text style={[styles.hintIcon, styles.rejectColor]}>×</Text>
            <Text style={styles.hintText}>Reject</Text>
          </Animated.View>
          <Animated.View style={[styles.hint, { opacity: downOpacity }]}>
            <Text style={[styles.hintIcon, styles.skipColor]}>↓</Text>
            <Text style={styles.hintText}>Skip</Text>
          </Animated.View>
          <Animated.View style={[styles.hint, { opacity: rightOpacity }]}>
            <Text style={[styles.hintIcon, styles.acceptColor]}>✓</Text>
            <Text style={styles.hintText}>Accept</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    flex: 1,
  },
  memoryDetails: {
    marginTop: 'auto',
    gap: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  memoryLocation: {
    fontSize: 14,
    color: '#666',
  },
  attendees: {
    fontSize: 14,
    color: '#666',
  },
  noMemoriesText: {
    fontSize: 18,
    color: '#666',
  },
  cardType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  hint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  hintIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
  },
  rejectColor: {
    color: 'rgba(244, 67, 54, 0.6)',
  },
  acceptColor: {
    color: 'rgba(76, 175, 80, 0.6)',
  },
  skipColor: {
    color: 'rgba(255, 215, 0, 0.6)',
  },
  cardSwiping: {
    transform: [{ scale: 1.02 }],
  },
  swipingLeft: {
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderWidth: 1,
  },
  swipingRight: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
  },
  swipingDown: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
});

export default MemoriesScreen; 