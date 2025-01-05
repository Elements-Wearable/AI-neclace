import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  getDeepgramApiKey,
  SETTINGS_KEY,
  SUPPORTED_LANGUAGES
} from '../config/constants';
import * as storage from '../services/storage';
import logger from '../utils/logger';

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Add padding for Android
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  transcriptionContainer: {
    marginTop: 20,
    gap: 10,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  utteranceContainer: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  utteranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  confidenceScore: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  utteranceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    marginRight: 8,
  },
  recordingText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    maxHeight: '85%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6200ee',
    fontSize: 16,
  },
  summaryModal: {
    backgroundColor: 'white',
    maxHeight: '70%',
  },
  summaryContainer: {
    flex: 1,
    marginVertical: 15,
  },
  summaryTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryStats: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
    fontWeight: '500',
  },
  summaryTextContainer: {
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  summaryCloseButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 4,
    marginTop: 8,
  },
  processingText: {
    marginLeft: 8,
    color: '#6200ee',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
  taskQueueIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskQueueText: {
    fontSize: 12,
    color: '#6200ee',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 10,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  activeStatus: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  transcriptionSection: {
    flex: 1,
    maxHeight: '50%', // Limit height
    marginTop: 20,
  },
  buttonsSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLine: {
    width: 2,
    backgroundColor: '#6200ee',
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  topSection: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  recordDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  recordingActive: {
    backgroundColor: '#dc3545',
  },
  recordingDot: {
    width: 20,
    height: 20,
  },
  transcriptionWrapper: {
    flex: 1,
    marginTop: 16,
  },
  processingButton: {
    backgroundColor: '#FFA000', // Orange color for processing state
  },
  recordingStatus: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  processingActive: {
    backgroundColor: '#2196F3',
  },
  processingDot: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  processingInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  processingStatusContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  processingInfoText: {
    fontSize: 13,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
  },
  processingProgress: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '400',
  },
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  languageModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  languageList: {
    marginVertical: 15,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedLanguage: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
  },
  metadataContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  topicsContainer: {
    marginVertical: 4,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topicTag: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    color: '#6200ee',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  testButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Helper function
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Add this helper function before the HomeScreen component
const getColorForSpeaker = (speakerId) => {
  const colors = [
    '#6200ee',  // Purple
    '#03dac6',  // Teal
    '#ff6b6b',  // Red
    '#4CAF50',  // Green
    '#ff9800',  // Orange
  ];
  
  if (speakerId === 'system') return '#666666';
  if (speakerId === 'error') return '#dc3545';
  
  // Use modulo to cycle through colors if there are more speakers than colors
  return colors[speakerId % colors.length];
};

// Add these utility functions at the top level
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const processWithRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      await delay(delayMs * (i + 1)); // Exponential backoff
    }
  }
  throw lastError;
};

// Add this function to get settings
const getSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

// Add this helper function for formatting timestamps
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return {
    time: date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    date: date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  };
};

// Main component
export default function HomeScreen({ navigation }) {
  // State declarations
  const [recording, setRecording] = React.useState();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcription, setTranscription] = React.useState([]);
  const [speakerColors, setSpeakerColors] = React.useState({});
  const [isBackgroundRecording, setIsBackgroundRecording] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summaryData, setSummaryData] = React.useState(null);
  const [isProcessingChunk, setIsProcessingChunk] = React.useState(false);
  const processingQueue = React.useRef([]);
  const [isHistoryEnabled, setIsHistoryEnabled] = React.useState(true);
  const processingTasks = React.useRef([]);
  const isProcessingTask = React.useRef(false);
  const [processingStatus, setProcessingStatus] = React.useState(null);
  const [processedChunks, setProcessedChunks] = React.useState(0);
  const [totalChunks, setTotalChunks] = React.useState(0);
  const lastProcessedUri = React.useRef(null);
  const [currentSessionId, setCurrentSessionId] = React.useState(null);
  const lastStoredChunk = React.useRef(new Set());
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);
  const [appSettings, setAppSettings] = React.useState(null);
  const [settings, setSettings] = React.useState(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  // Refs
  const recordingInterval = React.useRef(null);
  const transcriptionQueue = React.useRef([]);
  const isProcessing = React.useRef(false);
  const scrollViewRef = React.useRef(null);
  const appState = React.useRef(AppState.currentState);
  const isUnloading = React.useRef(false);
  const lastProcessedDuration = React.useRef(0);

  // Load settings in useEffect
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const checkDevelopmentMode = async () => {
      try {
        const settings = await getSettings();
        const devMode = settings?.developmentMode || false;
        console.log('Development mode:', devMode); // Debug log
        setIsDevelopmentMode(devMode);
      } catch (error) {
        console.error('Error checking development mode:', error);
      }
    };
    checkDevelopmentMode();
  }, []);

  // Add summarization function
  const summarizeTranscriptions = async () => {
    try {
      setIsSummarizing(true);
      
      const allTranscriptions = await storage.getTranscriptions();
      const today = new Date().toDateString();
      const todaysTranscriptions = allTranscriptions.filter(t => 
        new Date(t.timestamp).toDateString() === today
      );

      if (todaysTranscriptions.length === 0) {
        setSummaryData({ error: 'No conversations recorded today' });
        return;
      }

      // Rest of your summarization logic...
    } catch (error) {
      console.error('Error summarizing conversations:', error);
      setSummaryData({ error: 'Failed to generate summary' });
    } finally {
      setIsSummarizing(false);
    }
  };

  // Update setupRecording function
  const setupRecording = async () => {
    try {
      console.log('Setting up new recording...');
      const settings = await getSettings();
      
      const recording = new Audio.Recording();
      
      // Use high quality setting from settings
      const recordingOptions = settings.highQualityAudio 
        ? Audio.RecordingOptionsPresets.HIGH_QUALITY
        : Audio.RecordingOptionsPresets.LOW_QUALITY;
      
      await recording.prepareToRecordAsync(recordingOptions);
      
      console.log('Recording prepared with quality:', settings.highQualityAudio ? 'HIGH' : 'LOW');
      return recording;
    } catch (error) {
      console.error('Error in setupRecording:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      logger.debug('Starting recording...');
      
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Recording permission not granted');
      }

      // Setup audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create new session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
      logger.debug('Created new session:', sessionId);

      // Setup recording with high quality
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      logger.info('Recording started successfully');

    } catch (error) {
      logger.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    try {
      logger.debug('Stopping recording...');
      
      if (!recording) {
        logger.warn('No recording to stop');
        return;
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      logger.debug('Recording stopped, URI:', uri);

      // Reset recording states
      setIsRecording(false);
      setRecording(null);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Process the recording
      await processRecording(uri);

    } catch (error) {
      logger.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    } finally {
      setIsRecording(false);
      setRecording(null);
    }
  };

  const cleanupRecording = async () => {
    try {
      clearInterval(recordingInterval.current);
      if (recording) {
        try {
          if (recording._isDoneRecording === false) {
            await recording.stopAndUnloadAsync();
          }
        } catch (error) {
          console.log('Recording already stopped or unloaded:', error);
        }
      }
      setRecording(null);
      setIsRecording(false);
      setIsBackgroundRecording(false);
    } catch (error) {
      console.error('Error in cleanup:', error);
      setRecording(null);
      setIsRecording(false);
      setIsBackgroundRecording(false);
    }
  };

  const setupAudioSession = async () => {
    try {
      console.log('Setting up audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      console.log('Audio session setup complete');
    } catch (error) {
      console.error('Failed to setup audio session:', error);
      throw error;
    }
  };

  const startNewRecordingChunk = async () => {
    try {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting new chunk:', error);
      await cleanupRecording();
    }
  };

  // Add this function inside HomeScreen component
  const processTranscriptionQueue = async () => {
    if (isProcessing.current || transcriptionQueue.current.length === 0) return;

    try {
      isProcessing.current = true;
      setIsTranscribing(true);

      while (transcriptionQueue.current.length > 0) {
        const uri = transcriptionQueue.current.shift();
        if (uri) {
          await processChunkInRealTime(uri);
        }
      }
    } catch (error) {
      console.error('Error processing transcription queue:', error);
    } finally {
      isProcessing.current = false;
      setIsTranscribing(false);
    }
  };

  // Update the processChunkInRealTime function
  const processChunkInRealTime = async (uri) => {
    try {
      logger.debug('Processing transcription...', { uri });
      const settings = await getSettings();
      
      // Get API key
      const apiKey = await getDeepgramApiKey();
      if (!apiKey) {
        throw new Error('Deepgram API key not found. Please set it in settings.');
      }

      // Read the audio file
      const audioResponse = await fetch(uri);
      if (!audioResponse.ok) {
        throw new Error(`Failed to read audio file: ${audioResponse.status}`);
      }

      // Get the audio data as a blob
      const audioBlob = await audioResponse.blob();

      // Build query parameters
      const queryParams = new URLSearchParams({
        model: 'general',
        language: settings.language || 'en-US',
        smart_format: settings.smartFormatting ? 'true' : 'false',
        punctuate: settings.autoPunctuation ? 'true' : 'false',
        diarize: settings.autoSpeakerDetection ? 'true' : 'false',
        utterances: 'true',
        tier: 'enhanced'
      }).toString();

      const apiUrl = `https://api.deepgram.com/v1/listen?${queryParams}`;
      
      // Send to Deepgram
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/m4a'
        },
        body: audioBlob
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (!result?.results?.channels?.[0]?.alternatives?.[0]) {
        logger.warn('No transcription results in response');
        return;
      }

      const transcriptData = result.results.channels[0].alternatives[0];
      
      // Create utterance with complete information
      const utterance = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        speaker: `Speaker ${transcriptData.speaker || 1}`,
        speakerId: transcriptData.speaker || 1,
        text: transcriptData.transcript,
        confidence: transcriptData.confidence,
        words: transcriptData.words,
        timestamp: new Date().toISOString(),
        metadata: {
          detectedLanguage: result.metadata?.detected_language,
          duration: result.metadata?.duration,
          channels: result.metadata?.channels,
          modelInfo: result.metadata?.model_info
        }
      };

      logger.debug('Processing transcript:', utterance);
      
      if (utterance.text.trim()) {
        // Update UI with new transcription
        setTranscription(prev => [...prev, utterance]);
        setProcessedChunks(prev => prev + 1);

        // Store transcription data
        const transcriptionData = {
          id: utterance.id,
          sessionId: currentSessionId,
          timestamp: utterance.timestamp,
          utterances: [utterance],
          audioUri: uri,
          metadata: utterance.metadata,
          settings
        };

        await storeTranscriptionInBackground(transcriptionData);
        logger.info('Transcription processed and stored successfully');
        return transcriptionData;
      }
    } catch (error) {
      logger.error('Error processing transcription:', {
        error: error.message,
        stack: error.stack,
        uri
      });
      throw error;
    }
  };

  // Add this helper function for storing transcriptions
  const storeTranscriptionInBackground = async (transcriptionData) => {
    try {
      console.log('📝 Starting storage process for:', transcriptionData.id);
      await storage.saveTranscription(transcriptionData);
      
      // Verify storage immediately after saving
      const stored = await storage.getTranscriptions();
      const isStored = stored.some(t => t.id === transcriptionData.id);
      console.log('✅ Storage verification:', isStored ? 'Successfully stored' : 'Failed to store');
      
      if (!isStored) {
        console.error('❌ Transcription not found in storage after save attempt');
      }
    } catch (error) {
      console.error('❌ Error storing transcription:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Add this helper function for normalizing utterances
  const normalizeUtterances = (utterances) => {
    // Map to track speaker confidence scores
    const speakerConfidenceMap = new Map();
    
    // First pass: collect confidence scores for each speaker
    utterances.forEach(utterance => {
      const speakerId = utterance.speaker;
      const currentConfidence = speakerConfidenceMap.get(speakerId) || {
        totalConfidence: 0,
        count: 0,
        words: 0
      };
      
      currentConfidence.totalConfidence += utterance.confidence || 0;
      currentConfidence.count += 1;
      currentConfidence.words += utterance.words?.length || 0;
      
      speakerConfidenceMap.set(speakerId, currentConfidence);
    });

    // Sort speakers by their average confidence and word count
    const sortedSpeakers = Array.from(speakerConfidenceMap.entries())
      .sort((a, b) => {
        const aScore = (a[1].totalConfidence / a[1].count) * a[1].words;
        const bScore = (b[1].totalConfidence / b[1].count) * b[1].words;
        return bScore - aScore;
      })
      .map(([id]) => id);

    // Create mapping for speaker normalization
    const speakerMapping = new Map(
      sortedSpeakers.map((id, index) => [id, index])
    );

    // Process utterances with normalized speaker IDs
    return utterances
      .map((utterance, index) => {
        const normalizedSpeakerId = speakerMapping.get(utterance.speaker);
        return {
          id: `${Date.now()}-${index}`,
          speaker: `Speaker ${normalizedSpeakerId + 1}`,
          speakerId: normalizedSpeakerId,
          text: utterance.transcript,
          confidence: utterance.confidence,
          timeStart: utterance.start,
          timeEnd: utterance.end,
          timestamp: new Date().toISOString(),
        };
      })
      .filter(utterance => utterance.text.trim().length > 0);
  };

  // Update the queue processing function
  const processNextInQueue = async () => {
    // If already processing or queue is empty, return
    if (isTranscribing || processingQueue.current.length === 0) {
      setIsProcessingChunk(false);
      return;
    }

    try {
      setIsTranscribing(true);
      setIsProcessingChunk(true);

      while (processingQueue.current.length > 0) {
        const uri = processingQueue.current[0]; // Peek at first item
        
        try {
          await processChunkInRealTime(uri);
          processingQueue.current.shift(); // Remove processed item
        } catch (error) {
          console.error('Error processing chunk:', error);
          processingQueue.current.shift(); // Remove failed item
        }
      }
    } finally {
      setIsTranscribing(false);
      setIsProcessingChunk(false);
    }
  };

  // Add this background processing system
  const processTasksInBackground = async () => {
    if (isProcessingTask.current || processingTasks.current.length === 0) return;

    try {
      isProcessingTask.current = true;
      
      while (processingTasks.current.length > 0) {
        const task = processingTasks.current[0]; // Peek at the first task
        
        if (task.type === 'transcription') {
          setIsProcessingChunk(true);
          try {
            await processChunkInRealTime(task.uri);
            processingTasks.current.shift(); // Remove completed task
          } catch (error) {
            console.error('Task processing error:', error);
            processingTasks.current.shift(); // Remove failed task
          }
        }
      }
    } finally {
      isProcessingTask.current = false;
      setIsProcessingChunk(false);
    }
  };

  // Add verification function
  const verifyStoredTranscriptions = async (sessionId) => {
    try {
      const stored = await storage.getTranscriptionsBySession(sessionId);
      console.log(`📊 Verification - Session ${sessionId}:`, {
        storedChunks: stored.length,
        trackedChunks: lastStoredChunk.current.size
      });
      
      if (stored.length !== lastStoredChunk.current.size) {
        console.warn('⚠️ Some chunks may not have been stored properly');
        // Optionally retry storage for missing chunks
      }
    } catch (error) {
      console.error('Error verifying transcriptions:', error);
    }
  };

  // Add the language selector modal component
  const LanguageSelector = () => (
    <Modal
      visible={showLanguageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.languageModal}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <ScrollView style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === lang.code && styles.selectedLanguage
                ]}
                onPress={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === lang.code && styles.selectedLanguageText
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Update the transcription card UI to show more metadata
  const TranscriptionCard = ({ utterance, metadata }) => {
    const { time, date } = formatDateTime(utterance.timestamp);
    
    // Add null check for metadata
    if (!metadata) {
      console.warn('Missing metadata for utterance:', utterance.id);
      return null;
    }
    
    return (
      <View style={styles.utteranceContainer}>
        <View style={styles.utteranceHeader}>
          <View style={styles.speakerInfo}>
            <Text style={styles.speakerLabel}>
              {utterance.speaker}
            </Text>
            <Text style={styles.confidenceScore}>
              {Math.round(utterance.confidence * 100)}% confidence
            </Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.dateLabel}>{date}</Text>
            <Text style={styles.timeLabel}>{time}</Text>
          </View>
        </View>
        
        <Text style={styles.utteranceText}>{utterance.text}</Text>
        
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataLabel}>
            Language: {metadata.detectedLanguage || 'Not detected'}
          </Text>
          {metadata.topics && metadata.topics.length > 0 && (
            <View style={styles.topicsContainer}>
              <Text style={styles.metadataLabel}>Topics:</Text>
              <View style={styles.topicsList}>
                {metadata.topics.map((topic, index) => (
                  <View key={index} style={styles.topicTag}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <Text style={styles.metadataLabel}>
            Words: {metadata.wordCount || 0}
          </Text>
          <Text style={styles.metadataLabel}>
            Duration: {(metadata.duration || 0).toFixed(2)}s
          </Text>
          {metadata.processingSettings && (
            <>
              <Text style={styles.metadataLabel}>
                Quality: {metadata.processingSettings.audioQuality || 'Standard'}
              </Text>
              <Text style={styles.metadataLabel}>
                Speaker Detection: {metadata.processingSettings.speakerDetection ? 'ON' : 'OFF'}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  // Add this function inside the HomeScreen component
  const handleClearAll = () => {
    Alert.alert(
      'Clear All Recordings',
      'Are you sure you want to delete all recordings? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearAllTranscriptions();
              setTranscription([]); // Clear current transcriptions
              setProcessedChunks(0);
              setTotalChunks(0);
              console.log('✨ All recordings cleared');
            } catch (error) {
              console.error('Error clearing recordings:', error);
              Alert.alert('Error', 'Failed to clear recordings');
            }
          }
        }
      ]
    );
  };

  const processTestAudio = async () => {
    try {
      logger.debug('Starting test audio processing...');
      const settings = await getSettings();

      // Get API key
      const apiKey = await getDeepgramApiKey();
      if (!apiKey) {
        throw new Error('Deepgram API key not found. Please set it in settings.');
      }

      // Create a session ID for this test
      const testSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(testSessionId);

      // Load and prepare the test audio file
      const asset = await Asset.loadAsync(require('../../assets/file1.wav'));
      logger.debug('Asset loaded:', asset[0]);

      // Read the file as binary data
      const fileUri = asset[0].localUri || asset[0].uri;
      logger.debug('File URI:', fileUri);

      const audioData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      logger.debug('Audio data loaded, length:', audioData.length);

      // Build query parameters
      const queryParams = new URLSearchParams({
        model: 'general',
        language: settings.language || 'en-US',
        smart_format: settings.smartFormatting ? 'true' : 'false',
        punctuate: settings.autoPunctuation ? 'true' : 'false',
        diarize: settings.autoSpeakerDetection ? 'true' : 'false',
        utterances: 'true',
        tier: 'enhanced'
      }).toString();

      const apiUrl = `https://api.deepgram.com/v1/listen?${queryParams}`;
      logger.debug('Sending request to:', apiUrl);
      
      // Send to Deepgram
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/wav',
          'Accept': 'application/json'
        },
        body: Buffer.from(audioData, 'base64')
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Deepgram API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      logger.debug('Deepgram response:', result);

      if (!result?.results?.channels?.[0]?.alternatives?.[0]) {
        throw new Error('No transcription results in response');
      }

      const transcriptData = result.results.channels[0].alternatives[0];
      logger.debug('Transcript data:', transcriptData);
      
      // Create utterance
      const utterance = {
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        speaker: `Speaker ${transcriptData.speaker || 1}`,
        speakerId: transcriptData.speaker || 1,
        text: transcriptData.transcript,
        confidence: transcriptData.confidence,
        words: transcriptData.words,
        timestamp: new Date().toISOString(),
        metadata: {
          detectedLanguage: result.metadata?.detected_language,
          duration: result.metadata?.duration,
          channels: result.metadata?.channels,
          modelInfo: result.metadata?.model_info,
          isTestAudio: true
        }
      };

      // Update UI
      setTranscription(prev => [...prev, utterance]);

      // Store transcription
      const transcriptionData = {
        id: utterance.id,
        sessionId: testSessionId,
        timestamp: utterance.timestamp,
        utterances: [utterance],
        audioUri: fileUri,
        metadata: utterance.metadata,
        settings,
        isTestAudio: true
      };

      await storeTranscriptionInBackground(transcriptionData);
      logger.info('Test audio processed successfully');

    } catch (error) {
      logger.error('Error processing test audio:', {
        error: error.message,
        stack: error.stack
      });
      Alert.alert(
        'Error',
        `Failed to process test audio: ${error.message}. Check logs for details.`
      );
    }
  };

  // Add new function to process the recording
  const processRecording = async (uri) => {
    try {
      console.log('🎤 Starting to process recording...', { uri });
      const settings = await getSettings();
      console.log('⚙️ Settings loaded:', settings);
      
      // Get API key
      const apiKey = await getDeepgramApiKey();
      console.log('🔑 API key retrieved:', apiKey ? 'Yes' : 'No');
      if (!apiKey) {
        throw new Error('Deepgram API key not found');
      }

      // Read the audio file
      console.log('📂 Reading audio file...');
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📄 File info:', fileInfo);

      // Read file as base64
      console.log('📥 Loading audio data...');
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      console.log('📦 Audio data loaded, length:', audioData.length);

      // Build query parameters
      const queryParams = new URLSearchParams({
        model: 'general',
        language: settings.language || 'en-US',
        smart_format: settings.smartFormatting ? 'true' : 'false',
        punctuate: settings.autoPunctuation ? 'true' : 'false',
        diarize: settings.autoSpeakerDetection ? 'true' : 'false',
        utterances: 'true',
        tier: 'enhanced'
      }).toString();

      const apiUrl = `https://api.deepgram.com/v1/listen?${queryParams}`;
      console.log('🌐 Sending request to Deepgram:', apiUrl);

      // Send to Deepgram
      console.log('📡 Preparing to send request...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/wav',
          'Accept': 'application/json'
        },
        body: Buffer.from(audioData, 'base64')
      });
      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Deepgram API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✨ Deepgram response received:', {
        hasResults: !!result?.results,
        hasChannels: !!result?.results?.channels,
        hasAlternatives: !!result?.results?.channels?.[0]?.alternatives,
        metadata: result.metadata
      });

      if (!result?.results?.channels?.[0]?.alternatives?.[0]) {
        console.error('❌ Invalid response structure:', result);
        throw new Error('No transcription results in response');
      }

      const transcriptData = result.results.channels[0].alternatives[0];
      console.log('📝 Transcript data:', {
        hasText: !!transcriptData.transcript,
        confidence: transcriptData.confidence,
        wordCount: transcriptData.words?.length,
        transcript: transcriptData.transcript
      });
      
      // Create utterance
      const utterance = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        speaker: `Speaker ${transcriptData.speaker || 1}`,
        speakerId: transcriptData.speaker || 1,
        text: transcriptData.transcript,
        confidence: transcriptData.confidence,
        words: transcriptData.words,
        timestamp: new Date().toISOString(),
        metadata: {
          detectedLanguage: result.metadata?.detected_language,
          duration: result.metadata?.duration,
          channels: result.metadata?.channels,
          modelInfo: result.metadata?.model_info
        }
      };
      console.log('📋 Created utterance:', utterance);

      // Update UI
      setTranscription(prev => [...prev, utterance]);
      console.log('🔄 UI updated with new transcription');

      // Store transcription
      const transcriptionData = {
        id: utterance.id,
        sessionId: currentSessionId,
        timestamp: utterance.timestamp,
        utterances: [utterance],
        audioUri: uri,
        metadata: utterance.metadata,
        settings
      };

      await storeTranscriptionInBackground(transcriptionData);
      console.log('💾 Recording processed and stored successfully');

    } catch (error) {
      console.error('❌ Error processing recording:', {
        message: error.message,
        stack: error.stack,
        uri: uri
      });
      Alert.alert('Error', `Failed to process recording: ${error.message}`);
    }
  };

  // Rest of your component code...

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Section with Test and Clear Buttons */}
        <View style={styles.topBar}>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={processTestAudio}
            >
              <Text style={styles.testButtonText}>Test Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Section - Recording Controls */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={false}
          >
            <View style={[
              styles.recordButtonInner,
              isRecording && styles.recordingActive,
              (!isRecording && isProcessingChunk) && styles.processingActive
            ]}>
              <View style={[
                styles.recordDot,
                isRecording && styles.recordingDot,
                (!isRecording && isProcessingChunk) && styles.processingDot
              ]} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.recordingStatus}>
            {!isRecording && isProcessingChunk 
              ? 'Processing last recording...' 
              : isRecording 
                ? 'Recording...' 
                : 'Tap to Record'
            }
          </Text>

          {processingStatus && (
            <View style={styles.processingInfo}>
              <View style={styles.processingStatusContainer}>
                <Text style={styles.processingInfoText}>
                  {processingStatus}
                </Text>
                {totalChunks > 0 && (
                  <Text style={styles.processingProgress}>
                    ({processedChunks}/{totalChunks})
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Middle Section - Live Transcription */}
        <View style={styles.transcriptionWrapper}>
          <ScrollView 
            style={styles.transcriptionScroll}
            contentContainerStyle={styles.transcriptionContent}
            ref={scrollViewRef}
          >
            {[...transcription].reverse().map((utterance) => (
              <TranscriptionCard 
                key={utterance.id}
                utterance={utterance}
                metadata={utterance.metadata}
              />
            ))}
          </ScrollView>
        </View>

        {/* Add the language selector modal */}
        <LanguageSelector />
      </View>
    </SafeAreaView>
  );
} 