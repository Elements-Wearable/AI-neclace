import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as storage from '../services/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewestFirst, setIsNewestFirst] = React.useState(true);

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
          onPress={clearHistory}
        >
          <Text style={styles.deleteButtonText}>Clear All</Text>
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
      <ScrollView style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
          </View>
        ) : (
          [...history]
            .sort((a, b) => isNewestFirst ? 0 : -1)
            .map(([date, conversations]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {[...conversations]
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
            ))
        )}
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
}); 