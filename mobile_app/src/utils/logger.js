import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class Logger {
  constructor() {
    this.logQueue = [];
    this.currentDate = new Date().toISOString().split('T')[0];
    this.logFilePath = null;
    this.initialized = false;
    this.currentSessionId = null;
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
    
    this.initialized = true;
  }

  async createNewLogFile() {
    const timestamp = new Date().toISOString();
    this.currentSessionId = Math.random().toString(36).substring(7);
    this.currentDate = timestamp.split('T')[0];
    this.logFilePath = `${FileSystem.documentDirectory}logs/debug_${this.currentDate}_${this.currentSessionId}.log`;
    
    await this.init();
    await this.writeToFile(`[${timestamp}] DEBUG: Debug session started`);
    return this.logFilePath;
  }

  async closeCurrentLogFile() {
    if (this.logFilePath && this.currentSessionId) {
      const timestamp = new Date().toISOString();
      await this.writeToFile(`[${timestamp}] DEBUG: Debug session ended`);
      this.currentSessionId = null;
      this.logFilePath = null;
    }
  }

  async writeToFile(message) {
    if (!global.debugMode) return;
    
    await this.init();
    
    try {
      // Ensure we have a log file
      if (!this.logFilePath) {
        await this.createNewLogFile();
      }
      
      // Append to current file
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
          const fileDate = file.replace('debug_', '').replace('.log', '');
          
          // Read first and last lines to get time range
          const content = await FileSystem.readAsStringAsync(fileInfo.uri);
          const lines = content.split('\n').filter(line => line.trim());
          const firstLine = lines[0] || '';
          const lastLine = lines[lines.length - 1] || '';
          
          // Extract timestamps
          const startTime = firstLine.match(/\[(.*?)\]/)?.[1] || fileDate;
          const endTime = lastLine.match(/\[(.*?)\]/)?.[1] || fileDate;
          
          logFiles.push({
            name: file,
            date: fileDate,
            size: fileInfo.size,
            uri: fileInfo.uri,
            lines: lines.length,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            preview: lines.slice(0, 3).join('\n') // First 3 lines as preview
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