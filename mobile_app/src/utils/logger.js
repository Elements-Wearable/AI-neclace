import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Simple state management
const state = {
  logFilePath: null,
  isDebugMode: false
};

// Format log message with timestamp
const formatLogMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.length > 0 
    ? ' ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
    : '';
  return `[${timestamp}] ${level}: ${message}${formattedArgs}`;
};

// Write to log file
const writeToFile = async (message) => {
  if (!state.logFilePath || !state.isDebugMode) return;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(state.logFilePath);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(state.logFilePath, '', { encoding: FileSystem.EncodingType.UTF8 });
    }
    
    await FileSystem.writeAsStringAsync(
      state.logFilePath,
      message + '\n',
      { append: true, encoding: FileSystem.EncodingType.UTF8 }
    );
  } catch (error) {
    console.warn('Failed to write to log file:', error);
  }
};

// Create new log file when debug is enabled
const createNewLogFile = async () => {
  const timestamp = new Date().toISOString();
  const sessionId = Math.random().toString(36).substring(7);
  const currentDate = timestamp.split('T')[0];
  
  try {
    // Ensure logs directory exists
    const logsDir = `${FileSystem.documentDirectory}logs`;
    const dirInfo = await FileSystem.getInfoAsync(logsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logsDir, { intermediates: true });
    }
    
    // Create new log file path
    state.logFilePath = `${logsDir}/debug_${currentDate}_${sessionId}.log`;
    state.isDebugMode = true;

    // Create empty file first
    await FileSystem.writeAsStringAsync(
      state.logFilePath,
      '',
      { encoding: FileSystem.EncodingType.UTF8 }
    );
    
    // Write initial message
    await writeToFile(formatLogMessage('DEBUG', 'Debug session started'));
    
    return state.logFilePath;
  } catch (error) {
    console.warn('Failed to create log file:', error);
    throw error;
  }
};

// Close current log file when debug is disabled
const closeCurrentLogFile = async () => {
  if (state.logFilePath && state.isDebugMode) {
    try {
      await writeToFile(formatLogMessage('DEBUG', 'Debug session ended'));
      state.logFilePath = null;
      state.isDebugMode = false;
    } catch (error) {
      console.warn('Failed to close log file:', error);
    }
  }
};

// Main logging function
const log = async (level, message, ...args) => {
  if (!state.isDebugMode) return;
  
  const formattedMessage = formatLogMessage(level, message, ...args);
  console.log(formattedMessage);
  await writeToFile(formattedMessage);
};

// Logging methods
const debug = (...args) => log('DEBUG', ...args);
const info = (...args) => log('INFO', ...args);
const warn = (...args) => log('WARN', ...args);
const error = (...args) => log('ERROR', ...args);

// Get all available log files
const getLogFiles = async () => {
  try {
    const logsDir = `${FileSystem.documentDirectory}logs`;
    const dirInfo = await FileSystem.getInfoAsync(logsDir);
    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(logsDir);
    const logFiles = await Promise.all(
      files
        .filter(file => file.startsWith('debug_') && file.endsWith('.log'))
        .map(async file => {
          const filePath = `${logsDir}/${file}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          const content = await FileSystem.readAsStringAsync(filePath);
          const lines = content.split('\n').filter(line => line.trim());
          
          const firstLine = lines[0] || '';
          const lastLine = lines[lines.length - 1] || '';
          const fileDate = file.replace('debug_', '').split('_')[0];
          
          // Extract timestamps
          const startTime = firstLine.match(/\[(.*?)\]/)?.[1] || fileDate;
          const endTime = lastLine.match(/\[(.*?)\]/)?.[1] || fileDate;
          
          return {
            name: file,
            date: fileDate,
            size: fileInfo.size,
            uri: fileInfo.uri,
            lines: lines.length,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            preview: lines.slice(0, 3).join('\n')
          };
        })
    );
    
    // Sort by date, newest first
    return logFiles.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.warn('Failed to get log files:', error);
    return [];
  }
};

// Share a single log file
const shareLogFile = async (date = new Date()) => {
  const formattedDate = date.toISOString().split('T')[0];
  const logPath = `${FileSystem.documentDirectory}logs/debug_${formattedDate}.log`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(logPath);
    if (!fileInfo.exists) {
      throw new Error('No log file exists for this date');
    }

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(logPath, {
      mimeType: 'text/plain',
      dialogTitle: `Debug Logs for ${formattedDate}`,
      UTI: 'public.plain-text'
    });
  } catch (error) {
    console.warn('Failed to share log file:', error);
    throw error;
  }
};

// Share multiple log files
const shareMultipleLogFiles = async (files) => {
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    const zipDir = `${FileSystem.cacheDirectory}logs_export/`;
    await FileSystem.makeDirectoryAsync(zipDir, { intermediates: true });

    await Promise.all(
      files.map(file =>
        FileSystem.copyAsync({
          from: file.uri,
          to: `${zipDir}${file.name}`
        })
      )
    );

    await Sharing.shareAsync(zipDir, {
      mimeType: 'application/zip',
      dialogTitle: 'Debug Logs Export',
      UTI: 'public.zip-archive'
    });

    // Cleanup
    await FileSystem.deleteAsync(zipDir, { idempotent: true });
  } catch (error) {
    console.warn('Failed to share log files:', error);
    throw error;
  }
};

// Export functions
export default {
  createNewLogFile,
  closeCurrentLogFile,
  debug,
  info,
  warn,
  error,
  getLogFiles,
  shareLogFile,
  shareMultipleLogFiles
}; 