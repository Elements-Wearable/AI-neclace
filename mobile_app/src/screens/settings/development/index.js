import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import logger from '../../../utils/logger';
import LogFilesModal from '../LogFilesModal';
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