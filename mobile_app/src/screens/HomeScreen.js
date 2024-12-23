import { Audio } from 'expo-av';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React from 'react';
import { ActivityIndicator, AppState, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as storage from '../services/storage';

// Add your Deepgram API key here
const DEEPGRAM_API_KEY = '017aecbe395694de283f91aa6824b178ac7ba37b';
const CHUNK_DURATION = 5000; // Duration of each chunk in milliseconds (5 seconds)
const BACKGROUND_RECORDING_TASK = 'BACKGROUND_RECORDING_TASK';

// Register background task
TaskManager.defineTask(BACKGROUND_RECORDING_TASK, async () => {
  try {
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Move formatTime outside of HomeScreen component
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Create a separate History component
const HistoryView = ({ isVisible, onClose, formatTime }) => {
  const [historyData, setHistoryData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isVisible) {
      loadHistory();
    }
  }, [isVisible]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const allTranscriptions = await storage.getTranscriptions();
      const recent = allTranscriptions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      setHistoryData(recent);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recent Conversations</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <ScrollView style={styles.historyList}>
              {historyData.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Text style={styles.historyDate}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                  
                  <View style={styles.metadataContainer}>
                    <Text style={styles.metadataTitle}>Details:</Text>
                    {item.metadata?.recording?.duration && (
                      <Text style={styles.metadataText}>
                        Duration: {formatTime(item.metadata.recording.duration)}
                      </Text>
                    )}
                    {item.metadata?.stats && (
                      <>
                        <Text style={styles.metadataText}>
                          Speakers: {item.metadata.stats.speakerCount || 0}
                        </Text>
                        <Text style={styles.metadataText}>
                          Words: {item.metadata.stats.totalWords || 0}
                        </Text>
                        {item.metadata.stats.averageConfidence && (
                          <Text style={styles.metadataText}>
                            Accuracy: {Math.round(item.metadata.stats.averageConfidence * 100)}%
                          </Text>
                        )}
                      </>
                    )}
                    {item.metadata?.location?.coords && (
                      <View style={styles.locationContainer}>
                        <Text style={styles.metadataTitle}>Location:</Text>
                        {item.metadata.location.coords.latitude && (
                          <Text style={styles.metadataText}>
                            Lat: {item.metadata.location.coords.latitude.toFixed(4)}
                          </Text>
                        )}
                        {item.metadata.location.coords.longitude && (
                          <Text style={styles.metadataText}>
                            Long: {item.metadata.location.coords.longitude.toFixed(4)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.historyUtterances}>
                    {item.utterances?.map((utterance, uIndex) => (
                      <View key={`${item.id}-${uIndex}`} style={styles.historyUtterance}>
                        <Text style={styles.historySpeaker}>
                          {utterance.speaker || 'Unknown'}
                        </Text>
                        <Text style={styles.historyText}>
                          {utterance.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const [recording, setRecording] = React.useState();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcription, setTranscription] = React.useState([]);
  const [speakerColors, setSpeakerColors] = React.useState({});
  const recordingInterval = React.useRef(null);
  const transcriptionQueue = React.useRef([]);
  const isProcessing = React.useRef(false);
  const scrollViewRef = React.useRef(null);
  const appState = React.useRef(AppState.currentState);
  const [isBackgroundRecording, setIsBackgroundRecording] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [recentHistory, setRecentHistory] = React.useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = React.useState(false);
  const isUnloading = React.useRef(false);
  const lastProcessedDuration = React.useRef(0);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  // Generate a random color for each new speaker
  const getColorForSpeaker = (speakerId) => {
    if (!speakerColors[speakerId]) {
      const colors = [
        '#6200ee', '#03dac6', '#018786', '#b00020', 
        '#3700b3', '#03dac5', '#018786', '#b00020'
      ];
      const existingColors = Object.values(speakerColors);
      const availableColors = colors.filter(color => !existingColors.includes(color));
      const newColor = availableColors[0] || colors[0];
      setSpeakerColors(prev => ({ ...prev, [speakerId]: newColor }));
      return newColor;
    }
    return speakerColors[speakerId];
  };

  const processTranscriptionQueue = async () => {
    if (isProcessing.current || transcriptionQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    
    try {
      while (transcriptionQueue.current.length > 0) {
        const uri = transcriptionQueue.current[0]; // Peek at the first item
        
        if (!uri) {
          transcriptionQueue.current.shift(); // Remove invalid URI
          continue;
        }

        try {
          await transcribeAudio(uri);
          transcriptionQueue.current.shift(); // Remove only after successful transcription
        } catch (error) {
          console.error('Error processing transcription:', error);
          // Remove failed item to prevent infinite loop
          transcriptionQueue.current.shift();
        }
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      isProcessing.current = false;
    }
  };

  // Handle app state changes
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active' && 
        isBackgroundRecording
      ) {
        // App has come to foreground while recording
        console.log('App has come to foreground, continuing recording');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBackgroundRecording]);

  const setupAudioSession = async () => {
    try {
      console.log('Requesting audio permissions...');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio permission not granted');
      }
      
      console.log('Setting up audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (Platform.OS === 'ios') {
        await registerBackgroundTask();
      }
      console.log('Audio session setup complete');
    } catch (error) {
      console.error('Error setting up audio session:', error);
      throw error; // Re-throw to handle in startRecording
    }
  };

  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_RECORDING_TASK, {
        minimumInterval: 1,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('Task registration failed:', error);
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

  const startRecording = async () => {
    try {
      // First ensure any existing recording is properly cleaned up
      await cleanupRecording();

      // Setup audio session
      await setupAudioSession();

      console.log('Initializing new recording...');
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      console.log('Recording prepared, starting...');
      await newRecording.startAsync();
      console.log('Recording started successfully');

      // Update states only after successful start
      setRecording(newRecording);
      setIsRecording(true);
      setIsBackgroundRecording(true);

      // Set up chunking interval
      recordingInterval.current = setInterval(async () => {
        try {
          if (!recording) return;

          const uri = recording.getURI();
          if (uri) {
            await recording.stopAndUnloadAsync();
            transcriptionQueue.current.push(uri);
            await processTranscriptionQueue();
            await startNewRecordingChunk();
          }
        } catch (error) {
          console.error('Error in recording interval:', error);
          await cleanupRecording();
        }
      }, CHUNK_DURATION);

    } catch (err) {
      console.error('Failed to start recording:', err);
      await cleanupRecording();
    }
  };

  const cleanupRecording = async () => {
    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }

      if (recording) {
        try {
          const status = await recording.getStatusAsync();
          if (status.canRecord || status.isRecording) {
            await recording.stopAndUnloadAsync();
          }
        } catch (error) {
          console.log('Error stopping recording during cleanup:', error);
        }
      }

      setRecording(null);
      setIsRecording(false);
      setIsBackgroundRecording(false);
      isUnloading.current = false;
      isProcessing.current = false;
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Get URI before stopping
      const uri = recording.getURI();
      
      // Stop recording and clean up
      await cleanupRecording();

      // Process final chunk if we have one
      if (uri) {
        transcriptionQueue.current.push(uri);
        await processTranscriptionQueue();
      }

      if (Platform.OS === 'ios') {
        try {
          await BackgroundFetch.unregisterTaskAsync(BACKGROUND_RECORDING_TASK);
        } catch (error) {
          console.error('Error unregistering background task:', error);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      await cleanupRecording();
    }
  };

  const clearTranscription = () => {
    setTranscription([]);
  };

  const transcribeAudio = async (uri) => {
    if (!uri) {
      console.log('No URI provided for transcription');
      return;
    }

    try {
      setIsTranscribing(true);
      
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size < 1024) {
        console.log('Audio chunk too small, skipping...');
        return;
      }

      console.log('Sending audio chunk to Deepgram...', blob.size, 'bytes');

      const dgResponse = await fetch(
        'https://api.deepgram.com/v1/listen?' +
        'model=whisper-large&' +
        'diarize=true&' +
        'punctuate=true&' +
        'utterances=true&' +
        'numerals=true&' +
        'smart_format=true',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': 'audio/m4a',
          },
          body: blob
        }
      );

      if (!dgResponse.ok) {
        throw new Error(`HTTP error! status: ${dgResponse.status}`);
      }

      const data = await dgResponse.json();
      
      const utterances = data.results?.utterances || [];
      const processedTranscription = utterances
        .map((utterance, index) => {
          const speakerId = utterance.speaker || index;
          return {
            id: `${Date.now()}-${index}`, // Unique ID for each utterance
            speaker: `Speaker ${speakerId}`,
            speakerId: speakerId,
            text: utterance.transcript,
            confidence: utterance.confidence,
            timeStart: utterance.start,
            timeEnd: utterance.end,
            words: utterance.words || [],
            timestamp: new Date().toISOString(),
          };
        })
        .filter(utterance => utterance.text.trim().length > 0);

      if (processedTranscription.length > 0) {
        // Get current location before saving
        let currentLocation = location;
        try {
          // Get a fresh location reading
          const freshLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          currentLocation = freshLocation;
        } catch (error) {
          console.log('Could not get fresh location:', error);
        }

        // Save to AsyncStorage with location data
        await storage.saveTranscription({
          utterances: processedTranscription,
          totalDuration: processedTranscription.reduce(
            (max, u) => Math.max(max, u.timeEnd),
            0
          ),
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
          },
          settings: {
            model: 'whisper-large',
            chunkDuration: CHUNK_DURATION,
          },
          location: currentLocation ? {
            coords: {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              accuracy: currentLocation.coords.accuracy,
              altitude: currentLocation.coords.altitude,
              heading: currentLocation.coords.heading,
              speed: currentLocation.coords.speed,
            },
            timestamp: currentLocation.timestamp,
          } : null,
          audioUri: uri
        });
        
        setTranscription(prev => [...prev, ...processedTranscription]);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscription(prev => [...prev, {
        id: `error-${Date.now()}`,
        speaker: 'System',
        speakerId: 'error',
        text: `Error: ${error.message || 'Failed to transcribe audio'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTranscribing(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Add this effect to auto-scroll when new transcriptions arrive
  React.useEffect(() => {
    if (transcription.length > 0) {
      scrollToBottom();
    }
  }, [transcription]);

  // Replace loadRecentHistory with simpler toggle
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Add location initialization
  React.useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        // Start location updates
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );

        // Cleanup subscription
        return () => {
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      } catch (error) {
        console.error('Error initializing location:', error);
      }
    };

    initLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Elements AI Necklace</Text>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
          
          {isTranscribing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Transcribing audio...</Text>
            </View>
          )}
          
          {transcription.length > 0 && !isTranscribing && (
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionTitle}>Conversation:</Text>
              {transcription.map((utterance) => (
                <View 
                  key={utterance.id} 
                  style={[
                    styles.utteranceContainer,
                    { borderLeftColor: getColorForSpeaker(utterance.speakerId) }
                  ]}
                >
                  <View style={styles.utteranceHeader}>
                    <Text style={[
                      styles.speakerText,
                      { color: getColorForSpeaker(utterance.speakerId) }
                    ]}>
                      {utterance.speaker}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatTime(utterance.timeStart)}
                    </Text>
                  </View>
                  <Text style={styles.transcriptionText}>{utterance.text}</Text>
                  {utterance.confidence && (
                    <Text style={styles.confidenceText}>
                      Confidence: {Math.round(utterance.confidence * 100)}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, showHistory && styles.activeButton]}
            onPress={toggleHistory}
            disabled={isTranscribing}
          >
            <Text style={styles.buttonText}>Recent History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            disabled={isTranscribing}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          {transcription.length > 0 && (
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]}
              onPress={clearTranscription}
              disabled={isRecording || isTranscribing}
            >
              <Text style={styles.buttonText}>Clear Conversation</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <HistoryView 
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
        formatTime={formatTime}
      />
    </View>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  utteranceContainer: {
    marginBottom: 16,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6200ee',
    fontSize: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    marginRight: 8,
    opacity: 1,
    // Add blinking animation
    animationName: 'blink',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  recordingText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#6c757d',
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
  historyList: {
    maxHeight: '85%',
  },
  historyItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  historyUtterances: {
    gap: 8,
  },
  historyUtterance: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  historySpeaker: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  metadataContainer: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  activeButton: {
    backgroundColor: '#3700b3', // Darker shade when active
  },
}); 