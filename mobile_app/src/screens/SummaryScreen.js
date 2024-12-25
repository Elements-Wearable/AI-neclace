import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { OPENAI_API_KEY } from '../config/constants';
import * as storage from '../services/storage';

export default function SummaryScreen({ route, navigation }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [summary, setSummary] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toLocaleDateString();
      const transcriptions = await storage.getTranscriptions();
      const todaysTranscripts = transcriptions.filter(t => 
        new Date(t.timestamp).toLocaleDateString() === today
      );

      if (todaysTranscripts.length === 0) {
        setError('No transcriptions found for today');
        return;
      }

      const conversationData = todaysTranscripts.map(t => ({
        time: new Date(t.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        utterances: t.utterances.map(u => `${u.speaker}: ${u.text}`).join('\n')
      }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an assistant that analyzes conversations and extracts key information.
              Provide your response in the following format:
              SUMMARY: A single, concise paragraph summarizing the main points of the conversation.
              EVENTS: List any potential calendar events, appointments, or tasks mentioned. For each event include:
              - Title
              - Date/Time (if mentioned)
              - People involved
              - Location (if mentioned)
              - Details`
            },
            {
              role: "user",
              content: `Please analyze these conversations from today:\n\n${
                conversationData.map(c => 
                  `[${c.time}]\n${c.utterances}\n---`
                ).join('\n\n')
              }`
            }
          ]
        })
      });

      const data = await response.json();
      setSummary(data.choices[0].message.content);

    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Generating summary...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={generateSummary}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Summary</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={generateSummary}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.card}>
            <Text style={styles.summaryText}>
              {summary?.split('EVENTS:')[0].replace('SUMMARY:', '').trim()}
            </Text>
          </View>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {summary?.split('EVENTS:')[1]?.split('\n').map((event, index) => {
            if (!event.trim() || event.trim().startsWith('-')) return null;
            
            const details = event.split('\n').filter(line => line.trim());
            if (!details.length) return null;

            return (
              <View key={index} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>
                    {details[0].replace(/^[•-]\s*/, '')}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  {details.slice(1).map((detail, i) => (
                    <Text key={i} style={styles.eventDetailText}>
                      {detail.replace(/^[•-]\s*/, '').trim()}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summarySection: {
    marginBottom: 24,
  },
  eventsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6200ee',
    marginRight: 8,
    marginTop: 2,
  },
  eventText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  refreshButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  eventDetails: {
    gap: 4,
  },
  eventDetailText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  eventTime: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 