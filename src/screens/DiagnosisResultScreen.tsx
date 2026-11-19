import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { SYMPTOMS } from '../data/knowledgeBase';

export const DiagnosisResultScreen: React.FC = () => {
  const diagnosisResults = useDiagnosisStore((s) => s.diagnosisResults);
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const setActiveTab = useDiagnosisStore((s) => s.setActiveTab);
  const openDiseaseDetail = useDiagnosisStore((s) => s.openDiseaseDetail);

  const [isCalcExpanded, setIsCalcExpanded] = useState(false);

  if (!diagnosisResults || diagnosisResults.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.warning} />
          <Text style={styles.emptyTitle}>Bukti Gejala Belum Cukup</Text>
          <Text style={styles.emptyDesc}>
            Kombinasi gejala yang dipilih belum mencukupi untuk mendeteksi patologi broiler tertentu secara signifikan.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setActiveScreen('diagnosis_symptoms')}
          >
            <Text style={styles.primaryBtnText}>Ulangi Pilih Gejala</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const primary = diagnosisResults[0];
  const differentials = diagnosisResults.slice(1, 4).filter((r) => r.cfScore > 0.05);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hasil Diagnosis OhMyChick: Kawanan terindikasi ${primary.disease.name} dengan kepastian ${primary.percentage}% (Metode Certainty Factor Shortliffe).`
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            setActiveTab('beranda');
            setActiveScreen('main');
          }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HASIL DIAGNOSIS OHMYCHICK</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Primary Match Card */}
        <View style={styles.primaryCard}>
          <View style={styles.primaryTop}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.matchBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.brand} />
                <Text style={styles.matchBadgeText}>Indikasi Utama</Text>
              </View>
              <Text style={styles.diseaseName}>{primary.disease.name}</Text>
              <Text style={styles.diseaseLatin}>{primary.disease.latinName}</Text>
            </View>
            <View style={styles.pctWrap}>
              <Text style={styles.pctText}>{primary.percentage}%</Text>
              <Text style={styles.pctSub}>Certainty Factor</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${primary.percentage}%` }]} />
          </View>

          <View style={styles.primaryFooter}>
            <View style={styles.footerRule}>
              <Ionicons name="hardware-chip-outline" size={14} color={COLORS.brand} />
              <Text style={styles.footerRuleText}>Shortliffe Deterministic Rule</Text>
            </View>
            <Text style={styles.footerCount}>{primary.matchedRules.length} gejala cocok</Text>
          </View>
        </View>

        {/* Calculation Accordion */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accordionHeader}
            activeOpacity={0.7}
            onPress={() => setIsCalcExpanded(!isCalcExpanded)}
          >
            <View style={styles.accordionTitleRow}>
              <Ionicons name="calculator-outline" size={18} color={COLORS.brand} />
              <Text style={styles.cardTitle}>Rincian Hitungan</Text>
            </View>
            <Ionicons
              name={isCalcExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.muted}
            />
          </TouchableOpacity>

          {isCalcExpanded && (
            <View style={styles.accordionBody}>
              <Text style={styles.formulaDesc}>
                Formula: CF[H, E] = CF[pakar] × CF[user]. Kombinasi dihitung berantai menggunakan aturan Shortliffe & Buchanan (1975).
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>Gejala Terobservasi</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Pakar</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>User</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>CF[H,E]</Text>
              </View>
              {primary.matchedRules.map((rule, idx) => {
                const sObj = SYMPTOMS.find((s) => s.id === rule.symptomId);
                return (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={2}>
                      {sObj ? `${sObj.code} - ${sObj.name}` : rule.symptomId}
                    </Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{rule.cfExpert}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{rule.cfUser}</Text>
                    <Text style={[styles.tdBold, { flex: 1, textAlign: 'right' }]}>
                      {rule.cfCalculated.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Recommendations Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderWithIcon}>
            <Ionicons name="medkit-outline" size={18} color={COLORS.brand} />
            <Text style={styles.cardTitle}>Penanganan Medis</Text>
          </View>
          <Text style={styles.sectionBodyText}>{primary.disease.treatment}</Text>

          <View style={[styles.cardHeaderWithIcon, { marginTop: 14 }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
            <Text style={styles.cardTitle}>Pencegahan Biosekuriti</Text>
          </View>
          <Text style={styles.sectionBodyText}>{primary.disease.prevention}</Text>
        </View>

        {/* Differentials */}
        {differentials.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diagnosa Banding</Text>
            <View style={styles.diffList}>
              {differentials.map((diff, i) => (
                <View key={i} style={styles.diffRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.diffName}>{diff.disease.name}</Text>
                    <Text style={styles.diffLatin}>{diff.disease.latinName}</Text>
                  </View>
                  <View style={styles.diffPctBadge}>
                    <Text style={styles.diffPctText}>{diff.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => openDiseaseDetail(primary.disease)}
          >
            <Ionicons name="information-circle-outline" size={16} color={COLORS.brand} />
            <Text style={styles.detailBtnText}>Buka Detail Penyakit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              setActiveTab('beranda');
              setActiveScreen('main');
            }}
          >
            <Text style={styles.finishBtnText}>Selesai & Ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    letterSpacing: 0.5
  },
  scroll: {
    padding: 16,
    gap: 14,
    paddingBottom: 32
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginTop: 12,
    marginBottom: 6
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  primaryBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  },
  primaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  primaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  matchBadgeText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand,
    letterSpacing: 0.5
  },
  diseaseName: {
    fontSize: 17,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink
  },
  diseaseLatin: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    color: COLORS.muted,
    marginTop: 1
  },
  pctWrap: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  pctText: {
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    color: COLORS.brand
  },
  pctSub: {
    fontSize: 9.5,
    fontFamily: FONTS.medium,
    color: COLORS.brandDark
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand,
    borderRadius: 4
  },
  primaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lineSubtle,
    paddingTop: 10
  },
  footerRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  footerRuleText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  footerCount: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  sectionBodyText: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: COLORS.inkSecondary,
    lineHeight: 18
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  accordionBody: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lineSubtle,
    paddingTop: 10
  },
  formulaDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    lineHeight: 16,
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4
  },
  th: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineSubtle
  },
  td: {
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    color: COLORS.inkSecondary
  },
  tdBold: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  diffList: {
    marginTop: 8,
    gap: 8
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineSubtle
  },
  diffName: {
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  diffLatin: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    fontStyle: 'italic',
    color: COLORS.muted
  },
  diffPctBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  diffPctText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.brandLight,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    paddingVertical: 12,
    borderRadius: 12
  },
  detailBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  finishBtn: {
    flex: 1,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  finishBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
