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
  SafeAreaView,
  ScrollView,
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
import { homeStyles } from '../styles/screens/homeScreen';
import logger from '../utils/logger';

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
      <View style={homeStyles.modalOverlay}>
        <View style={homeStyles.languageModal}>
          <Text style={homeStyles.modalTitle}>Select Language</Text>
          <ScrollView style={homeStyles.languageList}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  homeStyles.languageOption,
                  selectedLanguage === lang.code && homeStyles.selectedLanguage
                ]}
                onPress={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[
                  homeStyles.languageText,
                  selectedLanguage === lang.code && homeStyles.selectedLanguageText
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={homeStyles.closeButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={homeStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Update the transcription card UI to show more metadata
  const TranscriptionCard = ({ utterance, metadata }) => {
    const { time, date } = formatDateTime(utterance.timestamp);

    if (!metadata) {
      console.warn('Missing metadata for utterance:', utterance.id);
      return null;
    }

    return (
      <View style={homeStyles.utteranceContainer}>
        <View style={homeStyles.utteranceHeader}>
          <View style={homeStyles.speakerInfo}>
            <Text style={homeStyles.speakerLabel}>
              {utterance.speaker}
            </Text>
            <Text style={homeStyles.confidenceScore}>
              {Math.round(utterance.confidence * 100)}% confidence
            </Text>
          </View>
          <View style={homeStyles.timeInfo}>
            <Text style={homeStyles.dateLabel}>{date}</Text>
            <Text style={homeStyles.timeLabel}>{time}</Text>
          </View>
        </View>

        <Text style={homeStyles.utteranceText}>{utterance.text}</Text>

        <View style={homeStyles.metadataContainer}>
          <Text style={homeStyles.metadataLabel}>
            Language: {metadata.detectedLanguage || 'Not detected'}
          </Text>
          {metadata.topics && metadata.topics.length > 0 && (
            <View style={homeStyles.topicsContainer}>
              <Text style={homeStyles.metadataLabel}>Topics:</Text>
              <View style={homeStyles.topicsList}>
                {metadata.topics.map((topic, index) => (
                  <View key={index} style={homeStyles.topicTag}>
                    <Text style={homeStyles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <Text style={homeStyles.metadataLabel}>
            Words: {metadata.wordCount || 0}
          </Text>
          <Text style={homeStyles.metadataLabel}>
            Duration: {(metadata.duration || 0).toFixed(2)}s
          </Text>
          {metadata.processingSettings && (
            <>
              <Text style={homeStyles.metadataLabel}>
                Quality: {metadata.processingSettings.audioQuality || 'Standard'}
              </Text>
              <Text style={homeStyles.metadataLabel}>
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
    <SafeAreaView style={homeStyles.safeArea}>
      <View style={homeStyles.container}>
        {/* Top Section with Test and Clear Buttons */}
        <View style={homeStyles.topBar}>
          <View style={homeStyles.buttonGroup}>
            <TouchableOpacity
              style={homeStyles.testButton}
              onPress={processTestAudio}
            >
              <Text style={homeStyles.testButtonText}>Test Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={homeStyles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Section - Recording Controls */}
        <View style={homeStyles.topSection}>
          <TouchableOpacity
            style={homeStyles.recordButton}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={false}
          >
            <View style={[
              homeStyles.recordButtonInner,
              isRecording && homeStyles.recordingActive,
              (!isRecording && isProcessingChunk) && homeStyles.processingActive
            ]}>
              <View style={[
                homeStyles.recordDot,
                isRecording && homeStyles.recordingDot,
                (!isRecording && isProcessingChunk) && homeStyles.processingDot
              ]} />
            </View>
          </TouchableOpacity>

          <Text style={homeStyles.recordingStatus}>
            {!isRecording && isProcessingChunk
              ? 'Processing last recording...'
              : isRecording
                ? 'Recording...'
                : 'Tap to Record'
            }
          </Text>

          {processingStatus && (
            <View style={homeStyles.processingInfo}>
              <View style={homeStyles.processingStatusContainer}>
                <Text style={homeStyles.processingInfoText}>
                  {processingStatus}
                </Text>
                {totalChunks > 0 && (
                  <Text style={homeStyles.processingProgress}>
                    ({processedChunks}/{totalChunks})
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Middle Section - Live Transcription */}
        <View style={homeStyles.transcriptionWrapper}>
          <ScrollView
            style={homeStyles.transcriptionScroll}
            contentContainerStyle={homeStyles.transcriptionContent}
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