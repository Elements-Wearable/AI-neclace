import { StyleSheet } from 'react-native';
import { colors, components, layout, spacing, typography } from '../common/theme';

export const settingsStyles = StyleSheet.create({
  container: {
    ...components.container,
  },
  safeArea: {
    ...layout.safeArea,
  },
  scrollView: {
    ...layout.flex,
  },
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
  resetSelector: {
    backgroundColor: colors.buttons.error.background,
  },
  resetText: {
    color: colors.buttons.error.text,
  }
}); 