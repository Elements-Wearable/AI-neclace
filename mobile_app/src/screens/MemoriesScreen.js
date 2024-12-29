import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEMORY_STATES, SWIPE_COLORS } from '../config/memoryConstants';
import { getMemories, updateMemory } from '../services/memoriesStorage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

const MemoriesScreen = () => {
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const loadedMemories = await getMemories();
      // Only show unreviewed memories
      const newMemories = loadedMemories.filter(m => m.state === MEMORY_STATES.NEW);
      setMemories(newMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleSwipeComplete = async (direction) => {
    const currentMemory = memories[currentIndex];
    const isAccepted = direction === 'right';
    
    try {
      await updateMemory(currentMemory.id, {
        state: isAccepted ? MEMORY_STATES.ACCEPTED : MEMORY_STATES.REJECTED,
        reviewedAt: Date.now()
      });
      
      console.log(`Memory ${currentMemory.id} ${isAccepted ? 'accepted' : 'rejected'}`);
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx, dy }) => {
        swipe.setValue({ x: dx, y: dy });
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

  const renderCard = (memory, isTop) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{memory.title}</Text>
          <Text style={styles.cardType}>{memory.type}</Text>
        </View>
        <Text style={styles.cardContent}>{memory.content}</Text>
        {memory.tags && (
          <View style={styles.tagContainer}>
            {memory.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
        <Text style={styles.timestamp}>
          {new Date(memory.timestamp).toLocaleDateString()}
        </Text>
        
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
  };

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  cardContent: {
    fontSize: 16,
    marginBottom: 15,
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    fontSize: 14,
    color: '#6200ee',
    marginRight: 8,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    position: 'absolute',
    bottom: 20,
    right: 20,
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