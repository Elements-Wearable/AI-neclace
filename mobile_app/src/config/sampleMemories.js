import { MEMORY_STATES, MEMORY_TYPES } from './memoryConstants';

// Helper function to create sample memory
const createSampleMemory = (id, title, content, type, timestamp, tags) => ({
  id: `sample_${id}`,
  title: `[SAMPLE] ${title}`,
  content,
  timestamp: new Date(timestamp).getTime(),
  tags: [...tags, 'sample_memory'],
  imageUrl: `https://example.com/${id}.jpg`,
  type,
  state: MEMORY_STATES.NEW,
  reviewedAt: null,
  isSample: true,
  sampleMetadata: {
    createdAt: new Date().toISOString(),
    version: '1.0',
    category: 'demo_content'
  }
});

// Export sample memories with clear identification
export const SAMPLE_MEMORIES = [
  createSampleMemory(
    'college_1',
    'First Day at College',
    'Met amazing people and felt so excited about the new chapter in my life. The campus was beautiful in autumn.',
    MEMORY_TYPES.EVENT,
    '2023-09-01',
    ['college', 'beginnings', 'friends']
  ),
  createSampleMemory(
    'beach_1',
    'Summer Beach Trip',
    'Perfect day at the beach with crystal clear water. Built sandcastles and watched the sunset.',
    MEMORY_TYPES.TRAVEL,
    '2023-07-15',
    ['summer', 'beach', 'sunset']
  ),
  createSampleMemory(
    'family_1',
    'Family Reunion',
    'Finally got to see everyone after so long. Grandma made her famous apple pie.',
    MEMORY_TYPES.RELATIONSHIP,
    '2023-12-25',
    ['family', 'holidays', 'food']
  ),
  createSampleMemory(
    'achievement_1',
    'First Marathon',
    'Completed my first marathon! The training paid off, and the feeling at the finish line was incredible.',
    MEMORY_TYPES.ACHIEVEMENT,
    '2023-10-10',
    ['achievement', 'running', 'fitness']
  ),
  createSampleMemory(
    'travel_1',
    'Road Trip Adventure',
    'Spontaneous road trip with best friends. Found amazing hidden spots and made unforgettable memories.',
    MEMORY_TYPES.TRAVEL,
    '2023-08-20',
    ['travel', 'friends', 'adventure']
  )
];

// Helper functions for sample memory management
export const isSampleMemory = (memory) => {
  return memory.isSample === true || memory.id.startsWith('sample_');
};

export const filterOutSampleMemories = (memories) => {
  return memories.filter(memory => !isSampleMemory(memory));
};

export const addSampleMemoriesToExisting = (existingMemories) => {
  return [...existingMemories, ...SAMPLE_MEMORIES];
};