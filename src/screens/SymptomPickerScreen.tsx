import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { SYMPTOMS } from '../data/knowledgeBase';
import { Symptom } from '../core/certainty-factor/types';

const CATEGORIES = [
  'SEMUA',
  'Pernapasan',
  'Pencernaan',
  'Saraf & Perilaku',
  'Kepala & Fasial',
  'Fisik & Performa'
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Pernapasan': 'fitness-outline',
  'Pencernaan': 'water-outline',
  'Saraf & Perilaku': 'pulse-outline',
  'Kepala & Fasial': 'eye-outline',
  'Fisik & Performa': 'body-outline'
};

export const SymptomPickerScreen: React.FC = () => {
  const selectedSymptoms = useDiagnosisStore((s) => s.selectedSymptoms);
  const toggleSymptom = useDiagnosisStore((s) => s.toggleSymptom);
  const clearSymptoms = useDiagnosisStore((s) => s.clearSymptoms);
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const selectedCategory = useDiagnosisStore((s) => s.selectedCategory);
  const setSelectedCategory = useDiagnosisStore((s) => s.setSelectedCategory);
  const flockInfo = useDiagnosisStore((s) => s.flockInfo);

  const [searchQuery, setSearchQuery] = useState('');

  // Grouped symptoms by category
  const groupedSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const categoriesToInclude =
      selectedCategory === 'SEMUA'
        ? ['Pernapasan', 'Pencernaan', 'Saraf & Perilaku', 'Kepala & Fasial', 'Fisik & Performa']
        : [selectedCategory];

    return categoriesToInclude
      .map((cat) => {
        let items = SYMPTOMS.filter((s) => s.category === cat);
        if (q) {
          items = items.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              s.code.toLowerCase().includes(q)
          );
        }
        return {
          category: cat,
          icon: CATEGORY_ICONS[cat] || 'medical-outline',
          items
        };
      })
      .filter((section) => section.items.length > 0);
  }, [selectedCategory, searchQuery]);

  const canProceed = selectedSymptoms.length >= 2;

  return (
    <View style={styles.container}>
      {/* Top Wizard Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setActiveScreen('diagnosis_info')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.stepBadge}>LANGKAH 2 DARI 3</Text>
          <Text style={styles.headerTitle}>Pilih Gejala</Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={clearSymptoms}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh" size={19} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar 66% */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: '66.6%' }]} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Flock Identity Summary Card */}
        <TouchableOpacity
          style={styles.flockSummaryCard}
          activeOpacity={0.8}
          onPress={() => setActiveScreen('diagnosis_info')}
        >
          <View style={styles.flockSummaryLeft}>
            <View style={styles.flockIconBox}>
              <Ionicons name="home" size={15} color={COLORS.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.flockSummaryTitle}>
                {flockInfo.cageName || 'Kandang Utama'}
              </Text>
              <Text style={styles.flockSummarySubtitle}>
                {flockInfo.chickenAge ? `Umur ${flockInfo.chickenAge} Hari` : 'Umur -'} • {flockInfo.populationCount ? `Populasi ${flockInfo.populationCount.toLocaleString('id-ID')} ekor` : 'Flok Broiler'}
              </Text>
            </View>
          </View>
          <View style={styles.flockEditBtn}>
            <Text style={styles.flockEditBtnText}>Ubah</Text>
            <Ionicons name="create-outline" size={13} color={COLORS.brand} />
          </View>
        </TouchableOpacity>

        {/* Title & Instruction */}
        <View style={styles.headline}>
          <Text style={styles.headlineTitle}>Amati kondisi ayam di kandang</Text>
          <Text style={styles.headlineDesc}>
            Centang minimal 2 gejala fisik atau perilaku yang ditemukan pada kawanan broiler Anda.
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari gejala (contoh: ngorok, feses, napas)..."
            placeholderTextColor={COLORS.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Count Banner */}
        <View style={styles.selectionBanner}>
          <View style={styles.selectionLeft}>
            <View style={styles.checkCountCircle}>
              <Text style={styles.checkCountText}>{selectedSymptoms.length}</Text>
            </View>
            <Text style={styles.selectionText}>
              {selectedSymptoms.length >= 2
                ? `${selectedSymptoms.length} Gejala dipilih (Syarat terpenuhi)`
                : `${selectedSymptoms.length} Gejala dipilih (Pilih minimal 2)`}
            </Text>
          </View>
          {canProceed && (
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          )}
        </View>

        {/* Grouped Symptom Sections */}
        {groupedSections.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="alert-circle-outline" size={36} color={COLORS.subtle} />
            <Text style={styles.emptyTitle}>Gejala Tidak Ditemukan</Text>
            <Text style={styles.emptyDesc}>
              Silakan cek kembali kata kunci atau pilih kategori gejala lainnya.
            </Text>
          </View>
        ) : (
          groupedSections.map((sec) => {
            const selectedInSec = sec.items.filter((item) =>
              selectedSymptoms.includes(item.id)
            ).length;

            return (
              <View key={sec.category} style={styles.sectionCard}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name={sec.icon} size={15} color={COLORS.brand} />
                    </View>
                    <Text style={styles.sectionCategoryTitle}>Gejala {sec.category}</Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {selectedInSec > 0 ? `${selectedInSec} dipilih / ` : ''}
                      {sec.items.length} Gejala
                    </Text>
                  </View>
                </View>

                {/* Items in Category */}
                <View style={styles.sectionItemsList}>
                  {sec.items.map((symptom: Symptom) => {
                    const isChecked = selectedSymptoms.includes(symptom.id);

                    return (
                      <TouchableOpacity
                        key={symptom.id}
                        style={[styles.symptomItem, isChecked && styles.symptomItemChecked]}
                        activeOpacity={0.7}
                        onPress={() => toggleSymptom(symptom.id)}
                      >
                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                          {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                        </View>

                        <View style={styles.symptomInfo}>
                          <View style={styles.codeRow}>
                            <View style={styles.codePill}>
                              <Text style={styles.codePillText}>{symptom.code}</Text>
                            </View>
                            {isChecked && (
                              <View style={styles.selectedPill}>
                                <Text style={styles.selectedPillText}>Dipilih</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.symptomName}>{symptom.name}</Text>
                          {symptom.description ? (
                            <Text style={styles.symptomDesc} numberOfLines={2}>
                              {symptom.description}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomSelectedCount}>
            {selectedSymptoms.length} Gejala Terpilih
          </Text>
          <Text style={styles.bottomHint}>
            {canProceed ? 'Siap ke penentuan skala' : 'Pilih minimal 2 gejala'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, !canProceed && styles.proceedBtnDisabled]}
          disabled={!canProceed}
          activeOpacity={0.85}
          onPress={() => setActiveScreen('diagnosis_confidence')}
        >
          <Text style={styles.proceedBtnText}>Lanjutkan</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand,
    letterSpacing: 0.5
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 12
  },
  flockSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 4
  },
  flockSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  flockIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flockSummaryTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#312E81'
  },
  flockSummarySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 1
  },
  flockEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF'
  },
  flockEditBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.brand
  },
  headline: {
    marginBottom: 4
  },
  headlineTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 3
  },
  headlineDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    lineHeight: 18
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  categoryPillActive: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brandBorder
  },
  categoryPillText: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  categoryPillTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  selectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.brandLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkCountCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkCountText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  },
  selectionText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionCategoryTitle: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  sectionBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  sectionBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  sectionItemsList: {
    padding: 10,
    gap: 8
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },
  symptomItemChecked: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brandBorder
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand
  },
  symptomInfo: {
    flex: 1
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  codePill: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5
  },
  codePillText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary
  },
  selectedPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5
  },
  selectedPillText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  symptomName: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    lineHeight: 18
  },
  symptomDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 16
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginTop: 8
  },
  emptyDesc: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 2
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  bottomInfo: {
    flex: 1
  },
  bottomSelectedCount: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  bottomHint: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brand,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  proceedBtnDisabled: {
    backgroundColor: COLORS.subtle,
    shadowOpacity: 0,
    elevation: 0
  },
  proceedBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
