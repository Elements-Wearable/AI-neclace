import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Timeline } from 'react-native-calendars';
import * as storage from '../services/storage';

export default function SummaryScreen() {
  const [selectedRange, setSelectedRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999)
  });
  const [events, setEvents] = useState([]);

  React.useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const transcriptions = await storage.getTranscriptions();
      // Convert transcriptions to timeline events
      const timelineEvents = transcriptions.map(t => ({
        start: new Date(t.timestamp),
        end: new Date(new Date(t.timestamp).getTime() + 30 * 60000), // Add 30 min duration
        title: `Session ${t.sessionId.split('_')[1] || 'Unknown'}`,
        summary: t.utterances.map(u => u.text).join(' ').substring(0, 100) + '...',
        color: '#6200ee',
        id: t.id
      }));
      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error loading transcriptions:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Summary</Text>
        <Text style={styles.dateRange}>
          {new Date(selectedRange.start).toLocaleDateString()} - {new Date(selectedRange.end).toLocaleDateString()}
        </Text>
      </View>

      <Timeline
        events={events}
        start={8} // Start at 8 AM
        end={20}  // End at 8 PM
        format24h={true}
        onEventPress={(event) => {
          // Handle event press
          console.log('Selected event:', event);
        }}
        onBackgroundLongPress={(timeString, time) => {
          // Handle background press for range selection
          const pressedTime = new Date(time.timestamp);
          if (!selectedRange.start || selectedRange.end) {
            setSelectedRange({
              start: pressedTime.getTime(),
              end: null
            });
          } else {
            setSelectedRange({
              ...selectedRange,
              end: pressedTime.getTime()
            });
          }
        }}
        styles={{
          container: styles.timeline,
          event: styles.timelineEvent,
          title: styles.timelineEventTitle,
          description: styles.timelineEventDescription
        }}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#6200ee',
          selectedDayTextColor: '#fff',
          todayTextColor: '#6200ee',
          dayTextColor: '#333',
          textDisabledColor: '#d9e1e8',
          dotColor: '#6200ee',
          selectedDotColor: '#fff',
          arrowColor: '#6200ee',
          monthTextColor: '#333',
        }}
      />

      <ScrollView style={styles.content}>
        {/* Summary content here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateRange: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  timeline: {
    paddingTop: 20,
    height: 300,
  },
  timelineEvent: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  timelineEventTitle: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  timelineEventDescription: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
}); 