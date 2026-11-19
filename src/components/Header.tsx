import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const user = useDiagnosisStore((s) => s.user);
  const notifications = useDiagnosisStore((s) => s.notifications);
  const openNotificationModal = useDiagnosisStore((s) => s.openNotificationModal);

  const displayName = user ? user.name.split(' ')[0] : 'Peternak';
  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <View style={styles.container}>
      {/* Left Title & Subtitle (No branding icon/text) */}
      <View style={styles.left}>
        <Text style={styles.greetingTitle} numberOfLines={1}>
          {title || `Halo, ${displayName}`}
        </Text>
        <Text style={styles.greetingSub} numberOfLines={1}>
          {subtitle || (user?.farmName ? `🏠 ${user.farmName}` : 'Sistem Pakar Broiler')}
        </Text>
      </View>

      {/* Right Notification Bell */}
      <TouchableOpacity
        style={styles.notifBtn}
        activeOpacity={0.7}
        onPress={openNotificationModal}
      >
        <View style={styles.notifCircle}>
          <Ionicons
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={20}
            color={unreadCount > 0 ? COLORS.brand : COLORS.ink}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineSubtle
  },
  left: {
    flex: 1,
    justifyContent: 'center'
  },
  greetingTitle: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink,
    letterSpacing: -0.3
  },
  greetingSub: {
    fontSize: 11.5,
    color: COLORS.muted,
    fontFamily: FONTS.medium,
    marginTop: 2
  },
  notifBtn: {
    padding: 2,
    marginLeft: 8
  },
  notifCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.surface
  },
  badgeText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
