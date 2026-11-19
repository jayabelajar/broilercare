import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<Props> = ({ visible, onClose }) => {
  const notifications = useDiagnosisStore((s) => s.notifications);
  const markNotificationsRead = useDiagnosisStore((s) => s.markNotificationsRead);
  const clearNotifications = useDiagnosisStore((s) => s.clearNotifications);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications" size={18} color={COLORS.brand} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Notifikasi Sistem</Text>
                <Text style={styles.headerSub}>
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          {notifications.length > 0 && (
            <View style={styles.actionBar}>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.actionBtn} onPress={markNotificationsRead}>
                  <Ionicons name="checkmark-done" size={14} color={COLORS.brand} />
                  <Text style={styles.actionBtnText}>Tandai Sudah Dibaca</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={clearNotifications}>
                <Ionicons name="trash-outline" size={14} color={COLORS.muted} />
                <Text style={[styles.actionBtnText, { color: COLORS.muted }]}>Bersihkan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notification List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="notifications-off-outline" size={36} color={COLORS.subtle} />
                </View>
                <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
                <Text style={styles.emptyDesc}>
                  Notifikasi otomatis akan muncul setelah Anda menyelesaikan diagnosis kesehatan ayam broiler.
                </Text>
              </View>
            ) : (
              notifications.map((item) => {
                const isUnread = item.is_read === 0;
                return (
                  <View
                    key={item.id}
                    style={[styles.notifCard, isUnread && styles.notifCardUnread]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, isUnread && styles.typeBadgeUnread]}>
                          <Ionicons
                            name={item.type === 'diagnosis' ? 'medkit' : 'information-circle'}
                            size={12}
                            color={isUnread ? COLORS.brand : COLORS.muted}
                          />
                          <Text style={[styles.typeText, isUnread && styles.typeTextUnread]}>
                            {item.type === 'diagnosis' ? 'Diagnosis' : 'Info'}
                          </Text>
                        </View>
                        {isUnread && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.timeText}>
                        {item.date} • {item.time}
                      </Text>
                    </View>

                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterBtnText}>Tutup Notifikasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  dismissArea: {
    flex: 1
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.8, 640),
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
    marginTop: 2
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand
  },
  scrollList: {
    flexShrink: 1
  },
  scrollContent: {
    padding: 16,
    gap: 10
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18
  },
  notifCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  notifCardUnread: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brandBorder
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  typeBadgeUnread: {
    backgroundColor: '#DBEAFE'
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted
  },
  typeTextUnread: {
    color: COLORS.brand
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.brand
  },
  timeText: {
    fontSize: 11,
    color: COLORS.muted
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.inkSecondary,
    lineHeight: 18
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  closeFooterBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeFooterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink
  }
});
