import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_MEMORIES, isSampleMemory } from '../config/sampleMemories';

const MEMORIES_KEY = '@memories';

// Memory data structure follows the schema defined in memoryConstants.js

export const saveMemory = async (memoryData) => {
  try {
    const memories = await getMemories();
    const newMemory = {
      ...memoryData,
      id: memoryData.id || Math.random().toString(36).substr(2, 9),
      timestamp: memoryData.timestamp || new Date().toISOString(),
      createdAt: memoryData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newMemory, ...memories];
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
    
    return newMemory;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
};

export const getMemories = async () => {
  try {
    const data = await AsyncStorage.getItem(MEMORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting memories:', error);
    throw error;
  }
};

export const getMemoryById = async (id) => {
  try {
    const memories = await getMemories();
    return memories.find(m => m.id === id);
  } catch (error) {
    console.error('Error getting memory:', error);
    throw error;
  }
};

export const deleteMemory = async (id) => {
  try {
    const memories = await getMemories();
    const updated = memories.filter(m => m.id !== id);
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

export const clearAllMemories = async () => {
  try {
    await AsyncStorage.removeItem(MEMORIES_KEY);
  } catch (error) {
    console.error('Error clearing memories:', error);
    throw error;
  }
};

export const updateMemory = async (id, updates) => {
  try {
    const memories = await getMemories();
    const index = memories.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Memory not found');
    
    memories[index] = { 
      ...memories[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
    
    return memories[index];
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

// Sample memory management functions
export const addSampleMemories = async () => {
  try {
    const memories = await getMemories();
    // Filter out any existing sample memories first
    const realMemories = memories.filter(m => !isSampleMemory(m));
    // Add new sample memories
    const updatedMemories = [...realMemories, ...SAMPLE_MEMORIES];
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updatedMemories));
    return updatedMemories;
  } catch (error) {
    console.error('Error adding sample memories:', error);
    throw error;
  }
};

export const clearSampleMemories = async () => {
  try {
    const memories = await getMemories();
    const realMemories = memories.filter(m => !isSampleMemory(m));
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(realMemories));
    return realMemories;
  } catch (error) {
    console.error('Error clearing sample memories:', error);
    throw error;
  }
}; 