import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  icon = 'alert-circle',
  iconColor = COLORS.danger,
  iconBg = '#FEE2E2',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onCancel}
        />

        <View style={styles.dialogCard}>
          {/* Top Icon */}
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>

          {/* Text Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.75}
              onPress={onCancel}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isDestructive ? styles.confirmBtnDestructive : styles.confirmBtnPrimary
              ]}
              activeOpacity={0.85}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  dialogCard: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 16.5,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 8
  },
  message: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: COLORS.inkSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.inkSecondary
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBtnDestructive: {
    backgroundColor: COLORS.danger
  },
  confirmBtnPrimary: {
    backgroundColor: COLORS.brand
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
