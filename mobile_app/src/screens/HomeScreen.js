import { Audio } from 'expo-av';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Add your Deepgram API key here
const DEEPGRAM_API_KEY = 'e7e2006b4209322f981a2fd210ea995eac999973';

export default function HomeScreen() {
  const [recording, setRecording] = React.useState();
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcription, setTranscription] = React.useState('');

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const transcribeAudio = async (uri) => {
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      });

      console.log('Sending audio to Deepgram...');
      
      // Send to Deepgram API
      const response = await fetch('https://api.deepgram.com/v1/listen?model=whisper-large', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transcription = data.results?.channels[0]?.alternatives[0]?.transcript || '';
      console.log('Transcription:', transcription);
      setTranscription(transcription);
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscription('Error transcribing audio. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      setIsRecording(false);
      setRecording(undefined);
      
      // Transcribe the recorded audio
      await transcribeAudio(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Elements AI Necklace</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        
        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionTitle}>Transcription:</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
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
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 