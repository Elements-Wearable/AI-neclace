// Memory states (whether accepted or rejected)
export const MEMORY_STATES = {
  PENDING: 'pending',    // Initial state, not yet accepted/rejected
  ACCEPTED: 'accepted',  // User wants to keep this memory
  REJECTED: 'rejected'   // User doesn't want to keep this memory
};

// Memory status (whether it's new or viewed)
export const MEMORY_STATUS = {
  NEW: 'new',           // Not yet viewed/actioned
  VIEWED: 'viewed'      // Has been viewed/actioned
};

// Memory types/categories
export const MEMORY_TYPES = {
  MEMORY: {
    id: 'memory',
    label: 'Memory',
    description: 'Personal memories, thoughts, and reflections to preserve',
    icon: '💭',
    color: '#9C27B0', // Purple
    schema: {
      id: String,           // Unique identifier
      type: String,         // 'memory'
      title: String,        // Title of the memory
      content: String,      // Main content/body
      timestamp: Date,      // When this memory occurred
      state: String,        // MEMORY_STATES value
      status: String,       // MEMORY_STATUS value
      createdAt: Date,      // When this memory was created in the system
      updatedAt: Date,      // Last time this memory was modified
      tags: Array,          // Optional tags
      location: {           // Optional location
        latitude: Number,
        longitude: Number,
        placeName: String
      },
      attachments: Array,   // Optional attachments (URLs)
      importance: Number,   // Optional importance rating (1-5)
      isPrivate: Boolean    // Optional privacy flag
    }
  },
  CALENDAR: {
    id: 'calendar',
    label: 'Calendar Event',
    description: 'Calendar events, appointments, and scheduled activities',
    icon: '📅',
    color: '#2196F3', // Blue
    schema: {
      id: String,           // Unique identifier
      type: String,         // 'calendar'
      title: String,        // Event title
      description: String,  // Event description
      startDate: Date,      // Event start
      endDate: Date,        // Event end
      state: String,        // MEMORY_STATES value
      status: String,       // MEMORY_STATUS value
      createdAt: Date,      // When this event was created in the system
      updatedAt: Date,      // Last time this event was modified
      location: {           // Optional location
        latitude: Number,
        longitude: Number,
        placeName: String,
        address: String
      },
      attendees: Array,     // Optional attendees
      category: String,     // Optional category (work, personal, family, etc.)
      isRecurring: Boolean, // Whether this event repeats
      recurrenceRule: String, // RRULE format if recurring
      reminders: Array,     // Optional reminder times
      attachments: Array    // Optional attachments
    }
  }
};

// Swipe action colors
export const SWIPE_COLORS = {
  ACCEPT: '#4CAF50', // Green
  REJECT: '#F44336'  // Red
}; 