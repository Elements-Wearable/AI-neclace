import { StyleSheet } from 'react-native';
import { colors, components, layout, spacing, typography } from '../../styles/common/theme';

export default StyleSheet.create({
  section: {
    ...components.section,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.lg,
    color: colors.text.primary,
    paddingHorizontal: spacing.section.horizontal,
  },
  settingRow: {
    ...layout.row,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.section.horizontal,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    paddingRight: spacing.lg,
  },
  selector: {
    ...components.button,
  },
  selectorText: {
    ...components.buttonText,
  },
  // Development section specific styles
  developmentSection: {
    marginTop: spacing.lg,
  },
  dangerSelector: {
    backgroundColor: colors.buttons.error.background,
  },
  dangerText: {
    color: colors.buttons.error.text,
  },
  exportSelector: {
    backgroundColor: colors.buttons.secondary.background,
  },
  exportText: {
    color: colors.buttons.secondary.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  logsList: {
    maxHeight: '65%',
    marginVertical: 10,
  },
  logsListContent: {
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  logInfo: {
    flex: 1,
  },
  logDate: {
    fontSize: 16,
    marginBottom: 4,
  },
  logSize: {
    fontSize: 14,
    color: '#666',
  },
  smallButton: {
    minWidth: 70,
    marginLeft: 10,
  },
  exportButton: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtonContent: {
    alignItems: 'center',
  },
  modalButtonCount: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  logTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  logDetails: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  logCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#FF5252',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  version: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  // Settings Icon Styles
  settingsIconContainer: {
    marginRight: 15,
  },
  settingsIcon: {
    color: '#6200ee',
    fontSize: 24,
  },
  deviceIconContainer: {
    marginLeft: 15,
  },
  deviceIcon: {
    color: '#6200ee',
    fontSize: 24,
  },
  successSelector: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  warningSelector: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#FF9800',
  },
  apiKeySection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  apiKeyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  apiKeyStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  apiKeyStatusSet: {
    color: '#4CAF50',
  },
  apiKeyStatusUnset: {
    color: '#FF9800',
  }
}); 