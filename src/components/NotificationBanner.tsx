import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NotificationBanner: React.FC = () => {
  const offlineNotification = useDiagnosisStore((s) => s.offlineNotification);
  const dismissNotification = useDiagnosisStore((s) => s.dismissNotification);

  useEffect(() => {
    if (offlineNotification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [offlineNotification, dismissNotification]);

  if (!offlineNotification) return null;

  return (
    <Modal
      transparent={true}
      visible={!!offlineNotification}
      animationType="fade"
      onRequestClose={dismissNotification}
    >
      <View style={styles.centerOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={dismissNotification}
        />

        <View style={styles.centerCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={26} color={COLORS.brand} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.titleText}>Status Sistem</Text>
            <Text style={styles.messageText}>{offlineNotification}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={dismissNotification}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  centerCard: {
    width: Math.min(SCREEN_WIDTH - 40, 360),
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrap: {
    flex: 1
  },
  titleText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.brand,
    marginBottom: 2,
    letterSpacing: 0.3
  },
  messageText: {
    fontSize: 12.5,
    fontFamily: FONTS.semiBold,
    color: COLORS.ink,
    lineHeight: 17
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
