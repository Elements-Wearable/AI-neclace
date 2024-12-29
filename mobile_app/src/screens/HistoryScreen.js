import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import ClearHistoryModal from '../components/ClearHistoryModal';
import * as storage from '../services/storage';
import logger from '../utils/logger';

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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
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
      logger.debug('Loading transcription history...');
      
      const transcriptions = await storage.getTranscriptions();
      logger.debug('Found transcriptions:', transcriptions?.length || 0);
      
      if (transcriptions && transcriptions.length > 0) {
        logger.debug('Sample transcription:', JSON.stringify(transcriptions[0], null, 2));
        
        const grouped = groupByDate(transcriptions);
        logger.debug('Grouped by date:', Object.keys(grouped).length, 'dates');
        
        setHistory(grouped);
        updateMarkedDates(transcriptions);
      } else {
        setHistory([]);
        updateMarkedDates([]);
      }
    } catch (error) {
      logger.error('Error loading history:', error);
      Alert.alert('Error', 'Unable to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  const groupByDate = (transcriptions) => {
    const groups = transcriptions.reduce((acc, item) => {
      if (!item?.timestamp) return acc;

      // Format date consistently using ISO string
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].unshift(item);
      return acc;
    }, {});

    // Sort dates using ISO string format
    return Object.entries(groups)
      .sort(([dateA, itemsA], [dateB, itemsB]) => 
        // Primary sort by date (newest first)
         new Date(dateB) - new Date(dateA)
      );
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  const clearHistory = async () => {
    try {
      logger.debug('Clearing all history...');
      await storage.clearAllTranscriptions();
      logger.info('History cleared successfully');
      setHistory([]);
    } catch (error) {
      logger.error('Error clearing history:', error);
      Alert.alert('Error', 'Failed to clear history');
    }
  };

  const handleClearRange = async (range) => {
    try {
      await storage.clearTranscriptionsByDateRange(range.start, range.end);
      setShowClearModal(false);
      loadHistory();
    } catch (error) {
      console.error('Error clearing transcriptions:', error);
      Alert.alert('Error', 'Failed to clear transcriptions');
    }
  };

  const updateMarkedDates = (transcriptions) => {
    const marked = {};
    
    // First pass: mark all dates with transcriptions
    transcriptions.forEach(item => {
      if (!item?.timestamp) return;
      
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: '#6200ee'
        };
      }
    });

    // Second pass: add selection to currently selected date
    if (selectedDate && marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: 'rgba(98, 0, 238, 0.1)'
      };
    } else if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: 'rgba(98, 0, 238, 0.1)'
      };
    }

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
          const newMarked = { ...markedDates };
          
          // Remove selection from previously selected date
          Object.keys(newMarked).forEach(date => {
            if (newMarked[date].selected) {
              if (newMarked[date].marked) {
                newMarked[date] = {
                  marked: true,
                  dotColor: '#6200ee'
                };
              } else {
                delete newMarked[date];
              }
            }
          });

          // Add selection to new date
          newMarked[day.dateString] = {
            ...(newMarked[day.dateString] || {}),
            selected: true,
            selectedColor: 'rgba(98, 0, 238, 0.1)'
          };

          setMarkedDates(newMarked);
        }}
        markingType={'dot'}
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
      <ClearHistoryModal
        visible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onClear={handleClearRange}
      />
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
  dateSelectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
}); 