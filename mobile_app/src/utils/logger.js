import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class Logger {
  constructor() {
    this.logQueue = [];
    this.currentDate = new Date().toISOString().split('T')[0];
    this.logFilePath = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Create logs directory if it doesn't exist
    const logsDir = `${FileSystem.documentDirectory}logs/`;
    try {
      const dirInfo = await FileSystem.getInfoAsync(logsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(logsDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
    
    this.logFilePath = `${logsDir}debug_${this.currentDate}.log`;
    this.initialized = true;
  }

  async writeToFile(message) {
    if (!global.debugMode) return;
    
    await this.init();
    
    try {
      // Check if we need to create a new file for a new day
      const today = new Date().toISOString().split('T')[0];
      if (today !== this.currentDate) {
        this.currentDate = today;
        this.logFilePath = `${FileSystem.documentDirectory}logs/debug_${this.currentDate}.log`;
      }

      // Append to file
      await FileSystem.writeAsStringAsync(
        this.logFilePath,
        message + '\n',
        { append: true }
      );
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  async shareLogFile(date = new Date()) {
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
      console.error('Failed to share log file:', error);
      throw error;
    }
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    
    return `[${timestamp}] ${level}: ${message} ${formattedArgs}`.trim();
  }

  debug(message, ...args) {
    if (!global.debugMode) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message, ...args);
    console.debug(`🐛 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  info(message, ...args) {
    const formattedMessage = this.formatMessage('INFO', message, ...args);
    console.log(`ℹ️ ${formattedMessage}`);
    if (global.debugMode) {
      this.writeToFile(formattedMessage);
    }
  }

  warn(message, ...args) {
    const formattedMessage = this.formatMessage('WARN', message, ...args);
    console.warn(`⚠️ ${formattedMessage}`);
    if (global.debugMode) {
      this.writeToFile(formattedMessage);
    }
  }

  error(message, ...args) {
    const formattedMessage = this.formatMessage('ERROR', message, ...args);
    console.error(`❌ ${formattedMessage}`);
    if (global.debugMode) {
      this.writeToFile(formattedMessage);
    }
  }

  async getLogFiles() {
    await this.init();
    const logsDir = `${FileSystem.documentDirectory}logs/`;
    
    try {
      const files = await FileSystem.readDirectoryAsync(logsDir);
      const logFiles = [];
      
      // Get details for each log file
      for (const file of files) {
        if (file.startsWith('debug_') && file.endsWith('.log')) {
          const fileInfo = await FileSystem.getInfoAsync(`${logsDir}${file}`);
          logFiles.push({
            name: file,
            date: file.replace('debug_', '').replace('.log', ''),
            size: fileInfo.size,
            uri: fileInfo.uri
          });
        }
      }
      
      // Sort by date, newest first
      return logFiles.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Failed to get log files:', error);
      throw error;
    }
  }

  async shareMultipleLogFiles(files) {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      // Create a zip file containing selected logs
      const zipDir = `${FileSystem.cacheDirectory}logs_export/`;
      await FileSystem.makeDirectoryAsync(zipDir, { intermediates: true });

      // Copy selected files to zip directory
      for (const file of files) {
        await FileSystem.copyAsync({
          from: file.uri,
          to: `${zipDir}${file.name}`
        });
      }

      // Share the directory
      await Sharing.shareAsync(zipDir, {
        mimeType: 'application/zip',
        dialogTitle: 'Debug Logs Export',
        UTI: 'public.zip-archive'
      });

      // Cleanup
      await FileSystem.deleteAsync(zipDir, { idempotent: true });
    } catch (error) {
      console.error('Failed to share log files:', error);
      throw error;
    }
  }
}

export default new Logger(); 