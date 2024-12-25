import { Audio } from 'expo-av';
import React from 'react';
import {
  AppState,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  CHUNK_DURATION,
  DEEPGRAM_API_KEY
} from '../config/constants';
import * as storage from '../services/storage';

// Constants
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderLeftWidth: 3,
    paddingLeft: 12,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  utteranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#6200ee',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderRadius: 4,
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
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
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

  // Refs
  const recordingInterval = React.useRef(null);
  const transcriptionQueue = React.useRef([]);
  const isProcessing = React.useRef(false);
  const scrollViewRef = React.useRef(null);
  const appState = React.useRef(AppState.currentState);
  const isUnloading = React.useRef(false);
  const lastProcessedDuration = React.useRef(0);

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

  // Add recording functions
  const startRecording = async () => {
    try {
      await cleanupRecording();
      await setupAudioSession();

      // Generate new session ID when starting recording
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
      lastStoredChunk.current.clear(); // Clear previous chunks

      console.log('🎤 Starting new recording session:', sessionId);
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 16000 * 16,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 16000 * 16,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      });
      
      await newRecording.startAsync();
      console.log('Recording started successfully');
      setRecording(newRecording);
      setIsRecording(true);
      setIsBackgroundRecording(true);

      // Start processing chunks in background
      recordingInterval.current = setInterval(async () => {
        try {
          if (!recording) return;

          const uri = recording.getURI();
          if (!uri) return;

          const currentRecording = recording;
          await startNewRecordingChunk();
          await currentRecording.stopAndUnloadAsync();
          
          // Add transcription task to queue
          processingTasks.current.push({
            type: 'transcription',
            uri,
            timestamp: Date.now()
          });

          // Start background processing
          processTasksInBackground().catch(console.error);

        } catch (error) {
          console.error('Error in recording interval:', error);
        }
      }, CHUNK_DURATION);

    } catch (err) {
      console.error('Failed to start recording:', err);
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      clearInterval(recordingInterval.current);
      const uri = recording.getURI();
      
      try {
        if (recording._isDoneRecording === false) {
          await recording.stopAndUnloadAsync();
        }
      } catch (error) {
        console.log('Recording already stopped:', error);
      }

      // Reset recording states
      setRecording(null);
      setIsRecording(false);
      setIsBackgroundRecording(false);

      // Add to processing queue if we have a URI and it hasn't been processed
      if (uri && uri !== lastProcessedUri.current) {
        lastProcessedUri.current = uri;
        processingQueue.current.push(uri);
        setTotalChunks(prev => prev + 1);
        processNextInQueue().catch(console.error);
      }

      // Verify all chunks were stored
      console.log('🔍 Verifying stored chunks for session:', currentSessionId);
      await verifyStoredTranscriptions(currentSessionId);
      
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecording(null);
      setIsRecording(false);
      setIsBackgroundRecording(false);
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
      if (!currentSessionId) {
        throw new Error('No active session ID');
      }

      const chunkId = `${currentSessionId}_chunk_${Date.now()}`;
      console.log('🎯 Processing chunk:', chunkId);

      // Validate URI
      if (!uri) {
        throw new Error('No URI provided for processing');
      }

      setProcessingStatus('Preparing audio...');
      console.log('📊 Fetching audio blob...');
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Validate blob
      console.log('📊 Blob size:', blob.size, 'bytes');
      if (blob.size < 1024) {
        console.log('⚠️ Chunk too small, skipping');
        return;
      }

      setProcessingStatus('Sending to Deepgram...');
      console.log('🚀 Sending to Deepgram API...');
      const dgResponse = await fetch(
        'https://api.deepgram.com/v1/listen?' +
        'model=whisper-large&' +
        'diarize=true&' +
        'punctuate=true&' +
        'utterances=true&' +
        'diarize_version=3&' +
        'channels=1&' +
        `language=${selectedLanguage}&` +
        'smart_format=true&' +
        'diarize_min_speakers=2&' +
        'diarize_max_speakers=2&' +
        'encoding=linear16&' +
        'sample_rate=16000',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': 'audio/wav',
          },
          body: blob
        }
      );

      // Validate Deepgram response
      if (!dgResponse.ok) {
        const errorText = await dgResponse.text();
        console.error('❌ Deepgram error details:', errorText);
        throw new Error(`Deepgram error: ${dgResponse.status} - ${errorText}`);
      }

      setProcessingStatus('Processing response...');
      console.log('📝 Processing Deepgram response...');
      const data = await dgResponse.json();

      // Validate response data
      if (!data.results) {
        throw new Error('Invalid response from Deepgram: missing results');
      }

      if (!data.results.utterances?.length) {
        console.log('ℹ️ No utterances in response');
        return;
      }

      console.log('✅ Received', data.results.utterances.length, 'utterances');

      // Process transcription
      const processedTranscription = normalizeUtterances(data.results.utterances);
      console.log('✨ Normalized transcription:', processedTranscription.length, 'utterances');
      
      // Update UI
      setTranscription(prev => [...prev, ...processedTranscription]);
      setProcessedChunks(prev => prev + 1);
      setProcessingStatus('Transcription received');

      // Store in background
      if (processedTranscription.length > 0) {
        const transcriptionData = {
          id: chunkId,
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          utterances: processedTranscription,
          audioUri: uri,
          deviceInfo: {
            platform: 'mobile',
            version: '1.0'
          },
          settings: {
            model: 'whisper-large',
            chunkDuration: CHUNK_DURATION,
          }
        };

        console.log('💾 Storing transcription for chunk:', chunkId);
        await storeTranscriptionInBackground(transcriptionData);
        
        // Track stored chunk
        lastStoredChunk.current.add(chunkId);
        console.log('✅ Transcription stored successfully:', chunkId);
      }

    } catch (error) {
      console.error('❌ Error processing chunk:', error);
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

  // Rest of your component code...

  return (
    <View style={styles.container}>
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
        >
          {transcription.map((utterance) => (
            <View
              key={utterance.id}
              style={[
                styles.utteranceContainer,
                { borderLeftColor: getColorForSpeaker(utterance.speakerId) }
              ]}
            >
              <Text style={styles.utteranceHeader}>
                <Text style={[styles.speakerLabel, { color: getColorForSpeaker(utterance.speakerId) }]}>
                  {utterance.speaker}
                </Text>
                <Text style={styles.timeLabel}>{formatTime(utterance.timeStart)}</Text>
              </Text>
              <Text style={styles.utteranceText}>{utterance.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Section - Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.navButtonText}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Summary')}
        >
          <Text style={styles.navButtonText}>Summary</Text>
        </TouchableOpacity>
      </View>

      {/* Add the language selector modal */}
      <LanguageSelector />
    </View>
  );
} 