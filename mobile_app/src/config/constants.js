import { API_KEYS, getApiKey } from '../services/secureStorage';

// Storage Keys
export const SETTINGS_KEY = '@app_settings';
export const TRANSCRIPTIONS_KEY = '@transcriptions';
export const SUMMARIES_KEY = '@voice_notes_summaries';
export const MEMORIES_STORAGE_KEY = '@memories';

// App Messages
export const SPLASH_MESSAGE = 'Your day, simplified.';

// API Keys
export const getDeepgramApiKey = () => getApiKey(API_KEYS.DEEPGRAM);
export const getOpenAIApiKey = () => getApiKey(API_KEYS.OPENAI);

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