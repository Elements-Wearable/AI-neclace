import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
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

  // Load memories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
    }, [])
  );

  const loadMemories = async () => {
    try {
      const loadedMemories = await getMemories();
      console.log('Loaded memories:', loadedMemories.length);
      // Show only unreviewed memories (not accepted, rejected, or skipped)
      const newMemories = loadedMemories.filter(m => 
        m.state === MEMORY_STATES.NEW
      ).sort((a, b) => 
        // Sort by datetime, newest first
        new Date(b.datetime) - new Date(a.datetime)
      );
      console.log('Filtered new memories:', newMemories.length);
      setMemories(newMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleSwipe = async (direction, memory) => {
    let newState, newStatus;
    
    switch(direction) {
      case 'right':
        newState = MEMORY_STATES.REVIEWED;
        newStatus = MEMORY_STATUS.ACCEPTED;
        break;
      case 'left':
        newState = MEMORY_STATES.REVIEWED;
        newStatus = MEMORY_STATUS.REJECTED;
        break;
      case 'down':
        newState = MEMORY_STATES.SKIPPED;
        newStatus = MEMORY_STATUS.NEW;
        break;
      default:
        return;
    }

    try {
      await updateMemory(memory.id, {
        state: newState,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Memory ${memory.id} ${direction === 'right' ? 'accepted' : direction === 'left' ? 'rejected' : 'skipped'}`);
      
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const onCardLeftScreen = (direction, memory) => {
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
          {memories.length === 0 ? (
            <Text style={styles.noMemoriesText}>No more memories to review</Text>
          ) : (
            <View style={styles.cardsWrapper}>
              {memories.map((memory) => (
                <TinderCard
                  key={memory.id}
                  onSwipe={(dir) => handleSwipe(dir, memory)}
                  onCardLeftScreen={(dir) => onCardLeftScreen(dir, memory)}
                  preventSwipe={['up']}
                  swipeRequirementType="position"
                  swipeThreshold={Math.min(SCREEN_WIDTH * 0.3, 150)}
                  flickOnSwipe={true}>
                  <View style={styles.card}>
                    {renderMemoryCard(memory)}
                    <View style={styles.swipeHints}>
                      <Text style={[styles.swipeHint, styles.swipeLeft]}>← Reject</Text>
                      <Text style={[styles.swipeHint, styles.swipeDown]}>↓ Skip</Text>
                      <Text style={[styles.swipeHint, styles.swipeRight]}>Accept →</Text>
                    </View>
                  </View>
                </TinderCard>
              ))}
            </View>
          )}
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
  swipeHints: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  swipeHint: {
    fontSize: 12,
    opacity: 0.7,
  },
  swipeLeft: {
    color: '#F44336', // Red
  },
  swipeDown: {
    color: '#FFD700', // Yellow
  },
  swipeRight: {
    color: '#4CAF50', // Green
  },
});

export default MemoriesScreen; 