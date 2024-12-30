import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSCRIPTIONS_KEY } from '../config/constants';
import { SAMPLE_CONVERSATIONS } from '../config/sampleData';
import logger from '../utils/logger';

// Schema for sample transcripts
const createSampleTranscript = (conversation, timestamp) => ({
  id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  sessionId: 'SAMPLE_SESSION',
  timestamp: timestamp.toISOString(),
  utterances: conversation.utterances,
  metadata: {
    isSampleData: true,
    sampleType: conversation.title,
    generatedAt: new Date().toISOString()
  }
});

export const addSampleTranscripts = async () => {
  try {
    // Get existing transcriptions
    const existingTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    const parsedExisting = existingTranscriptions ? JSON.parse(existingTranscriptions) : [];
    
    // Generate timestamps over yesterday and today
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Create new sample transcripts
    const newTranscripts = SAMPLE_CONVERSATIONS.map(conversation => {
      const baseDate = Math.random() < 0.5 ? now : yesterday;
      const randomHours = Math.floor(Math.random() * 12) + 8;
      const randomMinutes = Math.floor(Math.random() * 60);
      
      const timestamp = new Date(baseDate);
      timestamp.setHours(randomHours, randomMinutes, 0, 0);
      
      return createSampleTranscript(conversation, timestamp);
    });
    
    // Combine with existing transcriptions
    const allTranscriptions = [...parsedExisting, ...newTranscripts];
    
    // Save to storage
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(allTranscriptions));
    
    logger.info(`Added ${newTranscripts.length} sample transcripts`);
    return { success: true, count: newTranscripts.length };
  } catch (error) {
    logger.error('Error adding sample transcripts:', error);
    return { success: false, error };
  }
};

export const clearSampleTranscripts = async () => {
  try {
    // Get existing transcriptions
    const existingTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    if (!existingTranscriptions) {
      return { success: true, count: 0 };
    }
    
    const parsedExisting = JSON.parse(existingTranscriptions);
    
    // Filter out sample transcripts
    const nonSampleTranscripts = parsedExisting.filter(
      transcript => !transcript.metadata?.isSampleData
    );
    
    const removedCount = parsedExisting.length - nonSampleTranscripts.length;
    
    // Save filtered transcripts back to storage
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(nonSampleTranscripts));
    
    logger.info(`Removed ${removedCount} sample transcripts`);
    return { success: true, count: removedCount };
  } catch (error) {
    logger.error('Error clearing sample transcripts:', error);
    return { success: false, error };
  }
};

export const countSampleTranscripts = async () => {
  try {
    const existingTranscriptions = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    if (!existingTranscriptions) return 0;
    
    const parsedExisting = JSON.parse(existingTranscriptions);
    return parsedExisting.filter(transcript => transcript.metadata?.isSampleData).length;
  } catch (error) {
    logger.error('Error counting sample transcripts:', error);
    return 0;
  }
}; 