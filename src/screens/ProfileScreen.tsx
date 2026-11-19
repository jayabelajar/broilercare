import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { Header } from '../components/Header';
import { ConfirmModal } from '../components/ConfirmModal';
import { DISEASES, SYMPTOMS } from '../data/knowledgeBase';

const AVATARS = ['👨‍🌾', '👩‍🌾', '🩺', '🐥', '🐔', '🔬', '🏠', '🥼', '🐣', '🌾', '🥚', '🧑‍🔬'];

export const ProfileScreen: React.FC = () => {
  const user = useDiagnosisStore((s) => s.user);
  const history = useDiagnosisStore((s) => s.history);
  const logout = useDiagnosisStore((s) => s.logout);
  const resetAll = useDiagnosisStore((s) => s.resetAll);
  const updateProfile = useDiagnosisStore((s) => s.updateProfile);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editFarmName, setEditFarmName] = useState(user?.farmName || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '👨‍🌾');
  const [isSaving, setIsSaving] = useState(false);

  // Custom UI Action Modals
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditFarmName(user?.farmName || '');
    setEditAvatar(user?.avatar || '👨‍🌾');
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editFarmName.trim()) {
      setErrorMessage('Nama peternak dan nama peternakan wajib diisi.');
      return;
    }
    setIsSaving(true);
    const success = await updateProfile(editName.trim(), editFarmName.trim(), editAvatar);
    setIsSaving(false);
    if (success) {
      setIsEditModalOpen(false);
    } else {
      setErrorMessage('Gagal menyimpan profil ke database lokal.');
    }
  };

  const handleOpenDOI = () => {
    Linking.openURL('https://doi.org/10.33364/algoritma/v.21-2.1526');
  };

  return (
    <View style={styles.container}>
      <Header title="Profil Peternak" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{user?.avatar || '👨‍🌾'}</Text>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Peternak Broiler'}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.brand} />
                <Text style={styles.verifiedText}>Terdaftar</Text>
              </View>
            </View>

            <Text style={styles.farmName} numberOfLines={1}>
              🏠 {user?.farmName || 'Peternakan Broiler Mandiri'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              ✉️ {user?.email || 'peternak@ohmychick.id'}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={openEditModal}
          >
            <Ionicons name="pencil" size={14} color={COLORS.brand} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>Diagnosis Selesai</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>SQLite</Text>
            <Text style={styles.statLabel}>Database Lokal</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.statNumber, { color: COLORS.brand }]}>v1.0</Text>
            <Text style={styles.statLabel}>Mesin CF</Text>
          </View>
        </View>

        {/* System Specs Bento */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spesifikasi Mesin</Text>
        </View>

        <View style={styles.specsCard}>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Nama Sistem:</Text>
            <Text style={styles.specValue}>OhMyChick Expert System</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Algoritma:</Text>
            <Text style={styles.specValue}>Certainty Factor (Shortliffe & Buchanan)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Basis Patologi:</Text>
            <Text style={styles.specValue}>{DISEASES.length} Penyakit Broiler Terdata</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Indikator Gejala:</Text>
            <Text style={styles.specValue}>{SYMPTOMS.length} Gejala Klinis Terkategori</Text>
          </View>
          <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.specLabel}>Arsitektur:</Text>
            <Text style={styles.specValue}>100% Offline-First SQLite Storage</Text>
          </View>
        </View>

        {/* Academic Reference */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Landasan Ilmiah</Text>
        </View>

        <TouchableOpacity
          style={styles.academicCard}
          activeOpacity={0.8}
          onPress={handleOpenDOI}
        >
          <View style={styles.academicHeader}>
            <View style={styles.academicBadge}>
              <Ionicons name="school-outline" size={12} color={COLORS.brand} />
              <Text style={styles.academicBadgeText}>Jurnal Algoritma (2024)</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.brand} />
          </View>
          <Text style={styles.academicTitle}>
            Implementasi Metode Certainty Faktor Pada Sistem Diagnosa Penyakit Ayam Pedaging (Broiler)
          </Text>
          <Text style={styles.academicAuthors}>
            Yoga Handoko Agustin, Asri Mulyani, Pendi Sopandi — DOI: 10.33364/algoritma/v.21-2.1526
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.outlineActionBtn}
            activeOpacity={0.7}
            onPress={() => setIsLogoutModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={17} color={COLORS.muted} />
            <Text style={styles.outlineActionText}>Keluar dari Akun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerActionBtn}
            activeOpacity={0.7}
            onPress={() => setIsResetModalVisible(true)}
          >
            <Ionicons name="refresh-outline" size={17} color={COLORS.danger} />
            <Text style={styles.dangerActionText}>Reset Aplikasi & Database</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Profil Peternak</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={20} color={COLORS.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Choose 12 Avatars */}
              <Text style={styles.modalLabel}>Pilih Avatar Karakter (12 Pilihan)</Text>
              <View style={styles.avatarPickRow}>
                {AVATARS.map((av) => {
                  const isSelected = editAvatar === av;
                  return (
                    <TouchableOpacity
                      key={av}
                      style={[styles.avatarPickCircle, isSelected && styles.avatarPickCircleActive]}
                      onPress={() => setEditAvatar(av)}
                    >
                      <Text style={styles.avatarPickEmoji}>{av}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Nama Lengkap Peternak</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={(t) => { setEditName(t); setErrorMessage(null); }}
                  placeholder="Nama Peternak"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>

              {/* Farm Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Nama Usaha / Peternakan</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editFarmName}
                  onChangeText={(t) => { setEditFarmName(t); setErrorMessage(null); }}
                  placeholder="Nama Peternakan"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>

              {errorMessage && (
                <Text style={styles.modalErrorText}>{errorMessage}</Text>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                disabled={isSaving}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Styled Logout Confirm Modal */}
      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Keluar dari Akun"
        message="Anda akan keluar dari sesi ini. Data diagnosis tetap tersimpan di database lokal."
        icon="log-out-outline"
        iconColor={COLORS.brand}
        iconBg={COLORS.brandLight}
        confirmText="Keluar"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
      />

      {/* Styled Reset Confirm Modal */}
      <ConfirmModal
        visible={isResetModalVisible}
        title="Reset Sistem Aplikasi"
        message="Seluruh catatan diagnosis lokal, preferensi akun, dan sesi akan direset ke kondisi awal."
        icon="refresh"
        iconColor={COLORS.danger}
        iconBg="#FEE2E2"
        confirmText="Reset Sekarang"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={() => {
          setIsResetModalVisible(false);
          resetAll();
        }}
        onCancel={() => setIsResetModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.brandBorder
  },
  avatarEmoji: {
    fontSize: 28
  },
  userInfo: {
    flex: 1
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  userName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5
  },
  verifiedText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  farmName: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.inkSecondary,
    marginBottom: 2
  },
  userEmail: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1
  },
  statNumber: {
    fontSize: 16,
    fontFamily: FONTS.extraBold,
    color: COLORS.brand
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    marginTop: 2
  },
  sectionHeader: {
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  specsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineSubtle
  },
  specLabel: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  specValue: {
    fontSize: 11.5,
    fontFamily: FONTS.semiBold,
    color: COLORS.ink,
    maxWidth: '60%',
    textAlign: 'right'
  },
  academicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  academicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  academicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  academicBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  academicTitle: {
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    lineHeight: 18
  },
  academicAuthors: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    lineHeight: 15
  },
  actionSection: {
    gap: 8,
    marginTop: 8
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  outlineActionText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary
  },
  dangerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  dangerActionText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.danger
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    gap: 14
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  modalBody: {
    gap: 12,
    paddingBottom: 20
  },
  modalLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary,
    marginBottom: 4
  },
  avatarPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  avatarPickCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.canvas,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPickCircleActive: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brandLight
  },
  avatarPickEmoji: {
    fontSize: 22
  },
  inputGroup: {
    gap: 4
  },
  modalInput: {
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  modalErrorText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.danger
  },
  saveBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
