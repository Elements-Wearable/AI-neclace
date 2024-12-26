import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import ClearHistoryModal from '../components/ClearHistoryModal';
import { generateSummary } from '../services/ai';
import * as storage from '../services/storage';

export default function SummaryScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [markedDates, setMarkedDates] = useState({});
  const [summaryText, setSummaryText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load transcriptions to mark dates
      const transcriptions = await storage.getTranscriptions();
      updateMarkedDates(transcriptions);
      
      // Load summaries
      const summaries = await storage.getSummaries();
      const currentSummary = summaries.find(s => s.date === selectedDate);
      setSummaryText(currentSummary?.text || '');
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMarkedDates = (transcriptions) => {
    const marked = {};
    
    // Mark dates with transcriptions
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

    // Add selection to current date
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: 'rgba(98, 0, 238, 0.1)'
      };
    }

    setMarkedDates(marked);
  };

  const handleSaveSummary = async () => {
    try {
      const success = await storage.saveSummary({
        date: selectedDate,
        text: summaryText,
        updatedAt: new Date().toISOString()
      });
      
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Summary saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save summary');
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      Alert.alert('Error', 'Failed to save summary');
    }
  };

  const handleDeleteSummary = async () => {
    Alert.alert(
      'Delete Summary',
      'Are you sure you want to delete this summary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await storage.deleteSummary(selectedDate);
              if (success) {
                setSummaryText('');
                Alert.alert('Success', 'Summary deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete summary');
              }
            } catch (error) {
              console.error('Error deleting summary:', error);
              Alert.alert('Error', 'Failed to delete summary');
            }
          }
        }
      ]
    );
  };

  const handleGenerateSummary = async (range) => {
    try {
      setIsGenerating(true);
      
      // Get transcriptions for the selected date range
      const transcriptions = await storage.getTranscriptions();
      const filteredTranscriptions = transcriptions.filter(t => {
        const date = new Date(t.timestamp);
        return date >= range.start && date <= range.end;
      });

      if (filteredTranscriptions.length === 0) {
        Alert.alert('No Data', 'No transcriptions found for the selected date range');
        return;
      }

      // Generate summary using OpenAI
      const summary = await generateSummary(filteredTranscriptions);

      // Save the summary
      await storage.saveSummary({
        date: range.start.toISOString().split('T')[0],
        text: summary,
        dateRange: {
          start: range.start.toISOString(),
          end: range.end.toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      // Reload data
      loadData();
      setShowDatePicker(false);
      Alert.alert('Success', 'Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      Alert.alert('Error', 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading summaries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          loadData();
        }}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#666666',
          selectedDayBackgroundColor: '#6200ee',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#6200ee',
          dayTextColor: '#333333',
          textDisabledColor: '#d9e1e8',
          dotColor: '#6200ee',
          selectedDotColor: '#ffffff',
          arrowColor: '#6200ee',
          monthTextColor: '#333333',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString()}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.generateButtonText}>Generate Summary</Text>
            </TouchableOpacity>
            {summaryText && !isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteSummary}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.summaryInput}
            multiline
            value={summaryText}
            onChangeText={setSummaryText}
            placeholder="Write your summary here..."
            placeholderTextColor="#666"
          />
        ) : (
          <ScrollView style={styles.summaryText}>
            {summaryText ? (
              <View style={styles.summaryContent}>
                {summaryText.split('\n').map((line, index) => {
                  // Empty lines
                  if (!line.trim()) {
                    return <View key={index} style={styles.emptyLine} />;
                  }
                  
                  // Section headers
                  if (line.match(/^(Overview|Key Points|Action Items|Notable Themes):/)) {
                    return (
                      <Text key={index} style={styles.summarySection}>
                        {line}
                      </Text>
                    );
                  }
                  
                  // Bullet points
                  if (line.match(/^[•\-*]/)) {
                    return (
                      <Text key={index} style={styles.summaryBullet}>
                        {line}
                      </Text>
                    );
                  }
                  
                  // Headers
                  if (line.match(/^#+/)) {
                    return (
                      <Text key={index} style={styles.summaryHeader}>
                        {line.replace(/^#+\s/, '')}
                      </Text>
                    );
                  }
                  
                  // Regular paragraphs
                  return (
                    <Text key={index} style={styles.summaryParagraph}>
                      {line}
                    </Text>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.placeholderText}>
                No summary available for this date. Use 'Generate Summary' to create one.
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      <ClearHistoryModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onClear={handleGenerateSummary}
        title="Select Date Range for Summary"
        confirmText="Generate"
        confirmColor="#6200ee"
      />

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Generating summary...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryContainer: {
    flex: 1,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  summaryInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  summaryText: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  generateButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  summaryContent: {
    flex: 1,
    paddingVertical: 10,
  },
  summaryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  summarySection: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  summaryBullet: {
    fontSize: 16,
    color: '#333',
    paddingLeft: 16,
    paddingVertical: 4,
    lineHeight: 24,
  },
  summaryParagraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyLine: {
    height: 12,
  },
}); 