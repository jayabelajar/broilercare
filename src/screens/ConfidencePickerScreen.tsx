import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { SYMPTOMS, CF_USER_SCALES } from '../data/knowledgeBase';

export const ConfidencePickerScreen: React.FC = () => {
  const selectedSymptoms = useDiagnosisStore((s) => s.selectedSymptoms);
  const confidenceValues = useDiagnosisStore((s) => s.confidenceValues);
  const setSymptomConfidence = useDiagnosisStore((s) => s.setSymptomConfidence);
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const calculateResult = useDiagnosisStore((s) => s.calculateResult);

  const selectedSymptomData = selectedSymptoms
    .map((id) => SYMPTOMS.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      {/* Top Wizard Bar - Fully Responsive */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => setActiveScreen('diagnosis_symptoms')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.stepBadge}>LANGKAH 3 DARI 3</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Skala Keyakinan
          </Text>
        </View>

        <View style={styles.headerBtnPlaceholder} />
      </View>

      {/* Progress Bar 100% */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: '100%' }]} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headline}>
          <Text style={styles.headlineTitle}>Tentukan Derajat Kepastian Anda</Text>
          <Text style={styles.headlineDesc}>
            Pilih seberapa yakin Anda melihat gejala-gejala ini pada kawanan ayam. Skor CF Pakar akan dikombinasikan dengan derajat keyakinan Anda.
          </Text>
        </View>

        <View style={styles.list}>
          {selectedSymptomData.map((symptom) => {
            if (!symptom) return null;
            const currentVal = confidenceValues[symptom.id] ?? 0.8;

            return (
              <View key={symptom.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.categoryLabel}>{symptom.category}</Text>
                    <Text style={styles.symptomTitle}>{symptom.name}</Text>
                  </View>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{symptom.code}</Text>
                  </View>
                </View>

                {/* 4-tier CF selector */}
                <View style={styles.scaleGrid}>
                  {CF_USER_SCALES.map((scale) => {
                    const isSelected = currentVal === scale.value;
                    return (
                      <TouchableOpacity
                        key={scale.value}
                        style={[styles.scaleBtn, isSelected && styles.scaleBtnActive]}
                        activeOpacity={0.8}
                        onPress={() => setSymptomConfidence(symptom.id, scale.value)}
                      >
                        <Text style={[styles.scaleLabel, isSelected && styles.scaleLabelActive]}>
                          {scale.label}
                        </Text>
                        <Text style={[styles.scaleValue, isSelected && styles.scaleValueActive]}>
                          CF {scale.value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Responsive Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.modifyBtn}
          onPress={() => setActiveScreen('diagnosis_symptoms')}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.muted} />
          <Text style={styles.modifyBtnText}>Ubah Gejala</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calcBtn}
          activeOpacity={0.85}
          onPress={() => calculateResult()}
        >
          <Text style={styles.calcBtnText}>Hitung Diagnosis CF</Text>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
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
    flex: 1,
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
  headerBtnPlaceholder: {
    width: 36
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14
  },
  headline: {
    marginBottom: 4
  },
  headlineTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 4
  },
  headlineDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    lineHeight: 18
  },
  list: {
    gap: 12
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 10
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.brand,
    marginBottom: 2
  },
  symptomTitle: {
    fontSize: 13.5,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    lineHeight: 19
  },
  codeBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  codeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary
  },
  scaleGrid: {
    flexDirection: 'row',
    gap: 6
  },
  scaleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scaleBtnActive: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brand
  },
  scaleLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    textAlign: 'center'
  },
  scaleLabelActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  scaleValue: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: COLORS.inkSecondary,
    marginTop: 2
  },
  scaleValueActive: {
    color: COLORS.brand
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    gap: 12
  },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle
  },
  modifyBtnText: {
    fontSize: 12.5,
    fontFamily: FONTS.semiBold,
    color: COLORS.inkSecondary
  },
  calcBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  calcBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
