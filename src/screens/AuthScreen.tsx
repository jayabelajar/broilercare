import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { ConfirmModal } from '../components/ConfirmModal';

// 4 Avatar Utama
const AVATAR_OPTIONS = ['👨‍🌾', '👩‍🌾', '🩺', '🐥'];

export const AuthScreen: React.FC = () => {
  const login = useDiagnosisStore((s) => s.login);
  const register = useDiagnosisStore((s) => s.register);
  const guestLogin = useDiagnosisStore((s) => s.guestLogin);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🌾');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Styled Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBg?: string;
  }>({
    visible: false,
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string, icon: keyof typeof Ionicons.glyphMap = 'alert-circle', iconColor = COLORS.danger, iconBg = '#FEE2E2') => {
    setAlertConfig({ visible: true, title, message, icon, iconColor, iconBg });
  };

  const handleSubmit = async () => {
    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        showAlert('Formulir Belum Lengkap', 'Mohon isi email dan kata sandi Anda terlebih dahulu.');
        return;
      }
      setLoading(true);
      const res = await login(email.trim(), password.trim());
      setLoading(false);
      if (!res.success) {
        showAlert('Gagal Masuk', res.message || 'Email atau kata sandi tidak cocok.');
      }
    } else {
      if (!name.trim() || !farmName.trim() || !email.trim() || !password.trim()) {
        showAlert('Formulir Belum Lengkap', 'Mohon lengkapi seluruh kolom pendaftaran.');
        return;
      }
      setLoading(true);
      const res = await register(
        name.trim(),
        farmName.trim(),
        email.trim(),
        password.trim(),
        selectedAvatar
      );
      setLoading(false);
      if (!res.success) {
        showAlert('Gagal Mendaftar', res.message || 'Terjadi kesalahan saat pendaftaran.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compact 1-line responsive Header (Icon + Teks + Deskripsi Ringkas) */}
        <View style={styles.headerCompact}>
          <View style={styles.logoBadgeCompact}>
            <Ionicons name="medkit" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfoCompact}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.appNameCompact}>BroilerCare</Text>
              <View style={styles.expertBadge}>
                <Text style={styles.expertBadgeText}>Sistem Pakar</Text>
              </View>
            </View>
            <Text style={styles.appTaglineCompact} numberOfLines={1}>
              Diagnosis Cerdas & Deteksi Dini Broiler
            </Text>
          </View>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Masuk Akun
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
              Daftar Baru
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Selamat Datang' : 'Registrasi Peternakan'}
          </Text>
          <Text style={styles.formSubtitle} numberOfLines={1}>
            {mode === 'login'
              ? 'Kelola riwayat diagnosis secara offline & aman.'
              : 'Daftarkan peternakan untuk arsip diagnosis lokal.'}
          </Text>

          {mode === 'register' && (
            <>
              {/* Avatar Selector (4 choices) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pilih Avatar</Text>
                <View style={styles.avatarRow}>
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = selectedAvatar === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.avatarPickBtn, isSelected && styles.avatarPickBtnActive]}
                        onPress={() => setSelectedAvatar(item)}
                      >
                        <Text style={styles.avatarEmoji}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Peternak</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={17} color={COLORS.muted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Budi Santoso"
                    placeholderTextColor={COLORS.subtle}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Peternakan</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="home-outline" size={17} color={COLORS.muted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Berkah Broiler Farm"
                    placeholderTextColor={COLORS.subtle}
                    value={farmName}
                    onChangeText={setFarmName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={17} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="peternak@broilercare.id"
                placeholderTextColor={COLORS.subtle}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={COLORS.subtle}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Masuk ke Aplikasi' : 'Daftar Sekarang'}
                </Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Hint */}
          <View style={styles.hintWrap}>
            <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.brand} />
            <Text style={styles.hintText}>
              Penyimpanan lokal SQLite 100% aman di perangkat ini.
            </Text>
          </View>
        </View>

        {/* Guest Access Alternative */}
        <View style={styles.guestSection}>
          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={guestLogin}
          >
            <Ionicons name="flash-outline" size={15} color={COLORS.muted} />
            <Text style={styles.guestText}>Mode Tamu (Uji Coba Langsung)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reusable UI Alert Modal */}
      <ConfirmModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon || 'alert-circle'}
        iconColor={alertConfig.iconColor || COLORS.danger}
        iconBg={alertConfig.iconBg || '#FEE2E2'}
        confirmText="Tutup"
        cancelText="OK"
        isDestructive={false}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    paddingBottom: 36
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  logoBadgeCompact: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  headerInfoCompact: {
    flex: 1
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  appNameCompact: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink,
    letterSpacing: -0.4
  },
  expertBadge: {
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5
  },
  expertBadgeText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  appTaglineCompact: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    marginTop: 1
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 3.5,
    marginBottom: 14
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  tabTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  formTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 3
  },
  formSubtitle: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    marginBottom: 14
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 11.5,
    fontFamily: FONTS.semiBold,
    color: COLORS.inkSecondary,
    marginBottom: 5
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 4
  },
  avatarPickBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.canvas,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPickBtnActive: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brandLight
  },
  avatarEmoji: {
    fontSize: 20
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitText: {
    fontSize: 13.5,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  },
  hintWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12
  },
  hintText: {
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center'
  },
  guestSection: {
    alignItems: 'center',
    marginTop: 14
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  guestText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.muted
  }
});
