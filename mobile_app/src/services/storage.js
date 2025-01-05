import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSCRIPTIONS_KEY = '@transcriptions';
const SUMMARIES_KEY = '@voice_notes_summaries';

export const saveTranscription = async (transcriptionData) => {
  try {
    console.log('💾 Starting saveTranscription with data:', {
      id: transcriptionData.id,
      sessionId: transcriptionData.sessionId,
      utterancesCount: transcriptionData.utterances?.length
    });
    
    const existing = await getTranscriptions();
    console.log('📊 Existing transcriptions:', existing.length);
    
    // Validate required fields
    if (!transcriptionData.id || !transcriptionData.sessionId) {
      console.error('❌ Missing required fields:', { 
        hasId: !!transcriptionData.id, 
        hasSessionId: !!transcriptionData.sessionId 
      });
      throw new Error('Missing required fields in transcription data');
    }
    
    // Check for duplicates
    if (existing.some(t => t.id === transcriptionData.id)) {
      console.log('⚠️ Transcription already exists:', transcriptionData.id);
      return;
    }

    // Ensure all required fields are present
    const validatedData = {
      id: transcriptionData.id,
      sessionId: transcriptionData.sessionId,
      timestamp: transcriptionData.timestamp || new Date().toISOString(),
      utterances: transcriptionData.utterances || [],
      audioUri: transcriptionData.audioUri,
      deviceInfo: transcriptionData.deviceInfo || {},
      settings: transcriptionData.settings || {}
    };

    const updated = [...existing, validatedData];
    console.log('📝 Saving updated transcriptions:', updated.length);
    
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(updated));
    console.log('✅ Save operation completed');
    
    // Verify save
    const verificationData = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    const verifiedTranscriptions = JSON.parse(verificationData);
    const isVerified = verifiedTranscriptions.some(t => t.id === transcriptionData.id);
    
    console.log('✅ Save verification:', {
      saved: isVerified,
      totalStoredItems: verifiedTranscriptions.length
    });
    
    if (!isVerified) {
      throw new Error('Verification failed - transcription not found after save');
    }
    
  } catch (error) {
    console.error('❌ Error in saveTranscription:', error);
    throw error;
  }
};

export const getTranscriptions = async () => {
  try {
    console.log('📖 Getting all transcriptions...');
    const data = await AsyncStorage.getItem(TRANSCRIPTIONS_KEY);
    // console.log('🔍 Raw storage data:', data);
    
    const parsed = data ? JSON.parse(data) : [];
    console.log('📊 Retrieved transcriptions:', {
      count: parsed.length,
      sample: parsed.length > 0 ? {
        id: parsed[0].id,
        sessionId: parsed[0].sessionId,
        timestamp: parsed[0].timestamp,
        utterancesCount: parsed[0].utterances?.length
      } : null
    });
    
    return parsed;
  } catch (error) {
    console.error('❌ Error getting transcriptions:', error);
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

export const getTranscriptionsBySession = async (sessionId) => {
  try {
    const allTranscriptions = await getTranscriptions();
    return allTranscriptions
      .filter(t => t && t.sessionId && t.sessionId === sessionId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting transcriptions by session:', error);
    throw error;
  }
};

export const processTranscription = async (audioUri) => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsedSettings = settings ? JSON.parse(settings) : defaultSettings;

    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: await fetch(audioUri).then(r => r.blob()),
      query: {
        language: parsedSettings.language,
        model: 'general',
        smart_format: parsedSettings.smartFormatting,
        punctuate: parsedSettings.autoPunctuation,
        diarize: parsedSettings.autoSpeakerDetection,
        speakers: parsedSettings.maxSpeakers,
      },
    });

    // ... process response
  } catch (error) {
    console.error('Error processing transcription:', error);
    throw error;
  }
};

export const clearTranscriptionsByDateRange = async (startDate, endDate) => {
  try {
    const transcriptions = await getTranscriptions();
    const updatedTranscriptions = transcriptions.filter(t => {
      const transcriptionDate = new Date(t.timestamp);
      return transcriptionDate < startDate || transcriptionDate > endDate;
    });
    await AsyncStorage.setItem(TRANSCRIPTIONS_KEY, JSON.stringify(updatedTranscriptions));
  } catch (error) {
    console.error('Error clearing transcriptions by date range:', error);
    throw error;
  }
};

export const getSummaries = async () => {
  try {
    const summaries = await AsyncStorage.getItem(SUMMARIES_KEY);
    return summaries ? JSON.parse(summaries) : [];
  } catch (error) {
    console.error('Error getting summaries:', error);
    return [];
  }
};

export const saveSummary = async (summary) => {
  try {
    const summaries = await getSummaries();
    const existingIndex = summaries.findIndex(s => s.date === summary.date);
    
    if (existingIndex >= 0) {
      summaries[existingIndex] = summary;
    } else {
      summaries.push(summary);
    }
    
    await AsyncStorage.setItem(SUMMARIES_KEY, JSON.stringify(summaries));
    return true;
  } catch (error) {
    console.error('Error saving summary:', error);
    return false;
  }
};

export const deleteSummary = async (date) => {
  try {
    const summaries = await getSummaries();
    const filtered = summaries.filter(s => s.date !== date);
    await AsyncStorage.setItem(SUMMARIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting summary:', error);
    return false;
  }
}; 