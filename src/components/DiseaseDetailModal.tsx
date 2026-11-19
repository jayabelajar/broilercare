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
import { DIAGNOSTIC_RULES, SYMPTOMS } from '../data/knowledgeBase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DiseaseDetailModal: React.FC = () => {
  const selectedDisease = useDiagnosisStore((s) => s.selectedDiseaseDetail);
  const closeDiseaseDetail = useDiagnosisStore((s) => s.closeDiseaseDetail);

  if (!selectedDisease) return null;

  const rules = DIAGNOSTIC_RULES.filter((r) => r.diseaseId === selectedDisease.id);
  const isHighRisk = selectedDisease.riskLevel === 'KRITIS' || selectedDisease.riskLevel === 'TINGGI';

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={closeDiseaseDetail}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={closeDiseaseDetail}
        />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.badgeRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{selectedDisease.code}</Text>
                </View>
                <View
                  style={[
                    styles.riskBadge,
                    isHighRisk ? styles.riskHigh : styles.riskMedium
                  ]}
                >
                  <Text
                    style={[
                      styles.riskText,
                      isHighRisk ? styles.riskTextHigh : styles.riskTextMedium
                    ]}
                  >
                    Risiko: {selectedDisease.riskLevel}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{selectedDisease.name}</Text>
              <Text style={styles.latin}>{selectedDisease.latinName}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeDiseaseDetail}>
              <Ionicons name="close" size={20} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          {/* Responsive Scrollable Content */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Description & Pathogen */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.brand} />
                <Text style={styles.sectionTitle}>Deskripsi Patogen</Text>
              </View>
              <Text style={styles.sectionText}>{selectedDisease.description}</Text>
              <View style={styles.causeBox}>
                <Text style={styles.causeLabel}>Penyebab Utama:</Text>
                <Text style={styles.causeText}>{selectedDisease.causes}</Text>
              </View>
            </View>

            {/* Characteristic Symptoms */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="list-outline" size={16} color={COLORS.brand} />
                <Text style={styles.sectionTitle}>Gejala Utama</Text>
              </View>
              <View style={styles.symptomList}>
                {rules.map((rule) => {
                  const s = SYMPTOMS.find((x) => x.id === rule.symptomId);
                  return (
                    <View key={rule.id} style={styles.symptomRow}>
                      <Text style={styles.symptomName}>• {s ? s.name : rule.symptomId}</Text>
                      <View style={styles.cfBadge}>
                        <Text style={styles.cfBadgeText}>CF Pakar: {rule.cfExpert}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Prevention */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shield-outline" size={16} color={COLORS.success} />
                <Text style={styles.sectionTitle}>Biosekuriti Kandang</Text>
              </View>
              <Text style={styles.sectionText}>{selectedDisease.prevention}</Text>
            </View>

            {/* Treatment */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="medkit-outline" size={16} color={COLORS.brand} />
                <Text style={styles.sectionTitle}>Penanganan Medis</Text>
              </View>
              <Text style={styles.sectionText}>{selectedDisease.treatment}</Text>
            </View>
          </ScrollView>

          {/* Footer Always Visible */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmBtn} onPress={closeDiseaseDetail}>
              <Text style={styles.confirmBtnText}>Tutup Informasi</Text>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  codeBadge: {
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  codeText: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  riskBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  riskHigh: {
    backgroundColor: '#FEF2F2'
  },
  riskMedium: {
    backgroundColor: '#FEF3C7'
  },
  riskText: {
    fontSize: 10,
    fontFamily: FONTS.bold
  },
  riskTextHigh: {
    color: COLORS.danger
  },
  riskTextMedium: {
    color: '#D97706'
  },
  title: {
    fontSize: 17,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink
  },
  latin: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    color: COLORS.muted,
    marginTop: 1
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
    padding: 18,
    gap: 16
  },
  section: {
    backgroundColor: COLORS.canvas,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  sectionText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.inkSecondary,
    lineHeight: 18
  },
  causeBox: {
    marginTop: 4,
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  causeLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  causeText: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.inkSecondary,
    marginTop: 2
  },
  symptomList: {
    gap: 6
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  symptomName: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.inkSecondary,
    paddingRight: 8
  },
  cfBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cfBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  confirmBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
