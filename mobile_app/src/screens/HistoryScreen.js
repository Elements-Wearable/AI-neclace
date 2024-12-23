import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTranscriptions } from '../services/database';

export default function HistoryScreen({ navigation }) {
  const [transcriptions, setTranscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadTranscriptions = async () => {
    try {
      const data = await getTranscriptions();
      setTranscriptions(data);
    } catch (error) {
      console.error('Error loading transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTranscriptions();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transcriptionItem}
      onPress={() => navigation.navigate('TranscriptionDetail', { id: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text style={styles.speakers}>
          {item.speaker_count} speaker{item.speaker_count !== 1 ? 's' : ''}
        </Text>
      </View>
      <Text numberOfLines={2} style={styles.preview}>
        {item.full_text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transcriptions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTranscriptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... styles ...
}); 