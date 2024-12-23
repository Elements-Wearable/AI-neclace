import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSCRIPTIONS_KEY = '@transcriptions';

export const saveTranscription = async (transcriptionData) => {
  try {
    const existingData = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    const transcriptions = existingData ? JSON.parse(existingData) : [];

    // Enhanced metadata
    const metadata = {
      deviceInfo: {
        platform: transcriptionData.deviceInfo.platform,
        version: transcriptionData.deviceInfo.version,
        manufacturer: transcriptionData.deviceInfo?.manufacturer,
        model: transcriptionData.deviceInfo?.model,
      },
      settings: {
        model: transcriptionData.settings.model,
        chunkDuration: transcriptionData.settings.chunkDuration,
        language: transcriptionData.settings?.language || 'en-US',
      },
      recording: {
        startTime: transcriptionData.timestamp,
        duration: transcriptionData.totalDuration,
        format: 'audio/m4a',
        quality: 'HIGH_QUALITY',
      },
      location: transcriptionData.location ? {
        latitude: transcriptionData.location.coords?.latitude,
        longitude: transcriptionData.location.coords?.longitude,
        accuracy: transcriptionData.location.coords?.accuracy,
        timestamp: transcriptionData.location.timestamp,
      } : null,
      stats: {
        speakerCount: new Set(transcriptionData.utterances.map(u => u.speakerId)).size,
        utteranceCount: transcriptionData.utterances.length,
        totalWords: transcriptionData.utterances.reduce((acc, u) => acc + u.text.split(' ').length, 0),
        averageConfidence: transcriptionData.utterances.reduce((acc, u) => acc + (u.confidence || 0), 0) / transcriptionData.utterances.length,
      }
    };

    const newTranscription = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      metadata,
      utterances: transcriptionData.utterances,
      audioUri: transcriptionData.audioUri
    };

    const updatedTranscriptions = [...transcriptions, newTranscription];
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(updatedTranscriptions));

    return newTranscription;
  } catch (error) {
    console.error('Error saving transcription:', error);
    throw error;
  }
};

export const getTranscriptions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting transcriptions:', error);
    throw error;
  }
};

export const getTranscriptionById = async (id) => {
  try {
    const transcriptions = await getTranscriptions();
    return transcriptions.find(t => t.id === id);
  } catch (error) {
    console.error('Error getting transcription:', error);
    throw error;
  }
};

export const deleteTranscription = async (id) => {
  try {
    const transcriptions = await getTranscriptions();
    const updatedTranscriptions = transcriptions.filter(t => t.id !== id);
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(updatedTranscriptions));
  } catch (error) {
    console.error('Error deleting transcription:', error);
    throw error;
  }
};

export const clearAllTranscriptions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSCRIPTIONS_KEY);
  } catch (error) {
    console.error('Error clearing transcriptions:', error);
    throw error;
  }
}; 