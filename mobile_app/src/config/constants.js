// Storage Keys
export const SETTINGS_KEY = '@app_settings';
export const TRANSCRIPTIONS_KEY = '@transcriptions';
export const SUMMARIES_KEY = '@voice_notes_summaries';
export const MEMORIES_STORAGE_KEY = '@memories';

// API Keys
export const DEEPGRAM_API_KEY = 'e59012aa2b98ab54218c21d9aefbb06fa58b5fb5';
export const OPENAI_API_KEY = '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';

// App Settings
export const CHUNK_DURATION = 5000;
export const BACKGROUND_RECORDING_TASK = 'BACKGROUND_RECORDING_TASK';

// Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
];

// Add theme options to constants
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Update defaultSettings
export const defaultSettings = {
  language: 'en',
  autoSpeakerDetection: true,
  maxSpeakers: 2,
  highQualityAudio: true,
  smartFormatting: true,
  utteranceThreshold: 0.3,
  autoPunctuation: true,
  showTabLabels: true,
  tabBarAnimation: true,
  theme: THEME_OPTIONS.SYSTEM,
  debugMode: false,
}; 