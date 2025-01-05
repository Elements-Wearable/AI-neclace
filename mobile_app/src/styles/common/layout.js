import { StyleSheet } from 'react-native';
import { colors, spacing } from './theme';

// Common layout styles that can be reused across the app
export const layout = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  // Flex styles
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  column: {
    flexDirection: 'column'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  spaceBetween: {
    justifyContent: 'space-between'
  },
  
  // Padding styles
  padding: {
    padding: spacing.md
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md
  },
  paddingVertical: {
    paddingVertical: spacing.md
  },
  
  // Margin styles
  margin: {
    margin: spacing.md
  },
  marginTop: {
    marginTop: spacing.md
  },
  marginBottom: {
    marginBottom: spacing.md
  },
  
  // Shadow style
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
}); 