import { Platform } from 'react-native';

// Colors
export const colors = {
  primary: '#6200ee',
  primaryLight: 'rgba(98, 0, 238, 0.1)',
  secondary: '#03DAC6',
  error: '#dc3545',
  errorLight: 'rgba(220, 53, 69, 0.1)',
  success: 'rgba(76, 175, 80, 0.6)',
  warning: 'rgba(255, 215, 0, 0.6)',
  reject: 'rgba(244, 67, 54, 0.6)',
  background: '#fff',
  surface: '#fff',
  text: {
    primary: '#333',
    secondary: '#666',
    hint: '#888',
  },
  border: '#eee',
  buttons: {
    primary: {
      background: '#6200ee',
      text: '#fff',
    },
    secondary: {
      background: 'rgba(98, 0, 238, 0.1)',
      text: '#6200ee',
    },
    error: {
      background: 'rgba(220, 53, 69, 0.1)',
      text: '#dc3545',
    },
  },
};

// Typography
export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  small: {
    fontSize: 11,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: {
    vertical: 16,
    horizontal: 12,
  },
  button: {
    minWidth: 110,
    height: 36,
    padding: 12,
  }
};

// Common layout styles
export const layout = {
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
};

// Common component styles
export const components = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingVertical: spacing.section.vertical,
    paddingHorizontal: spacing.section.horizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: colors.buttons.secondary.background,
    height: spacing.button.height,
    paddingHorizontal: spacing.button.padding,
    borderRadius: spacing.lg,
    minWidth: spacing.button.minWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.buttons.secondary.text,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    textAlign: 'center',
  },
}; 