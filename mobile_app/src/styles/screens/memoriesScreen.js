import { Dimensions, StyleSheet } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

// Memories screen specific styles
export const memoriesStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    backgroundColor: 'white',
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
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    flex: 1,
  },
  memoryDetails: {
    marginTop: 'auto',
    gap: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  memoryLocation: {
    fontSize: 14,
    color: '#666',
  },
  attendees: {
    fontSize: 14,
    color: '#666',
  },
  noMemoriesText: {
    fontSize: 18,
    color: '#666',
  },
  cardType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  hint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  hintIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
  },
  rejectColor: {
    color: 'rgba(244, 67, 54, 0.6)',
  },
  acceptColor: {
    color: 'rgba(76, 175, 80, 0.6)',
  },
  skipColor: {
    color: 'rgba(255, 215, 0, 0.6)',
  },
  cardSwiping: {
    transform: [{ scale: 1.02 }],
  },
  swipingLeft: {
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderWidth: 1,
  },
  swipingRight: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
  },
  swipingDown: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
}); 