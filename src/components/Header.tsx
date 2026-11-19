import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const user = useDiagnosisStore((s) => s.user);
  const notifications = useDiagnosisStore((s) => s.notifications);
  const openNotificationModal = useDiagnosisStore((s) => s.openNotificationModal);

  // Ambil nama maksimal 2 kata + emotikon tangan melambai di akhir
  const nameWords = user?.name ? user.name.trim().split(/\s+/) : ['Peternak'];
  const shortName = nameWords.slice(0, 2).join(' ');
  const defaultGreeting = `Halo, ${shortName} 👋`;

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <View style={styles.container}>
      {/* Hanya Title Saja Tanpa Deskripsi / Tanpa Teks Farm */}
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {title || defaultGreeting}
        </Text>
      </View>

      {/* Ikon Notifikasi Responsif */}
      <TouchableOpacity
        style={styles.notifBtn}
        activeOpacity={0.7}
        onPress={openNotificationModal}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)'
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink,
    letterSpacing: -0.4
  },
  notifBtn: {
    padding: 2
  },
  notifCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    top: 3,
    right: 3,
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
