import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

const CAGE_PRESETS = ['Kandang 1', 'Kandang 2', 'Kandang 3', 'Kandang Karantina', 'Blok Postal'];
const AGE_PRESETS = [
  { label: 'DOC (3 hr)', days: 3, phase: 'DOC / Brooding' },
  { label: 'Starter (10 hr)', days: 10, phase: 'Starter' },
  { label: 'Grower (21 hr)', days: 21, phase: 'Grower' },
  { label: 'Finisher (32 hr)', days: 32, phase: 'Finisher' }
];
const POP_PRESETS = [1000, 3000, 5000, 10000];

export const DiagnosisInfoScreen: React.FC = () => {
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const flockInfo = useDiagnosisStore((s) => s.flockInfo);
  const setFlockInfo = useDiagnosisStore((s) => s.setFlockInfo);
  const user = useDiagnosisStore((s) => s.user);

  const [cageName, setCageName] = useState(flockInfo.cageName || 'Kandang 1');
  const [chickenAge, setChickenAge] = useState(
    flockInfo.chickenAge !== null && flockInfo.chickenAge !== undefined
      ? String(flockInfo.chickenAge)
      : '21'
  );
  const [populationCount, setPopulationCount] = useState(
    flockInfo.populationCount !== null && flockInfo.populationCount !== undefined
      ? String(flockInfo.populationCount)
      : '5000'
  );
  const [affectedCount, setAffectedCount] = useState(
    flockInfo.affectedCount !== null && flockInfo.affectedCount !== undefined
      ? String(flockInfo.affectedCount)
      : '25'
  );
  const [notes, setNotes] = useState(flockInfo.notes || '');

  const handleProceed = () => {
    const ageNum = parseInt(chickenAge, 10);
    const popNum = parseInt(populationCount, 10);
    const affNum = parseInt(affectedCount, 10);

    setFlockInfo({
      cageName: cageName.trim() || 'Kandang Utama',
      chickenAge: !isNaN(ageNum) && ageNum > 0 ? ageNum : null,
      populationCount: !isNaN(popNum) && popNum > 0 ? popNum : null,
      affectedCount: !isNaN(affNum) && affNum >= 0 ? affNum : null,
      notes: notes.trim()
    });

    setActiveScreen('diagnosis_symptoms');
  };

  const handleUseDefault = () => {
    setFlockInfo({
      cageName: 'Kandang Utama',
      chickenAge: 21,
      populationCount: 5000,
      affectedCount: 20,
      notes: ''
    });
    setActiveScreen('diagnosis_symptoms');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Wizard Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setActiveScreen('main')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.stepBadge}>LANGKAH 1 DARI 3</Text>
          <Text style={styles.headerTitle}>Identifikasi Flok</Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleUseDefault}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="flash-outline" size={19} color={COLORS.brand} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar 33% */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: '33.3%' }]} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Edukasi Domain Peternakan */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="home-outline" size={22} color={COLORS.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Identifikasi Populasi Broiler</Text>
            <Text style={styles.bannerDesc}>
              Ayam broiler dipelihara dalam kawanan flok. Identitas kandang dan umur ayam memastikan diagnosis akurat dan mudah dilacak saat penanganan wabah.
            </Text>
          </View>
        </View>

        {/* 1. Nama / Kode Kandang */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="business-outline" size={16} color={COLORS.brand} />
            <Text style={styles.inputLabel}>Nama / Nomor Kandang</Text>
            <Text style={styles.requiredTag}>Wajib</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={cageName}
            onChangeText={setCageName}
            placeholder="Contoh: Kandang 1, Sekat B, Blok Barat..."
            placeholderTextColor={COLORS.subtle}
          />
          <View style={styles.chipRow}>
            {CAGE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  cageName === preset && styles.presetChipActive
                ]}
                onPress={() => setCageName(preset)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    cageName === preset && styles.presetChipTextActive
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Umur Ayam (Hari) */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.brand} />
            <Text style={styles.inputLabel}>Umur Ayam Saat Ini (Hari)</Text>
            <Text style={styles.requiredTag}>Penting</Text>
          </View>
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={styles.flexInput}
              value={chickenAge}
              onChangeText={setChickenAge}
              placeholder="Contoh: 21"
              keyboardType="number-pad"
              placeholderTextColor={COLORS.subtle}
            />
            <Text style={styles.inputSuffix}>Hari</Text>
          </View>

          <View style={styles.chipRow}>
            {AGE_PRESETS.map((preset) => {
              const isActive = chickenAge === String(preset.days);
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => setChickenAge(String(preset.days))}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isActive && styles.presetChipTextActive
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperText}>
            💡 Umur ayam memvalidasi kerentanan penyakit: Pullorum (1-10 hr), Gumboro (21-35 hr), CRD (18-35 hr).
          </Text>
        </View>

        {/* 3. Estimasi Populasi & Bergejala (Grid 2 Kolom) */}
        <View style={styles.gridRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="people-outline" size={15} color={COLORS.muted} />
              <Text style={styles.inputLabelSmall}>Total Populasi</Text>
            </View>
            <View style={styles.inputWithSuffixSmall}>
              <TextInput
                style={styles.flexInput}
                value={populationCount}
                onChangeText={setPopulationCount}
                placeholder="5000"
                keyboardType="number-pad"
                placeholderTextColor={COLORS.subtle}
              />
              <Text style={styles.inputSuffixSmall}>ekor</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.warning} />
              <Text style={styles.inputLabelSmall}>Ayam Bergejala</Text>
            </View>
            <View style={styles.inputWithSuffixSmall}>
              <TextInput
                style={styles.flexInput}
                value={affectedCount}
                onChangeText={setAffectedCount}
                placeholder="25"
                keyboardType="number-pad"
                placeholderTextColor={COLORS.subtle}
              />
              <Text style={styles.inputSuffixSmall}>ekor</Text>
            </View>
          </View>
        </View>

        {/* Quick Pop Presets */}
        <View style={[styles.chipRow, { marginTop: -4, marginBottom: 16 }]}>
          <Text style={styles.presetLabel}>Preset Populasi:</Text>
          {POP_PRESETS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.presetChipCompact,
                populationCount === String(p) && styles.presetChipActive
              ]}
              onPress={() => setPopulationCount(String(p))}
            >
              <Text
                style={[
                  styles.presetChipTextCompact,
                  populationCount === String(p) && styles.presetChipTextActive
                ]}
              >
                {p.toLocaleString('id-ID')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Catatan Lapangan Tambahan */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.muted} />
            <Text style={styles.inputLabel}>Catatan Lapangan (Opsional)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Contoh: Sekam lembab karena hujan lebat semalam, ayam terdengar ngorok saat lampu redup..."
            placeholderTextColor={COLORS.subtle}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.defaultBtn}
          onPress={handleUseDefault}
          activeOpacity={0.7}
        >
          <Text style={styles.defaultBtnText}>Gunakan Default</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedBtnText}>Lanjut Pilih Gejala</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.surface
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    alignItems: 'center'
  },
  stepBadge: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.brand,
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.ink,
    marginTop: 1
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: COLORS.line,
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand
  },
  scrollArea: {
    flex: 1
  },
  scroll: {
    padding: 16
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 12,
    alignItems: 'flex-start'
  },
  bannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 3
  },
  bannerDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 17
  },
  inputGroup: {
    marginBottom: 18
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.ink
  },
  inputLabelSmall: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.ink
  },
  requiredTag: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.brand,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.ink
  },
  textArea: {
    height: 80,
    paddingTop: 10
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 14
  },
  inputWithSuffixSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 10
  },
  flexInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.ink
  },
  inputSuffix: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.muted,
    marginLeft: 8
  },
  inputSuffixSmall: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted,
    marginLeft: 4
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    alignItems: 'center'
  },
  presetLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.muted
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  presetChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.brand
  },
  presetChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted
  },
  presetChipTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  presetChipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  presetChipTextCompact: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.muted
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 7,
    lineHeight: 16
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'center'
  },
  defaultBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaultBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted
  },
  proceedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    paddingVertical: 13,
    borderRadius: 10
  },
  proceedBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF'
  }
});
