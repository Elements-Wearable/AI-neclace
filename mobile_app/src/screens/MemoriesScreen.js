import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEMORY_STATES, MEMORY_STATUS, MEMORY_TYPES, SWIPE_COLORS } from '../config/memoryConstants';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const swipe = useRef(new Animated.ValueXY()).current;

  // Add interpolated color based on swipe direction
  const backgroundColor = swipe.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [SWIPE_COLORS.REJECT, 'white', SWIPE_COLORS.ACCEPT],
  });

  // Add interpolated opacity for accept/reject overlays
  const acceptOpacity = swipe.x.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const rejectOpacity = swipe.x.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Load memories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
      return () => {
        // Reset current index when leaving screen
        setCurrentIndex(0);
      };
    }, [])
  );

  const loadMemories = async () => {
    try {
      const loadedMemories = await getMemories();
      console.log('Loaded memories:', loadedMemories.length);
      // Show only new memories
      const newMemories = loadedMemories.filter(m => 
        m.status === MEMORY_STATUS.NEW && 
        m.state === MEMORY_STATES.NEW
      ).sort((a, b) => 
        // Sort by datetime, newest first
        new Date(b.datetime) - new Date(a.datetime)
      );
      console.log('Filtered new memories:', newMemories.length);
      setMemories(newMemories);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleSwipeComplete = async (direction) => {
    // Prevent multiple swipes while updating
    if (isUpdating || currentIndex >= memories.length) return;
    
    const currentMemory = memories[currentIndex];
    const isAccepted = direction === 'right';
    
    try {
      setIsUpdating(true);
      
      // Update both state and status
      await updateMemory(currentMemory.id, {
        state: isAccepted ? MEMORY_STATES.REVIEWED : MEMORY_STATES.SKIPPED,
        status: isAccepted ? MEMORY_STATUS.ACCEPTED : MEMORY_STATUS.REJECTED,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Memory ${currentMemory.id} ${isAccepted ? 'accepted' : 'rejected'}`);
      
      // Only increment if we still have memories and haven't moved on
      if (currentIndex < memories.length) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isUpdating,
      onPanResponderMove: (_, { dx, dy }) => {
        if (!isUpdating) {
          swipe.setValue({ x: dx, y: dy });
        }
      },
      onPanResponderRelease: (_, { dx, dy }) => {
        const direction = Math.sign(dx);
        const isActionActive = Math.abs(dx) > 100;

        if (isActionActive) {
          Animated.timing(swipe, {
            duration: 200,
            toValue: {
              x: direction * 500,
              y: dy,
            },
            useNativeDriver: true,
          }).start(() => {
            handleSwipeComplete(direction > 0 ? 'right' : 'left');
            swipe.setValue({ x: 0, y: 0 });
          });
          return;
        }

        Animated.spring(swipe, {
          toValue: {
            x: 0,
            y: 0,
          },
          useNativeDriver: true,
          friction: 5,
        }).start();
      },
    })
  ).current;

  const rotate = swipe.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: ['8deg', '0deg', '-8deg'],
  });

  const animatedCardStyle = {
    transform: [...swipe.getTranslateTransform(), { rotate }],
    backgroundColor,
  };

  if (currentIndex >= memories.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cardContainer}>
          <Text style={styles.noMemoriesText}>No more memories to review</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMemoryCard = (memory) => (
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{memory.title}</Text>
      </View>
      <Text style={styles.cardDescription}>{memory.body}</Text>
      
      <View style={styles.memoryDetails}>
        <Text style={styles.timestamp}>
          {new Date(memory.datetime).toLocaleString()}
        </Text>
        {memory.geolocation?.placeName && (
          <Text style={styles.memoryLocation}>📍 {memory.geolocation.placeName}</Text>
        )}
        {memory.attendees > 0 && (
          <Text style={styles.attendees}>
            👥 {memory.attendees} {memory.attendees === 1 ? 'person' : 'people'}
          </Text>
        )}
      </View>
    </View>
  );

  const renderCard = (memory, isTop) => (
      <View style={styles.card}>
        {renderMemoryCard(memory)}
        {isTop && (
          <>
            <Animated.View style={[styles.overlay, styles.acceptOverlay, { opacity: acceptOpacity }]}>
              <Text style={styles.overlayText}>KEEP</Text>
            </Animated.View>
            <Animated.View style={[styles.overlay, styles.rejectOverlay, { opacity: rejectOpacity }]}>
              <Text style={styles.overlayText}>REJECT</Text>
            </Animated.View>
          </>
        )}
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {memories
          .map((memory, index) => {
            if (index < currentIndex) return null;

            if (index === currentIndex) {
              return (
                <Animated.View
                  key={memory.id}
                  style={[styles.cardWrapper, animatedCardStyle]}
                  {...panResponder.panHandlers}>
                  {renderCard(memory, true)}
                </Animated.View>
              );
            }

            return (
              <Animated.View
                key={memory.id}
                style={[
                  styles.cardWrapper,
                  {
                    transform: [{ scale: 0.95 }],
                    top: 10,
                  },
                ]}>
                {renderCard(memory, false)}
              </Animated.View>
            );
          })
          .reverse()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
  overlay: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  acceptOverlay: {
    right: 20,
    borderColor: SWIPE_COLORS.ACCEPT,
  },
  rejectOverlay: {
    left: 20,
    borderColor: SWIPE_COLORS.REJECT,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MemoriesScreen; 