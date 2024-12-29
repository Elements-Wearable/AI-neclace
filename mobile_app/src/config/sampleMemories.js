import { MEMORY_STATES, MEMORY_STATUS, MEMORY_TYPES } from './memoryConstants';

// Helper function to create sample memory
const createSampleMemory = (id, type, data) => ({
  id: `sample_${id}`,
  type: type.id,
  state: MEMORY_STATES.PENDING,
  status: MEMORY_STATUS.NEW,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});

// Export sample memories with clear identification
export const SAMPLE_MEMORIES = [
  // Calendar Events
  createSampleMemory('event_1', MEMORY_TYPES.CALENDAR, {
    title: 'Team Project Meeting',
    description: 'Weekly sync with the development team to discuss project progress',
    startDate: new Date('2024-01-10T10:00:00').toISOString(),
    endDate: new Date('2024-01-10T11:00:00').toISOString(),
    timestamp: new Date('2024-01-10T10:00:00').toISOString(),
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      placeName: 'Office Conference Room A',
      address: '123 Business St, San Francisco, CA 94105'
    },
    attendees: ['john@example.com', 'sarah@example.com', 'mike@example.com'],
    category: 'work',
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE',
    reminders: [15, 60]
  }),
  
  createSampleMemory('event_2', MEMORY_TYPES.CALENDAR, {
    title: 'Family Dinner',
    description: 'Monthly family gathering at Grandmas house',
    startDate: new Date('2024-01-15T18:00:00').toISOString(),
    endDate: new Date('2024-01-15T21:00:00').toISOString(),
    timestamp: new Date('2024-01-15T18:00:00').toISOString(),
    location: {
      latitude: 37.7739,
      longitude: -122.4312,
      placeName: 'Grandmas House',
      address: '456 Family Lane, San Francisco, CA 94110'
    },
    attendees: ['mom', 'dad', 'sister', 'grandma', 'uncle_bob'],
    category: 'family',
    isRecurring: true,
    recurrenceRule: 'FREQ=MONTHLY;BYDAY=3SU',
    reminders: [1440, 120]
  }),

  // Memories
  createSampleMemory('memory_1', MEMORY_TYPES.MEMORY, {
    title: 'Peaceful Morning Reflection',
    content: 'Watched the sunrise from the hilltop today. The city was so quiet and peaceful. These moments of solitude help me find clarity.',
    timestamp: new Date('2024-01-05T06:30:00').toISOString(),
    tags: ['reflection', 'peace', 'morning', 'nature'],
    mood: 'peaceful',
    location: {
      latitude: 37.7569,
      longitude: -122.4478,
      placeName: 'Twin Peaks Summit'
    },
    importance: 4,
    isPrivate: true
  }),

  createSampleMemory('memory_2', MEMORY_TYPES.MEMORY, {
    title: 'Creative Breakthrough',
    content: 'Finally solved that coding problem that was bothering me for days. Sometimes stepping away and coming back with fresh eyes makes all the difference.',
    timestamp: new Date('2024-01-08T14:20:00').toISOString(),
    tags: ['coding', 'achievement', 'learning', 'work'],
    mood: 'accomplished',
    location: {
      latitude: 37.7858,
      longitude: -122.4065,
      placeName: 'Local Coffee Shop'
    },
    importance: 3,
    isPrivate: false
  })
];

// Helper functions for sample memory management
export const isSampleMemory = (memory) => {
  return memory.id?.startsWith('sample_');
};

export const filterOutSampleMemories = (memories) => {
  return memories.filter(memory => !isSampleMemory(memory));
};

export const addSampleMemoriesToExisting = (existingMemories) => {
  return [...existingMemories, ...SAMPLE_MEMORIES];
};