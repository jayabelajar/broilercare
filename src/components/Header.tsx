import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
    <View style={styles.headerWrapper}>
      {/* Decorative ambient gradients */}
      <View style={styles.ambientCircleOne} />
      <View style={styles.ambientCircleTwo} />

      <View style={styles.contentRow}>
        <View style={styles.left}>
          <Text style={styles.greetingTitle} numberOfLines={1}>
            {title || `Halo, ${displayName}`}
          </Text>
          <Text style={styles.greetingSub} numberOfLines={1}>
            {subtitle || (user?.farmName ? `🏠 ${user.farmName}` : 'Sistem Pakar Broiler')}
          </Text>
        </View>

        {/* Right Frosted Notification Bell */}
        <TouchableOpacity
          style={styles.notifBtn}
          activeOpacity={0.75}
          onPress={openNotificationModal}
        >
          <View style={styles.notifCircle}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={20}
              color="#FFFFFF"
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.brand, // Royal Blue Primary (#2563EB)
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6
  },
  ambientCircleOne: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  ambientCircleTwo: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(29, 78, 216, 0.4)'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  left: {
    flex: 1,
    paddingRight: 10
  },
  greetingTitle: {
    fontSize: 20,
    fontFamily: FONTS.extraBold,
    color: '#FFFFFF',
    letterSpacing: -0.4
  },
  greetingSub: {
    fontSize: 12,
    color: '#DBEAFE', // Soft icy blue tint
    fontFamily: FONTS.medium,
    marginTop: 3
  },
  notifBtn: {
    padding: 2
  },
  notifCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
