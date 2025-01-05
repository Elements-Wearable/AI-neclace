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
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  settingRow: {
    ...layout.row,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  selector: {
    ...components.button,
  },
  selectorText: {
    ...components.buttonText,
  },
  resetSelector: {
    backgroundColor: colors.errorLight,
  },
  resetText: {
    color: colors.error,
  }
}); 