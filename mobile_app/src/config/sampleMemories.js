import { MEMORY_STATES, MEMORY_STATUS, MEMORY_TYPES } from './memoryConstants';

// Helper function to create a sample memory
const createSampleMemory = (id, type, data) => ({
  id: `sample_${id}`,
  type: type.id,
  state: MEMORY_STATES.NEW,
  status: MEMORY_STATUS.NEW,
  ...data
});

// Export sample memories
export const SAMPLE_MEMORIES = [
  // Memory type samples
  createSampleMemory('memory_1', MEMORY_TYPES.MEMORY, {
    title: 'SAMPLE: Morning Reflection',
    body: 'Watched the sunrise from Twin Peaks today. The city was so quiet and peaceful. These moments of solitude help me find clarity.',
    datetime: new Date('2024-01-05T06:30:00').toISOString(),
    geolocation: {
      latitude: 37.7569,
      longitude: -122.4478,
      placeName: 'Twin Peaks Summit'
    },
    attendees: ['John Smith']
  }),

  createSampleMemory('memory_2', MEMORY_TYPES.MEMORY, {
    title: 'SAMPLE: Creative Breakthrough',
    body: 'Finally solved that coding problem that was bothering me for days. Sometimes stepping away and coming back with fresh eyes makes all the difference.',
    datetime: new Date('2024-01-08T14:20:00').toISOString(),
    geolocation: {
      latitude: 37.7858,
      longitude: -122.4065,
      placeName: 'Local Coffee Shop'
    },
    attendees: ['John Smith', 'Sarah Johnson']
  }),

  // Event type samples
  createSampleMemory('event_1', MEMORY_TYPES.EVENT, {
    title: 'SAMPLE: Team Project Meeting',
    body: 'Weekly sync with the development team to discuss project progress',
    datetime: new Date('2024-01-10T10:00:00').toISOString(),
    geolocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      placeName: 'Office Conference Room A'
    },
    attendees: ['john@example.com', 'sarah@example.com', 'mike@example.com']
  }),

  createSampleMemory('event_2', MEMORY_TYPES.EVENT, {
    title: 'SAMPLE: Family Dinner',
    body: 'Monthly family gathering at Grandmas house',
    datetime: new Date('2024-01-15T18:00:00').toISOString(),
    geolocation: {
      latitude: 37.7739,
      longitude: -122.4312,
      placeName: 'Grandmas House'
    },
    attendees: ['mom', 'dad', 'sister', 'grandma', 'uncle_bob']
  })
];

// Helper functions for sample memory management
export const isSampleMemory = (memory) => memory.title?.startsWith('SAMPLE:');
export const filterOutSampleMemories = (memories) => memories.filter(memory => !isSampleMemory(memory));