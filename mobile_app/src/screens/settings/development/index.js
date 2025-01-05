import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { API_KEYS, hasApiKey } from '../../../services/secureStorage';
import logger from '../../../utils/logger';
import LogFilesModal from '../LogFilesModal';
import styles from '../styles';
import ApiKeys from './ApiKeys';
import DatabaseExport from './DatabaseExport';
import DebugMode from './DebugMode';
import LogExport from './LogExport';
import SampleData from './SampleData';
import VersionDisplay from './VersionDisplay';

export default function DevelopmentSettings({ 
  settings, 
  generateSampleData,
  clearSampleData,
  getAllAsyncStorageData,
  updateSetting,
  manageSampleMemories
}) {
  const [versionTaps, setVersionTaps] = useState(0);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [availableLogs, setAvailableLogs] = useState([]);
  const [showDevMenu, setShowDevMenu] = useState(false);

  // Check API keys when dev menu becomes visible
  React.useEffect(() => {
    if (showDevMenu) {
      const checkApiKeys = async () => {
        try {
          logger.debug('Checking API keys on dev menu open');
          const hasDeepgram = await hasApiKey(API_KEYS.DEEPGRAM);
          const hasOpenAI = await hasApiKey(API_KEYS.OPENAI);
          logger.info('API keys status check:', {
            deepgram: hasDeepgram ? 'configured' : 'not set',
            openai: hasOpenAI ? 'configured' : 'not set'
          });
        } catch (error) {
          logger.error('Error checking API keys:', error);
        }
      };
      checkApiKeys();
    }
  }, [showDevMenu]);

  const handleVersionPress = () => {
    const newCount = versionTaps + 1;
    setVersionTaps(newCount);
    
    if (newCount === 5) {
      setShowDevMenu(!showDevMenu);
      setVersionTaps(0);
      updateSetting('debugMode', false);
      logger.debug(showDevMenu ? 'Developer options disabled' : 'Developer options enabled');
      Alert.alert('🎉 Developer Mode', showDevMenu ? 'Developer options disabled!' : 'Developer options enabled!');
    }
  };

  const loadAvailableLogs = async () => {
    try {
      const logs = await logger.getLogFiles();
      setAvailableLogs(logs);
      setShowLogsModal(true);
    } catch (error) {
      logger.error('Failed to load log files:', error);
      Alert.alert('Error', 'Failed to load log files');
    }
  };

  return (
    <View>
      {showDevMenu && (
        <>
          <DebugMode settings={settings} updateSetting={updateSetting} />
          
          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>API Configuration</Text>
            <ApiKeys />
          </View>

          <SampleData 
            generateSampleData={generateSampleData}
            clearSampleData={clearSampleData}
            manageSampleMemories={manageSampleMemories}
          />
          <DatabaseExport getAllAsyncStorageData={getAllAsyncStorageData} />
          <LogExport loadAvailableLogs={loadAvailableLogs} />
        </>
      )}
      <VersionDisplay onPress={handleVersionPress} />
      <LogFilesModal
        showLogFiles={showLogsModal}
        setShowLogFiles={setShowLogsModal}
        logFiles={availableLogs}
        selectedLogs={[]}
        setSelectedLogs={() => {}}
      />
    </View>
  );
} 