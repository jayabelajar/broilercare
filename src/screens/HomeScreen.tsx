import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { Header } from '../components/Header';
import { DISEASES } from '../data/knowledgeBase';

type FilterPeriod = 'mingguan' | 'bulanan' | 'semua';

export const HomeScreen: React.FC = () => {
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const setActiveTab = useDiagnosisStore((s) => s.setActiveTab);
  const clearSymptoms = useDiagnosisStore((s) => s.clearSymptoms);
  const openTestBench = useDiagnosisStore((s) => s.openTestBench);
  const history = useDiagnosisStore((s) => s.history);
  const openDiseaseDetail = useDiagnosisStore((s) => s.openDiseaseDetail);

  const [period, setPeriod] = useState<FilterPeriod>('mingguan');

  const handleStartDiagnosis = () => {
    clearSymptoms();
    setActiveScreen('diagnosis_info');
  };

  // Filter history dynamically based on actual SQLite database records
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    if (period === 'mingguan') {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return history.filter((h) => (h.createdTimestamp ? h.createdTimestamp >= oneWeekAgo : true));
    } else if (period === 'bulanan') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      return history.filter((h) => (h.createdTimestamp ? h.createdTimestamp >= oneMonthAgo : true));
    }
    return history;
  }, [history, period]);

  const totalCount = filteredHistory.length;
  const avgCF =
    totalCount > 0
      ? Math.round(filteredHistory.reduce((a, b) => a + b.percentage, 0) / totalCount)
      : history.length > 0
        ? Math.round(history.reduce((a, b) => a + b.percentage, 0) / history.length)
        : 0;

  // Real chart calculation by day of week
  const dayStats = useMemo(() => {
    const days = [
      { label: 'Sen', dayIndex: 1, count: 0 },
      { label: 'Sel', dayIndex: 2, count: 0 },
      { label: 'Rab', dayIndex: 3, count: 0 },
      { label: 'Kam', dayIndex: 4, count: 0 },
      { label: 'Jum', dayIndex: 5, count: 0 },
      { label: 'Sab', dayIndex: 6, count: 0 },
      { label: 'Min', dayIndex: 0, count: 0 }
    ];

    filteredHistory.forEach((item) => {
      const date = item.createdTimestamp ? new Date(item.createdTimestamp) : new Date();
      const d = date.getDay();
      const target = days.find((x) => x.dayIndex === d);
      if (target) target.count += 1;
    });

    const maxCount = Math.max(...days.map((d) => d.count), 1);
    const todayIndex = new Date().getDay();

    return days.map((d) => ({
      day: d.label,
      val: d.count > 0 ? Math.max(Math.round((d.count / maxCount) * 100), 25) : 15,
      active: d.dayIndex === todayIndex,
      count: d.count
    }));
  }, [filteredHistory]);

  const lastCase = history.length > 0 ? history[0] : null;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO ACTIVITY CARD (Bento Kurva Filter Aktif) */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.metricPair}>
              <View>
                <Text style={styles.metricLabel}>Total Diagnosa</Text>
                <Text style={styles.metricVal}>
                  {totalCount > 0 ? `${totalCount} Sesi` : '0 Sesi'}
                </Text>
              </View>
              <View>
                <Text style={styles.metricLabel}>Rata-rata CF</Text>
                <Text style={styles.metricVal}>
                  {avgCF > 0 ? `${avgCF}%` : '-'}
                </Text>
              </View>
            </View>

            {/* Interactive Filter Pills */}
            <View style={styles.filterGroup}>
              {(['mingguan', 'bulanan', 'semua'] as FilterPeriod[]).map((p) => {
                const isActive = period === p;
                const label = p === 'mingguan' ? '7 Hari' : p === 'bulanan' ? '30 Hari' : 'Semua';
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setPeriod(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Clean Graphic Sparkline Bars */}
          <View style={styles.chartContainer}>
            {dayStats.map((bar, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${bar.val}%` },
                      bar.active && styles.barFillActive
                    ]}
                  />
                </View>
                <Text style={[styles.barDay, bar.active && styles.barDayActive]}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 1: LAYANAN DIAGNOSIS (Diutamakan di atas) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Layanan Diagnosis</Text>
        </View>

        <TouchableOpacity
          style={styles.heroActionCard}
          activeOpacity={0.88}
          onPress={handleStartDiagnosis}
        >
          <View style={styles.heroActionLeft}>
            <Text style={styles.heroActionTitle}>Mulai Diagnosis</Text>
            <Text style={styles.heroActionSubtitle}>
              Pilih gejala klinis fisik & perilaku untuk deteksi 13 penyakit broiler.
            </Text>
            <View style={styles.heroActionBtn}>
              <Text style={styles.heroActionBtnText}>Buka Pemeriksaan</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.brand} />
            </View>
          </View>
          <View style={styles.heroActionIcon}>
            <Ionicons name="medkit" size={34} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* SECTION 2: KASUS TERKINI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kasus Terkini</Text>
          <TouchableOpacity onPress={() => setActiveTab('riwayat')}>
            <Text style={styles.sectionLink}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {lastCase ? (
          <View style={styles.todayCard}>
            <View style={styles.todayLeftBento}>
              <View style={styles.todayIconCircle}>
                <Ionicons name="pulse" size={18} color={COLORS.brand} />
              </View>
              <Text style={styles.todayBentoNumber}>{lastCase.percentage}%</Text>
              <Text style={styles.todayBentoLabel}>Akurasi CF</Text>
            </View>

            <View style={styles.todayRightInfo}>
              <View style={styles.caseBadgeRow}>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={11} color={COLORS.muted} />
                  <Text style={styles.timeText}>{lastCase.date} • {lastCase.time}</Text>
                </View>
                <View
                  style={[
                    styles.riskPill,
                    lastCase.riskLevel === 'KRITIS' || lastCase.riskLevel === 'TINGGI'
                      ? styles.riskPillHigh
                      : styles.riskPillMed
                  ]}
                >
                  <Text
                    style={[
                      styles.riskPillText,
                      lastCase.riskLevel === 'KRITIS' || lastCase.riskLevel === 'TINGGI'
                        ? styles.riskPillTextHigh
                        : styles.riskPillTextMed
                    ]}
                  >
                    {lastCase.riskLevel}
                  </Text>
                </View>
              </View>

              <Text style={styles.caseDiseaseName} numberOfLines={2}>
                {lastCase.diseaseName}
              </Text>
              <Text style={styles.caseSymptomsCount}>
                Berdasarkan {lastCase.symptomsCount} gejala klinis kawanan
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyCardTitle}>Belum Ada Kasus</Text>
            <Text style={styles.emptyCardDesc}>
              Mulai diagnosis untuk mendeteksi penyakit kawanan ayam broiler secara cepat.
            </Text>
          </View>
        )}

        {/* 2 MINI ACTION BENTOS */}
        <View style={styles.bentoGrid}>
          {/* Bento 1: Katalog Penyakit */}
          <TouchableOpacity
            style={[styles.miniBento, { backgroundColor: COLORS.bentoBlue, borderColor: COLORS.bentoBlueBorder }]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('katalog')}
          >
            <View style={styles.miniBentoTop}>
              <View style={styles.miniIconCircle}>
                <Ionicons name="book-outline" size={16} color={COLORS.brand} />
              </View>
              <Ionicons name="arrow-forward" size={14} color={COLORS.brand} />
            </View>
            <Text style={styles.miniBentoTitle}>Penyakit Broiler</Text>
            <Text style={styles.miniBentoSub}>13 patologi, patogen & biosekuriti</Text>
          </TouchableOpacity>

          {/* Bento 2: Bench Test 10 Sampel */}
          <TouchableOpacity
            style={[styles.miniBento, { backgroundColor: COLORS.bentoMint, borderColor: COLORS.bentoMintBorder }]}
            activeOpacity={0.8}
            onPress={openTestBench}
          >
            <View style={styles.miniBentoTop}>
              <View style={[styles.miniIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="flask" size={16} color="#15803D" />
              </View>
              <Ionicons name="arrow-forward" size={14} color="#15803D" />
            </View>
            <Text style={[styles.miniBentoTitle, { color: '#166534' }]}>Uji 10 Kasus Jurnal</Text>
            <Text style={[styles.miniBentoSub, { color: '#15803D' }]}>Validasi akurasi formula CF</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION: DAFTAR 3 PENYAKIT UMUM */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Penyakit Umum</Text>
          <TouchableOpacity onPress={() => setActiveTab('katalog')}>
            <Text style={styles.sectionLink}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.diseaseList}>
          {DISEASES.slice(0, 3).map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.diseaseItem}
              activeOpacity={0.75}
              onPress={() => openDiseaseDetail(d)}
            >
              <View style={styles.diseaseCodeWrap}>
                <Text style={styles.diseaseCode}>{d.code}</Text>
              </View>
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseItemName}>{d.name}</Text>
                <Text style={styles.diseaseItemLatin}>{d.latinName}</Text>
              </View>
              <View style={styles.diseaseRight}>
                <View
                  style={[
                    styles.riskDot,
                    d.riskLevel === 'KRITIS' || d.riskLevel === 'TINGGI'
                      ? styles.riskDotHigh
                      : styles.riskDotMed
                  ]}
                />
                <Ionicons name="chevron-forward" size={16} color={COLORS.subtle} />
              </View>
            </TouchableOpacity>
          ))}
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricPair: {
    flexDirection: 'row',
    gap: 20
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  metricVal: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink,
    marginTop: 2
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    padding: 2.5,
    gap: 2
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  filterPillActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  filterPillText: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  filterPillTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingTop: 8
  },
  barCol: {
    alignItems: 'center',
    flex: 1
  },
  barTrack: {
    width: 14,
    height: 48,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    backgroundColor: '#BFDBFE',
    borderRadius: 7
  },
  barFillActive: {
    backgroundColor: COLORS.brand
  },
  barDay: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    marginTop: 6
  },
  barDayActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  sectionLink: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.brand
  },
  todayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12,
    marginBottom: 18
  },
  todayLeftBento: {
    width: 85,
    backgroundColor: COLORS.brandLight,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  todayIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  todayBentoNumber: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.brand
  },
  todayBentoLabel: {
    fontSize: 9.5,
    fontFamily: FONTS.medium,
    color: COLORS.brandDark
  },
  todayRightInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  caseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  timeText: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  riskPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  riskPillHigh: {
    backgroundColor: '#FEF2F2'
  },
  riskPillMed: {
    backgroundColor: '#FEF3C7'
  },
  riskPillText: {
    fontSize: 9,
    fontFamily: FONTS.bold
  },
  riskPillTextHigh: {
    color: COLORS.danger
  },
  riskPillTextMed: {
    color: '#D97706'
  },
  caseDiseaseName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 3
  },
  caseSymptomsCount: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 18
  },
  emptyCardTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginTop: 6
  },
  emptyCardDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 2
  },
  heroActionCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5
  },
  heroActionLeft: {
    flex: 1,
    paddingRight: 10
  },
  heroActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  heroActionBadgeText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  heroActionTitle: {
    fontSize: 16,
    fontFamily: FONTS.extraBold,
    color: '#FFFFFF',
    marginBottom: 4
  },
  heroActionSubtitle: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: '#E0E7FF',
    lineHeight: 16,
    marginBottom: 12
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  heroActionBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  heroActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18
  },
  miniBento: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1
  },
  miniBentoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  miniBentoTitle: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 2
  },
  miniBentoSub: {
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  diseaseList: {
    gap: 8
  },
  diseaseItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },
  diseaseCodeWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  diseaseCode: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  diseaseInfo: {
    flex: 1
  },
  diseaseItemName: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  diseaseItemLatin: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    fontStyle: 'italic',
    color: COLORS.muted,
    marginTop: 1
  },
  diseaseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  riskDotHigh: {
    backgroundColor: COLORS.danger
  },
  riskDotMed: {
    backgroundColor: COLORS.warning
  }
});
