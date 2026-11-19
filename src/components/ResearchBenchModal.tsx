import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { RESEARCH_SAMPLES, SYMPTOMS } from '../data/knowledgeBase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ResearchBenchModal: React.FC = () => {
  const isOpen = useDiagnosisStore((s) => s.isTestBenchOpen);
  const closeTestBench = useDiagnosisStore((s) => s.closeTestBench);
  const runTestSample = useDiagnosisStore((s) => s.runTestSample);

  if (!isOpen) return null;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={closeTestBench}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={closeTestBench}
        />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.titleRow}>
                <Ionicons name="flask" size={18} color={COLORS.brand} />
                <Text style={styles.title}>Validasi 10 Sampel Jurnal</Text>
              </View>
              <Text style={styles.subtitle}>
                Tabel 6: Uji akurasi Certainty Factor terhadap kasus historis
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeTestBench}>
              <Ionicons name="close" size={20} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          {/* List of 10 samples */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {RESEARCH_SAMPLES.map((sample) => {
              const isMismatch = sample.match.includes('Diskrepansi');
              const symptomNames = sample.symptoms.map((sId) => {
                const s = SYMPTOMS.find((x) => x.id === sId);
                return s ? s.name : sId;
              });

              return (
                <View key={sample.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.sampleBadge}>
                      <Text style={styles.sampleBadgeText}>Sampel #{sample.id}</Text>
                    </View>
                    <View
                      style={[
                        styles.matchBadge,
                        isMismatch ? styles.matchMismatch : styles.matchOk
                      ]}
                    >
                      <Text
                        style={[
                          styles.matchText,
                          isMismatch ? styles.matchTextMismatch : styles.matchTextOk
                        ]}
                      >
                        {sample.match}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.targetText}>
                    Target Jurnal: <Text style={styles.bold}>{sample.expectedDisease}</Text> ({sample.expectedCF})
                  </Text>

                  <Text style={styles.symptomsText} numberOfLines={2}>
                    Gejala: {symptomNames.join(', ')}
                  </Text>

                  <TouchableOpacity
                    style={styles.runBtn}
                    activeOpacity={0.8}
                    onPress={() => runTestSample(sample.id)}
                  >
                    <Ionicons name="play" size={13} color="#FFFFFF" />
                    <Text style={styles.runBtnText}>Uji Kasus Ini di Mesin CF</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={closeTestBench}>
              <Text style={styles.closeFooterBtnText}>Tutup Panel Pengujian</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end'
  },
  dismissArea: {
    flex: 1
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.85, 680),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  subtitle: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bodyScroll: {
    flexShrink: 1
  },
  body: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: COLORS.canvas,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sampleBadge: {
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  sampleBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  matchOk: {
    backgroundColor: '#DCFCE7'
  },
  matchMismatch: {
    backgroundColor: '#FEF3C7'
  },
  matchText: {
    fontSize: 10,
    fontFamily: FONTS.bold
  },
  matchTextOk: {
    color: '#15803D'
  },
  matchTextMismatch: {
    color: '#D97706'
  },
  targetText: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  bold: {
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  symptomsText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    lineHeight: 16
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.brand,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 4
  },
  runBtnText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  closeFooterBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeFooterBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  }
});
