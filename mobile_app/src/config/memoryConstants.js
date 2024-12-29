// Memory states
export const MEMORY_STATES = {
  NEW: 'new',           // Not yet reviewed
  REVIEWED: 'reviewed', // Has been reviewed
  SKIPPED: 'skipped'    // Has been skipped
};

// Memory status
export const MEMORY_STATUS = {
  ACCEPTED: 'accepted', // User wants to keep this memory
  REJECTED: 'rejected'  // User doesn't want to keep this memory
};

// Memory types
export const MEMORY_TYPES = {
  MEMORY: {
    id: 'memory',
    label: 'Memory',
    schema: {
      id: String,           // Unique identifier
      type: String,         // 'memory'
      title: String,        // Title of the memory (with SAMPLE: prefix)
      body: String,         // Main content
      datetime: Date,       // When this memory occurred
      geolocation: {        // Location information
        latitude: Number,
        longitude: Number,
        placeName: String
      },
      attendees: Array,     // List of attendees
      state: String,        // MEMORY_STATES value
      status: String        // MEMORY_STATUS value
    }
  },
  EVENT: {
    id: 'event',
    label: 'Event',
    schema: {
      id: String,           // Unique identifier
      type: String,         // 'event'
      title: String,        // Title of the event (with SAMPLE: prefix)
      body: String,         // Event description
      datetime: Date,       // When this event occurs
      geolocation: {        // Location information
        latitude: Number,
        longitude: Number,
        placeName: String
      },
      attendees: Array,     // List of attendees
      state: String,        // MEMORY_STATES value
      status: String        // MEMORY_STATUS value
    }
  }
};

// Swipe action colors
export const SWIPE_COLORS = {
  ACCEPT: '#4CAF50', // Green
  REJECT: '#F44336'  // Red
}; 