import { Platform, StyleSheet } from 'react-native';

// Home screen specific styles
export const homeStyles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Button styles
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },

  // Transcription styles
  transcriptionContainer: {
    marginTop: 20,
    gap: 10,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  utteranceContainer: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  utteranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  confidenceScore: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  utteranceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },

  // Recording styles
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    marginRight: 8,
  },
  recordingText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    maxHeight: '85%',
  },

  // Loading and processing styles
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6200ee',
    fontSize: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryModal: {
    backgroundColor: 'white',
    maxHeight: '70%',
  },
  summaryContainer: {
    flex: 1,
    marginVertical: 15,
  },
  summaryTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryStats: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
    fontWeight: '500',
  },
  summaryTextContainer: {
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  summaryCloseButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },

  // Error styles
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },

  // Processing indicator styles
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 4,
    marginTop: 8,
  },
  processingText: {
    marginLeft: 8,
    color: '#6200ee',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },

  // Task queue styles
  taskQueueIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskQueueText: {
    fontSize: 12,
    color: '#6200ee',
    marginLeft: 4,
  },

  // Status styles
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 10,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  activeStatus: {
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Layout styles
  mainContent: {
    flex: 1,
  },
  transcriptionSection: {
    flex: 1,
    maxHeight: '50%',
    marginTop: 20,
  },
  buttonsSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },

  // Timeline styles
  timelineContainer: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLine: {
    width: 2,
    backgroundColor: '#6200ee',
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },

  // Top section styles
  topSection: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  recordDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  recordingActive: {
    backgroundColor: '#dc3545',
  },
  recordingDot: {
    width: 20,
    height: 20,
  },
  transcriptionWrapper: {
    flex: 1,
    marginTop: 16,
  },
  processingButton: {
    backgroundColor: '#FFA000',
  },
  recordingStatus: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  processingActive: {
    backgroundColor: '#2196F3',
  },
  processingDot: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  processingInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  processingStatusContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  processingInfoText: {
    fontSize: 13,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
  },
  processingProgress: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '400',
  },

  // Language selection styles
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  languageModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  languageList: {
    marginVertical: 15,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedLanguage: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#6200ee',
    fontWeight: '500',
  },

  // Settings button styles
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
  },

  // Metadata styles
  metadataContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  topicsContainer: {
    marginVertical: 4,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topicTag: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    color: '#6200ee',
  },

  // Top bar styles
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  testButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 