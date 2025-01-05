import { Platform, StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  selector: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  selectorText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resetSelector: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  resetText: {
    color: '#dc3545',
  }
}); 