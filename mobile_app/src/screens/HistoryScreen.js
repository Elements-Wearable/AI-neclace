import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import ClearHistoryModal from '../components/ClearHistoryModal';
import * as storage from '../services/storage';
import { historyStyles } from '../styles/screens/historyScreen';
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
    <View style={historyStyles.header}>
      <Text style={historyStyles.headerTitle}>Conversation History</Text>
      <View style={historyStyles.headerControls}>
        <TouchableOpacity 
          style={historyStyles.sortButton}
          onPress={() => setIsNewestFirst(!isNewestFirst)}
        >
          <Text style={historyStyles.sortButtonText}>
            {isNewestFirst ? '⌄ Newest first' : '⌃ Oldest first'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={historyStyles.deleteButton}
          onPress={() => setShowClearModal(true)}
        >
          <Text style={historyStyles.deleteButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={historyStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={historyStyles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={historyStyles.container}>
      <Header />
      <CalendarList
        style={historyStyles.calendar}
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
      
      <ScrollView style={historyStyles.content}>
        {history
          .filter(([date]) => date === selectedDate)
          .map(([date, conversations]) => (
            <View key={date} style={historyStyles.dateGroup}>
              {conversations
                .sort((a, b) => isNewestFirst 
                  ? new Date(b.timestamp) - new Date(a.timestamp)
                  : new Date(a.timestamp) - new Date(b.timestamp)
                )
                .map((convo, index) => (
                  <View key={`${date}-${index}`} style={historyStyles.timelineItem}>
                    <View style={historyStyles.timelineLine} />
                    <View style={historyStyles.conversationCard}>
                      <View style={historyStyles.cardHeader}>
                        <Text style={historyStyles.timeText}>
                          {formatTime(convo.timestamp)}
                        </Text>
                        <Text style={historyStyles.sessionText}>
                          {convo.sessionId 
                            ? `Session ${convo.sessionId.split('_')[1] || 'Unknown'}`
                            : 'Legacy Session'}
                        </Text>
                      </View>
                      
                      <View style={historyStyles.utterancesContainer}>
                        {convo.utterances.map((utterance, i) => (
                          <Text key={i} style={historyStyles.utteranceText}>
                            <Text style={historyStyles.speakerText}>
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
          <View style={historyStyles.emptyDateState}>
            <Text style={historyStyles.emptyDateText}>
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