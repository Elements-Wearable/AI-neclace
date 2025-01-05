import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './theme';

// Common form styles that can be reused across the app
export const forms = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md
  },
  
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
    color: colors.text
  },
  
  error: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs
  },
  
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold
  },
  
  buttonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.7
  }
}); 