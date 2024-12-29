import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function ClearHistoryModal({ visible, onClose, onClear }) {
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
    startTime: new Date().setHours(0, 0, 0, 0),
    endTime: new Date().setHours(23, 59, 59, 999)
  });
  const [showTimePicker, setShowTimePicker] = useState({
    start: false,
    end: false
  });

  const getMarkedDates = () => {
    if (!selectedRange.start) return {};

    const markedDates = {};
    const startDate = selectedRange.start.toISOString().split('T')[0];
    
    if (!selectedRange.end) {
      // Only start date selected
      markedDates[startDate] = {
        selected: true,
        startingDay: true,
        endingDay: true,
        color: '#6200ee',
        textColor: 'white'
      };
      return markedDates;
    }

    const endDate = selectedRange.end.toISOString().split('T')[0];
    
    // Handle same day selection
    if (startDate === endDate) {
      markedDates[startDate] = {
        selected: true,
        startingDay: true,
        endingDay: true,
        color: '#6200ee',
        textColor: 'white'
      };
      return markedDates;
    }

    // Different days selection
    markedDates[startDate] = {
      startingDay: true,
      color: '#6200ee',
      textColor: 'white'
    };

    markedDates[endDate] = {
      endingDay: true,
      color: '#6200ee',
      textColor: 'white'
    };

    // Fill in middle dates
    const currentDate = new Date(selectedRange.start);
    while (currentDate < selectedRange.end) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dateString = currentDate.toISOString().split('T')[0];
      if (dateString !== endDate) {
        markedDates[dateString] = {
          color: '#6200ee',
          textColor: 'white'
        };
      }
    }

    return markedDates;
  };

  const handleClear = () => {
    if (selectedRange.start && selectedRange.end) {
      const startDateTime = new Date(selectedRange.start);
      const endDateTime = new Date(selectedRange.end);
      
      // Apply selected times
      startDateTime.setHours(new Date(selectedRange.startTime).getHours());
      startDateTime.setMinutes(new Date(selectedRange.startTime).getMinutes());
      endDateTime.setHours(new Date(selectedRange.endTime).getHours());
      endDateTime.setMinutes(new Date(selectedRange.endTime).getMinutes());

      onClear({ start: startDateTime, end: endDateTime });
      setSelectedRange({
        start: null,
        end: null,
        startTime: new Date().setHours(0, 0, 0, 0),
        endTime: new Date().setHours(23, 59, 59, 999)
      });
    }
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setSelectedRange({
          start: null,
          end: null,
          startTime: new Date().setHours(0, 0, 0, 0),
          endTime: new Date().setHours(23, 59, 59, 999)
        });
        onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date Range to Clear</Text>

          <Calendar
            style={styles.calendar}
            markingType={'period'}
            markedDates={getMarkedDates()}
            onDayPress={(day) => {
              const selectedDate = new Date(day.timestamp);
              
              if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
                // Start new selection
                setSelectedRange({
                  ...selectedRange,
                  start: selectedDate,
                  end: null
                });
              } else {
                // Complete the range
                const endDate = selectedDate;
                
                // Allow same day selection
                setSelectedRange({
                  ...selectedRange,
                  end: endDate
                });
              }
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

          {selectedRange.start && selectedRange.end && (
            <View style={styles.timeSelection}>
              <Text style={styles.timeSelectionTitle}>Select Time Range</Text>
              
              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker({ ...showTimePicker, start: true })}
                  >
                    <Text style={styles.timeButtonText}>
                      {formatTime(selectedRange.startTime)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker({ ...showTimePicker, end: true })}
                  >
                    <Text style={styles.timeButtonText}>
                      {formatTime(selectedRange.endTime)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showTimePicker.start && (
                <DateTimePicker
                  value={new Date(selectedRange.startTime)}
                  mode="time"
                  is24Hour={false}
                  onChange={(event, time) => {
                    setShowTimePicker({ ...showTimePicker, start: false });
                    if (event.type === 'set' && time) {
                      setSelectedRange({ ...selectedRange, startTime: time.getTime() });
                    }
                  }}
                />
              )}

              {showTimePicker.end && (
                <DateTimePicker
                  value={new Date(selectedRange.endTime)}
                  mode="time"
                  is24Hour={false}
                  onChange={(event, time) => {
                    setShowTimePicker({ ...showTimePicker, end: false });
                    if (event.type === 'set' && time) {
                      setSelectedRange({ ...selectedRange, endTime: time.getTime() });
                    }
                  }}
                />
              )}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setSelectedRange({
                  start: null,
                  end: null,
                  startTime: new Date().setHours(0, 0, 0, 0),
                  endTime: new Date().setHours(23, 59, 59, 999)
                });
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.clearButton,
                (!selectedRange.start || !selectedRange.end) && styles.buttonDisabled
              ]}
              onPress={handleClear}
              disabled={!selectedRange.start || !selectedRange.end}
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
}

const styles = StyleSheet.create({
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
    color: '#333',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  clearButtonText: {
    color: 'white',
  },
  timeSelection: {
    marginTop: 20,
    marginBottom: 20,
  },
  timeSelectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
    width: '100%',
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
}); 