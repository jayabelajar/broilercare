import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { SYMPTOMS } from '../data/knowledgeBase';

export const DiagnosisResultScreen: React.FC = () => {
  const diagnosisResults = useDiagnosisStore((s) => s.diagnosisResults);
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const setActiveTab = useDiagnosisStore((s) => s.setActiveTab);
  const openDiseaseDetail = useDiagnosisStore((s) => s.openDiseaseDetail);
  const user = useDiagnosisStore((s) => s.user);

  const [isCalcExpanded, setIsCalcExpanded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!diagnosisResults || diagnosisResults.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.warning} />
          <Text style={styles.emptyTitle}>Bukti Gejala Belum Cukup</Text>
          <Text style={styles.emptyDesc}>
            Kombinasi gejala yang dipilih belum mencukupi untuk mendeteksi patologi ayam tertentu secara signifikan.
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

  const generateAndSharePdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const matchedRulesRows = primary.matchedRules
        .map((rule, idx) => {
          const sObj = SYMPTOMS.find((s) => s.id === rule.symptomId);
          return `
            <tr>
              <td style="text-align: center; color: #64748B;">${idx + 1}</td>
              <td style="font-weight: 600; color: #1E293B;">${sObj?.code || rule.symptomId}</td>
              <td>${sObj?.name || rule.symptomId}</td>
              <td style="text-align: center;">${rule.cfExpert}</td>
              <td style="text-align: center;">${rule.cfUser}</td>
              <td style="text-align: right; font-weight: 600; color: #2563EB;">${rule.cfCalculated.toFixed(2)}</td>
            </tr>
          `;
        })
        .join('');

      const differentialsHtml =
        differentials.length > 0
          ? `
          <div style="margin-top: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              Diagnosa Banding
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tbody>
                ${differentials
                  .map(
                    (d) => `
                  <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 8px 0; font-weight: 600; color: #1E293B;">${d.disease.name} <span style="font-style: italic; color: #64748B; font-weight: 400;">(${d.disease.latinName})</span></td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #2563EB;">${d.percentage}% CF</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          : '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Hasil Diagnosis - OhMyChick</title>
          <style>
            @page {
              margin: 20mm;
              size: A4 portrait;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              line-height: 1.5;
              padding: 0;
              margin: 0;
            }
            .header-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #2563EB;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 800;
              color: #2563EB;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748B;
              font-weight: 500;
              margin-top: 2px;
            }
            .doc-meta {
              text-align: right;
              font-size: 11px;
              color: #64748B;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              background-color: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .info-item {
              display: flex;
              gap: 8px;
            }
            .info-label {
              color: #64748B;
              min-width: 90px;
            }
            .info-value {
              font-weight: 600;
              color: #0F172A;
            }
            .primary-box {
              background-color: #EFF6FF;
              border: 1.5px solid #BFDBFE;
              border-radius: 10px;
              padding: 16px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .disease-name {
              font-size: 18px;
              font-weight: 800;
              color: #1E3A8A;
            }
            .disease-latin {
              font-size: 12px;
              font-style: italic;
              color: #3B82F6;
              margin-top: 2px;
            }
            .risk-pill {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              color: #DC2626;
              background-color: #FEE2E2;
              padding: 2px 8px;
              border-radius: 4px;
              margin-top: 6px;
            }
            .score-circle {
              text-align: right;
            }
            .score-pct {
              font-size: 32px;
              font-weight: 900;
              color: #2563EB;
              line-height: 1;
            }
            .score-label {
              font-size: 10px;
              font-weight: 700;
              color: #1E40AF;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #0F172A;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 18px;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
              margin-bottom: 16px;
            }
            th {
              background-color: #F1F5F9;
              color: #475569;
              font-weight: 700;
              text-align: left;
              padding: 8px 10px;
              border: 1px solid #CBD5E1;
            }
            td {
              padding: 7px 10px;
              border: 1px solid #E2E8F0;
              color: #334155;
            }
            .recom-card {
              background-color: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 14px;
              margin-bottom: 12px;
              font-size: 12px;
              color: #334155;
              line-height: 1.6;
            }
            .footer-disclaimer {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px dashed #CBD5E1;
              font-size: 10px;
              color: #94A3B8;
              text-align: center;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="header-top">
            <div>
              <div class="brand-title">OhMyChick</div>
              <div class="brand-sub">Sistem Pakar Diagnostik Kesehatan Ayam Broiler</div>
            </div>
            <div class="doc-meta">
              <div><strong>Laporan Klinis Resmi</strong></div>
              <div>Tanggal: ${dateStr}</div>
              <div>Pukul: ${timeStr} WIB</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Peternak:</span>
              <span class="info-value">${user?.name || 'Peternak Broiler'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Peternakan:</span>
              <span class="info-value">${user?.farmName || 'Kandang Mandiri'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Metode:</span>
              <span class="info-value">Certainty Factor Shortliffe (1975)</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gejala Cocok:</span>
              <span class="info-value">${primary.matchedRules.length} Gejala Klinis</span>
            </div>
          </div>

          <div class="primary-box">
            <div>
              <div style="font-size: 10px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px;">Indikasi Utama Patologi</div>
              <div class="disease-name">${primary.disease.name}</div>
              <div class="disease-latin">${primary.disease.latinName}</div>
              <div class="risk-pill">TINGKAT RESIKO: ${primary.disease.riskLevel}</div>
            </div>
            <div class="score-circle">
              <div class="score-pct">${primary.percentage}%</div>
              <div class="score-label">Certainty Factor</div>
            </div>
          </div>

          <div class="section-title">Bukti Observasi Gejala & Perhitungan CF</div>
          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 50px;">Kode</th>
                <th>Gejala Terobservasi</th>
                <th style="width: 50px; text-align: center;">CF Pakar</th>
                <th style="width: 50px; text-align: center;">CF User</th>
                <th style="width: 70px; text-align: right;">CF[H,E]</th>
              </tr>
            </thead>
            <tbody>
              ${matchedRulesRows}
            </tbody>
          </table>

          <div class="section-title">Penanganan Medis & Terapi Rekomendasi</div>
          <div class="recom-card">
            ${primary.disease.treatment}
          </div>

          <div class="section-title">Pencegahan & Biosekuriti Kandang</div>
          <div class="recom-card">
            ${primary.disease.prevention}
          </div>

          ${differentialsHtml}

          <div class="footer-disclaimer">
            Laporan ini dibuat otomatis oleh Sistem Pakar OhMyChick menggunakan algoritma Shortliffe Deterministic Rule.<br />
            Digunakan sebagai acuan rujukan penanganan cepat dan mitigasi mortalitas kawanan broiler di kandang.
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Laporan Diagnosis - ${primary.disease.name}`,
          UTI: '.pdf'
        });
      } else {
        Alert.alert('Sukses', `PDF berhasil diekspor ke: ${uri}`);
      }
    } catch (error) {
      console.error('Error export PDF:', error);
      Alert.alert('Gagal Ekspor', 'Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar (No branding text, max 2 words title) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            setActiveTab('beranda');
            setActiveScreen('main');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hasil Diagnosis</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={generateAndSharePdf}
          disabled={isGeneratingPdf}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator size="small" color={COLORS.brand} />
          ) : (
            <Ionicons name="share-social-outline" size={20} color={COLORS.brand} />
          )}
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
            onPress={generateAndSharePdf}
            disabled={isGeneratingPdf}
            activeOpacity={0.8}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color={COLORS.brand} />
            ) : (
              <Ionicons name="document-text-outline" size={16} color={COLORS.brand} />
            )}
            <Text style={styles.detailBtnText}>
              {isGeneratingPdf ? 'Membuat PDF...' : 'Bagikan PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              setActiveTab('beranda');
              setActiveScreen('main');
            }}
            activeOpacity={0.8}
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
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink
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
