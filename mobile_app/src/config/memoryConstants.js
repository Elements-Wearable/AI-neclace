// Memory review states
export const MEMORY_STATES = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

// Memory types/categories with descriptions and schema
export const MEMORY_TYPES = {
  MEMORY: {
    id: 'memory',
    label: 'Memory',
    description: 'Personal memories, thoughts, and reflections to preserve',
    icon: '💭',
    color: '#9C27B0', // Purple
    schema: {
      title: String,
      content: String,
      timestamp: Date,
      tags: Array,
      mood: String,
      location: {
        latitude: Number,
        longitude: Number,
        placeName: String
      },
      attachments: Array, // URLs to photos, audio, etc.
      importance: Number, // 1-5 rating
      isPrivate: Boolean
    }
  },
  EVENT: {
    id: 'event',
    label: 'Event',
    description: 'Calendar events, appointments, and scheduled activities',
    icon: '📅',
    color: '#2196F3', // Blue
    schema: {
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      location: {
        latitude: Number,
        longitude: Number,
        placeName: String,
        address: String
      },
      attendees: Array,
      category: String, // work, personal, family, etc.
      isRecurring: Boolean,
      recurrenceRule: String, // RRULE format
      reminders: Array, // Array of reminder times
      attachments: Array,
      status: String // confirmed, tentative, cancelled
    }
  }
};

// Swipe action colors
export const SWIPE_COLORS = {
  ACCEPT: '#4CAF50', // Green
  REJECT: '#F44336'  // Red
}; 