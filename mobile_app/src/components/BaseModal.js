import React from 'react';
import { Modal, View } from 'react-native';
import { baseModalStyles } from '../styles/components/modalStyles';

/**
 * BaseModal component that provides consistent styling and behavior for all modals
 * @param {Object} props
 * @param {boolean} props.visible - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {React.ReactNode} props.children - Modal content
 * @param {Object} props.contentStyle - Additional styles for the content container
 */
const BaseModal = ({ visible, onClose, children, contentStyle }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={baseModalStyles.overlay}>
        <View style={[baseModalStyles.content, contentStyle]}>
          {children}
        </View>
      </View>
    </Modal>
  );

export default BaseModal; 