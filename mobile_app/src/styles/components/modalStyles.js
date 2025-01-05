import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../common/theme';

// Base modal styles that are common across all modals
export const baseModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: spacing.xl,
    width: '80%',
    maxHeight: '70%',
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.text.primary,
  },
  scrollableContent: {
    marginVertical: spacing.lg,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '500',
  },
  descriptionText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.background,
    ...typography.body,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  listItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
}); 