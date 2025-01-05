import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DEEPGRAM_API_KEY, getDeepgramApiKey } from '../config/constants';
import logger from '../utils/logger';

export default function LiveTranscriptionScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState(''); // For interim results
  const webSocket = useRef(null);
  const recording = useRef(null);
  const scrollViewRef = useRef(null);
  const lastProcessedTime = useRef(0);
  const audioChunks = useRef([]);
  const keepAliveInterval = useRef(null);
  const lastFinalTranscript = useRef('');
  const transcriptHistory = useRef(new Set());
  const currentSession = useRef('');
  const [conversationId] = useState(`conv_${Date.now()}`); // Unique ID for this conversation
  const chunkInterval = useRef(null);
  const currentChunkStartTime = useRef(0);
  const CHUNK_DURATION = 10000; // 10 seconds in milliseconds
  const nextRecording = useRef(null);

  // Initialize WebSocket connection with correct audio settings
  const initializeWebSocket = async () => {
    try {
      logger.debug('Initializing WebSocket connection...');
      
      const apiKey = await getDeepgramApiKey();
      if (!apiKey) {
        logger.error('Deepgram API key not found');
        Alert.alert('Error', 'Please set your Deepgram API key in settings');
        return;
      }

      const options = {
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        model: 'nova-2',
        language: 'en-US',
        interim_results: true,
        punctuate: true,
        smart_format: true,
        diarize: true,
        speakers: 2,
        utterances: true
      };

      // Properly encode the query parameters
      const queryString = Object.entries(options)
        .filter(([_, value]) => value !== undefined) // Remove undefined values
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      logger.debug('Connecting with options:', {
        url: `wss://api.deepgram.com/v1/listen?${queryString}`,
        options
      });

      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${queryString}`,
        ['token', apiKey]
      );

      // Add keepAlive mechanism
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
      
      keepAliveInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'KeepAlive' }));
          logger.debug('Sent keepalive');
        }
      }, 10000);

      ws.onopen = () => {
        logger.debug('WebSocket connected');
        webSocket.current = ws;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'Metadata') {
            logger.debug('Received metadata:', data);
          } else if (data.channel?.alternatives?.[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript.trim();
            const speakerId = data.channel.alternatives[0].words?.[0]?.speaker || 0;
            
            if (transcript) {
              if (data.is_final) {
                setTranscription(prev => {
                  const prevLines = prev.split('\n');
                  const lastLine = prevLines[prevLines.length - 1]?.trim();
                  
                  // Format with speaker ID
                  const formattedTranscript = `Speaker ${speakerId + 1}: ${transcript}`;
                  
                  if (formattedTranscript !== lastLine && formattedTranscript !== currentTranscript) {
                    return prev + (prev ? '\n' : '') + formattedTranscript;
                  }
                  return prev;
                });
                if (currentTranscript === transcript) {
                  setCurrentTranscript('');
                }
              } else {
                if (transcript !== currentTranscript) {
                  // Format interim results with speaker ID too
                  setCurrentTranscript(`Speaker ${speakerId + 1}: ${transcript}`);
                }
              }
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error:', error);
        // Try to reconnect
        if (webSocket.current) {
          webSocket.current.close();
          initializeWebSocket();
        }
      };

      ws.onclose = () => {
        logger.debug('WebSocket closed');
        if (keepAliveInterval.current) {
          clearInterval(keepAliveInterval.current);
        }
        webSocket.current = null;
      };

      webSocket.current = ws;
    } catch (error) {
      logger.error('Error initializing WebSocket:', error);
    }
  };

  const processAudioChunk = async (uri) => {
    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/wav'
        },
        body: await fetch(uri).then(r => r.blob()),
        query: {
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          punctuate: true,
          utterances: true,
          metadata: true
        }
      });

      const data = await response.json();
      
      if (data.results?.channels?.[0]?.alternatives?.[0]) {
        const transcript = {
          text: data.results.channels[0].alternatives[0].transcript,
          confidence: data.results.channels[0].alternatives[0].confidence,
          timestamp: new Date().toISOString(),
          conversationId,
          chunkStartTime: currentChunkStartTime.current
        };

        setTranscription(prev => prev + (prev ? '\n' : '') + transcript.text);
      }
    } catch (error) {
      logger.error('Error processing chunk:', error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCM: true,
        },
      };

      // Start first recording
      currentChunkStartTime.current = Date.now();
      recording.current = new Audio.Recording();
      await recording.current.prepareToRecordAsync(recordingOptions);
      await recording.current.startAsync();
      setIsRecording(true);

      // Set up chunk processing interval
      chunkInterval.current = setInterval(async () => {
        try {
          if (!recording.current) return;

          // Get current recording URI before stopping
          const uri = recording.current.getURI();
          
          // Create new recording instance
          const newRecording = new Audio.Recording();
          
          // Stop current recording
          await recording.current.stopAndUnloadAsync();

          // Process the chunk
          if (uri) {
            processAudioChunk(uri).catch(error => 
              logger.error('Error processing chunk:', error)
            );
          }

          // Start new recording
          await newRecording.prepareToRecordAsync(recordingOptions);
          await newRecording.startAsync();
          recording.current = newRecording;
          currentChunkStartTime.current = Date.now();

        } catch (error) {
          logger.error('Error handling chunk:', {
            error,
            message: error.message,
            stack: error.stack
          });
        }
      }, CHUNK_DURATION);

    } catch (error) {
      logger.error('Error starting recording:', {
        error,
        message: error.message,
        stack: error.stack
      });
    }
  };

  const stopRecording = async () => {
    try {
      clearInterval(chunkInterval.current);
      
      // Stop and process both recordings if they exist
      if (recording.current) {
        const uri = recording.current.getURI();
        await recording.current.stopAndUnloadAsync();
        if (uri) {
          await processAudioChunk(uri);
        }
      }

      if (nextRecording.current) {
        const uri = nextRecording.current.getURI();
        await nextRecording.current.stopAndUnloadAsync();
        if (uri) {
          await processAudioChunk(uri);
        }
      }
      
      recording.current = null;
      nextRecording.current = null;
      setIsRecording(false);
    } catch (error) {
      logger.error('Error stopping recording:', {
        error,
        message: error.message,
        stack: error.stack
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => () => {
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (nextRecording.current) {
        nextRecording.current.stopAndUnloadAsync();
      }
      clearInterval(chunkInterval.current);
    }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Transcription</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.transcriptionContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <Text style={styles.transcriptionText}>
            {transcription}
          </Text>
          {currentTranscript && (
            <Text style={[styles.transcriptionText, styles.interimText]}>
              {currentTranscript}
            </Text>
          )}
        </ScrollView>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  transcriptionContainer: {
    flex: 1,
    padding: 20,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  controls: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  interimText: {
    color: '#666',
    fontStyle: 'italic'
  }
}); 