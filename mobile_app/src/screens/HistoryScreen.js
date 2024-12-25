import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as storage from '../services/storage';

export default function HistoryScreen() {
  const [history, setHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const transcriptions = await storage.getTranscriptions();
      const grouped = groupByDate(transcriptions);
      setHistory(grouped);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversation History</Text>
      </View>

      <ScrollView style={styles.content}>
        {history.map(([date, conversations]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            
            {conversations.map((convo, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.conversationCard}
                onPress={() => showConversationDetails(convo)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.timeText}>
                    {formatTime(convo.timestamp)}
                  </Text>
                  <Text style={styles.durationText}>
                    {formatDuration(convo.duration)}
                  </Text>
                </View>

                <View style={styles.previewContainer}>
                  {convo.utterances.slice(0, 2).map((utterance, i) => (
                    <Text key={i} style={styles.previewText} numberOfLines={1}>
                      <Text style={styles.speakerText}>{utterance.speaker}: </Text>
                      {utterance.text}
                    </Text>
                  ))}
                  {convo.utterances.length > 2 && (
                    <Text style={styles.moreText}>
                      +{convo.utterances.length - 2} more messages
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
  content: {
    flex: 1,
  },
  dateGroup: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#6200ee',
    paddingLeft: 10,
  }
}); 