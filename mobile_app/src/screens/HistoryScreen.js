import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';
import * as storage from '../services/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewestFirst, setIsNewestFirst] = React.useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    fromTime: new Date(),
    toTime: new Date(),
  });
  const [showPicker, setShowPicker] = useState({
    fromDate: false,
    toDate: false,
    fromTime: false,
    toTime: false,
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});

  React.useEffect(() => {
    loadHistory();
    
    // Refresh on focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });

    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      console.log('📚 Loading transcription history...');
      
      const transcriptions = await storage.getTranscriptions();
      console.log('📊 Found transcriptions:', transcriptions.length);
      
      if (transcriptions.length > 0) {
        console.log('📝 Sample transcription:', JSON.stringify(transcriptions[0], null, 2));
      }
      
      const grouped = groupByDate(transcriptions);
      console.log('📅 Grouped by date:', Object.keys(grouped).length, 'dates');
      
      setHistory(grouped);
      updateMarkedDates(transcriptions);
    } catch (error) {
      console.error('❌ Error loading history:', error);
      // Show error to user
      Alert.alert(
        'Error Loading History',
        'Unable to load conversation history. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const groupByDate = (transcriptions) => {
    const groups = transcriptions.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].unshift(item);
      return acc;
    }, {});

    // Sort dates in descending order (newest first)
    return Object.entries(groups)
      .sort(([dateA, itemsA], [dateB, itemsB]) => {
        // Primary sort by date (newest first)
        const dateComparison = new Date(dateB) - new Date(dateA);
        if (dateComparison !== 0) return dateComparison;
        
        // Secondary sort by timestamp if dates are the same
        return new Date(itemsB[0].timestamp) - new Date(itemsA[0].timestamp);
      });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all conversation history?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await storage.clearAllTranscriptions();
              console.log('🗑️ History cleared');
              setHistory([]);
            } catch (error) {
              console.error('❌ Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClearTranscriptions = async () => {
    try {
      const startDateTime = new Date(dateRange.fromDate);
      startDateTime.setHours(dateRange.fromTime.getHours());
      startDateTime.setMinutes(dateRange.fromTime.getMinutes());

      const endDateTime = new Date(dateRange.toDate);
      endDateTime.setHours(dateRange.toTime.getHours());
      endDateTime.setMinutes(dateRange.toTime.getMinutes());

      await storage.clearTranscriptionsByDateRange(startDateTime, endDateTime);
      setShowClearModal(false);
      // Refresh history
      loadHistory();
    } catch (error) {
      console.error('Error clearing transcriptions:', error);
      Alert.alert('Error', 'Failed to clear transcriptions');
    }
  };

  const updateMarkedDates = (transcriptions) => {
    const marked = {};
    transcriptions.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      marked[date] = {
        marked: true,
        dotColor: '#6200ee',
        selected: date === selectedDate,
        selectedColor: 'rgba(98, 0, 238, 0.1)'
      };
    });
    setMarkedDates(marked);
  };

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Conversation History</Text>
      <View style={styles.headerControls}>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setIsNewestFirst(!isNewestFirst)}
        >
          <Text style={styles.sortButtonText}>
            {isNewestFirst ? '⌄ Newest first' : '⌃ Oldest first'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => setShowClearModal(true)}
        >
          <Text style={styles.deleteButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ClearTranscriptionsModal = () => {
    const [selectedRange, setSelectedRange] = useState({
      start: null,
      end: null
    });

    // Function to generate marked dates object for the range
    const getMarkedDates = () => {
      if (!selectedRange.start) return {};

      const markedDates = {};
      const start = selectedRange.start.toISOString().split('T')[0];
      markedDates[start] = {
        startingDay: true,
        color: '#6200ee',
        textColor: 'white'
      };

      if (selectedRange.end) {
        const end = selectedRange.end.toISOString().split('T')[0];
        markedDates[end] = {
          endingDay: true,
          color: '#6200ee',
          textColor: 'white'
        };

        // Fill in the middle dates
        let currentDate = new Date(selectedRange.start);
        currentDate.setDate(currentDate.getDate() + 1);
        
        while (currentDate < selectedRange.end) {
          const dateString = currentDate.toISOString().split('T')[0];
          markedDates[dateString] = {
            color: '#6200ee',
            textColor: 'white'
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      return markedDates;
    };

    return (
      <Modal
        visible={showClearModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear Transcriptions</Text>
            
            <Calendar
              style={styles.calendar}
              markingType={'period'}
              markedDates={getMarkedDates()}
              onDayPress={(day) => {
                if (!selectedRange.start || selectedRange.end) {
                  // Start new range
                  const startDate = new Date(day.timestamp);
                  setSelectedRange({
                    start: startDate,
                    end: null
                  });
                  setDateRange({
                    ...dateRange,
                    fromDate: startDate,
                    fromTime: new Date(startDate)
                  });
                } else {
                  // Complete the range
                  const endDate = new Date(day.timestamp);
                  if (endDate >= selectedRange.start) {
                    setSelectedRange({
                      ...selectedRange,
                      end: endDate
                    });
                    setDateRange({
                      ...dateRange,
                      toDate: endDate,
                      toTime: new Date(endDate)
                    });
                  } else {
                    // If end date is before start date, swap them
                    setSelectedRange({
                      start: endDate,
                      end: selectedRange.start
                    });
                    setDateRange({
                      ...dateRange,
                      fromDate: endDate,
                      fromTime: new Date(endDate),
                      toDate: selectedRange.start,
                      toTime: new Date(selectedRange.start)
                    });
                  }
                }
              }}
              theme={{
                selectedDayBackgroundColor: '#6200ee',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#6200ee',
                arrowColor: '#6200ee',
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: { color: '#6200ee' },
                  dayTextAtIndex6: { color: '#6200ee' }
                }
              }}
            />

            {/* Compact Time Selection */}
            <View style={styles.timeSelectionContainer}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowPicker({ ...showPicker, fromTime: true })}
                >
                  <Text style={styles.timeButtonText}>
                    {dateRange.fromTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowPicker({ ...showPicker, toTime: true })}
                >
                  <Text style={styles.timeButtonText}>
                    {dateRange.toTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Pickers (Android) */}
            {Platform.OS === 'android' && (
              <>
                {showPicker.fromTime && (
                  <DateTimePicker
                    value={dateRange.fromTime}
                    mode="time"
                    onChange={(event, date) => {
                      setShowPicker({ ...showPicker, fromTime: false });
                      if (date) setDateRange({ ...dateRange, fromTime: date });
                    }}
                  />
                )}
                {showPicker.toTime && (
                  <DateTimePicker
                    value={dateRange.toTime}
                    mode="time"
                    onChange={(event, date) => {
                      setShowPicker({ ...showPicker, toTime: false });
                      if (date) setDateRange({ ...dateRange, toTime: date });
                    }}
                  />
                )}
              </>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowClearModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.clearButton]}
                onPress={handleClearTranscriptions}
              >
                <Text style={[styles.buttonText, styles.clearButtonText]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <CalendarList
        style={styles.calendar}
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          updateMarkedDates(history.flat());
        }}
        pastScrollRange={12}
        futureScrollRange={1}
        scrollEnabled={true}
        showScrollIndicator={true}
        theme={{
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
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />
      
      <ScrollView style={styles.content}>
        {history
          .filter(([date]) => date === selectedDate)
          .map(([date, conversations]) => (
            <View key={date} style={styles.dateGroup}>
              {conversations
                .sort((a, b) => isNewestFirst 
                  ? new Date(b.timestamp) - new Date(a.timestamp)
                  : new Date(a.timestamp) - new Date(b.timestamp)
                )
                .map((convo, index) => (
                  <View key={`${date}-${index}`} style={styles.timelineItem}>
                    <View style={styles.timelineLine} />
                    <View style={styles.conversationCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.timeText}>
                          {formatTime(convo.timestamp)}
                        </Text>
                        <Text style={styles.sessionText}>
                          {convo.sessionId 
                            ? `Session ${convo.sessionId.split('_')[1] || 'Unknown'}`
                            : 'Legacy Session'}
                        </Text>
                      </View>
                      
                      <View style={styles.utterancesContainer}>
                        {convo.utterances.map((utterance, i) => (
                          <Text key={i} style={styles.utteranceText}>
                            <Text style={styles.speakerText}>
                              {utterance.speaker}:
                            </Text>
                            {" " + utterance.text}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          ))}
        
        {!history.some(([date]) => date === selectedDate) && (
          <View style={styles.emptyDateState}>
            <Text style={styles.emptyDateText}>
              No recordings for {new Date(selectedDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
      <ClearTranscriptionsModal />
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  dateGroup: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
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
  conversationCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  utterancesContainer: {
    gap: 8,
  },
  utteranceText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  speakerText: {
    fontWeight: '600',
    color: '#6200ee',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  sortButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dateTimeText: {
    color: '#6200ee',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearButtonText: {
    color: 'white',
  },
  calendar: {
    height: 350,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
  emptyDateState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyDateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 