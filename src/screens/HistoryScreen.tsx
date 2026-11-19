import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore, HistoryRecord } from '../store/diagnosisStore';
import { Header } from '../components/Header';
import { DISEASES } from '../data/knowledgeBase';

type DateFilterType = 'SEMUA' | 'HARI_INI' | 'MINGGU_INI' | 'BULAN_INI';

interface SwipeableCardProps {
  record: HistoryRecord;
  onPress: () => void;
  onDelete: (id: string) => void;
}

const SwipeableHistoryCard: React.FC<SwipeableCardProps> = ({ record, onPress, onDelete }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const isHighRisk = record.riskLevel === 'KRITIS' || record.riskLevel === 'TINGGI';
  const matchedDisease = DISEASES.find((d) => d.id === record.diseaseId);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue(Math.max(gestureState.dx, -120));
        } else {
          pan.setValue(Math.min(gestureState.dx * 0.2, 20));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -110) {
          // Swiped far left -> auto delete
          Animated.timing(pan, {
            toValue: -300,
            duration: 200,
            useNativeDriver: true
          }).start(() => onDelete(record.id));
        } else if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          // Open delete action
          Animated.spring(pan, {
            toValue: -80,
            friction: 7,
            useNativeDriver: true
          }).start();
        } else {
          // Reset
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const handleReset = () => {
    Animated.spring(pan, {
      toValue: 0,
      friction: 7,
      useNativeDriver: true
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Background Delete Action */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteActionBtn}
          activeOpacity={0.8}
          onPress={() => onDelete(record.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteActionText}>Hapus</Text>
        </TouchableOpacity>
      </View>

      {/* Front Draggable Card */}
      <Animated.View
        style={[
          styles.recordCard,
          { transform: [{ translateX: pan }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            handleReset();
            onPress();
          }}
        >
          <View style={styles.recordTop}>
            <View style={styles.recordDateTime}>
              <Ionicons name="time-outline" size={13} color={COLORS.muted} />
              <Text style={styles.recordDateText}>{record.date} • {record.time}</Text>
            </View>
            <View style={[styles.riskBadge, isHighRisk ? styles.riskHigh : styles.riskMedium]}>
              <Text style={[styles.riskBadgeText, isHighRisk ? styles.riskTextHigh : styles.riskTextMedium]}>
                {record.riskLevel}
              </Text>
            </View>
          </View>

          <View style={styles.recordMain}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.recordDiseaseName}>{record.diseaseName}</Text>
              <Text style={styles.recordSymptoms}>
                Berdasarkan {record.symptomsCount} gejala klinis kawanan
              </Text>
            </View>
            <View style={styles.pctBadge}>
              <Text style={styles.pctNumber}>{record.percentage}%</Text>
              <Text style={styles.pctLabel}>CF</Text>
            </View>
          </View>

          {matchedDisease && (
            <View style={styles.recordFooter}>
              <Text style={styles.footerHint}>Ketuk untuk lihat penanganan &rarr;</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const HistoryScreen: React.FC = () => {
  const history = useDiagnosisStore((s) => s.history);
  const deleteHistoryItem = useDiagnosisStore((s) => s.deleteHistoryItem);
  const refreshHistory = useDiagnosisStore((s) => s.refreshHistory);
  const openDiseaseDetail = useDiagnosisStore((s) => s.openDiseaseDetail);

  const [dateFilter, setDateFilter] = useState<DateFilterType>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshHistory();
  }, []);

  // Filtered by ringkas: Semua, Hari Ini, Minggu Ini, Bulan Ini
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return history.filter((item) => {
      // Date filter
      if (dateFilter === 'HARI_INI') {
        if (item.date !== todayStr) return false;
      } else if (dateFilter === 'MINGGU_INI') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (item.createdTimestamp && item.createdTimestamp < sevenDaysAgo) return false;
      } else if (dateFilter === 'BULAN_INI') {
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (item.createdTimestamp && item.createdTimestamp < thirtyDaysAgo) return false;
      }

      // Keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.diseaseName.toLowerCase().includes(q) ||
          item.riskLevel.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [history, dateFilter, searchQuery]);

  const avgAccuracy =
    filteredHistory.length > 0
      ? Math.round(filteredHistory.reduce((acc, h) => acc + h.percentage, 0) / filteredHistory.length)
      : history.length > 0
      ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / history.length)
      : 0;

  return (
    <View style={styles.container}>
      <Header title="Riwayat Diagnosis" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari riwayat penyakit atau tanggal..."
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

        {/* Ringkas Date Filter Selector: Semua, Hari Ini, Minggu Ini, Bulan Ini */}
        <View style={styles.filterRow}>
          {(
            [
              { key: 'SEMUA', label: 'Semua' },
              { key: 'HARI_INI', label: 'Hari Ini' },
              { key: 'MINGGU_INI', label: 'Minggu Ini' },
              { key: 'BULAN_INI', label: 'Bulan Ini' }
            ] as Array<{ key: DateFilterType; label: string }>
          ).map((f) => {
            const isSelected = dateFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.datePill, isSelected && styles.datePillActive]}
                onPress={() => setDateFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.datePillText, isSelected && styles.datePillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top 2 Bento Cards Side by Side */}
        <View style={styles.topBentoRow}>
          {/* Bento 1: Total Diagnosa */}
          <View style={[styles.bentoCard, { backgroundColor: COLORS.bentoBlue, borderColor: COLORS.bentoBlueBorder }]}>
            <View style={styles.bentoTop}>
              <Text style={styles.bentoTitle}>Total Kasus</Text>
              <View style={styles.bentoIconCircle}>
                <Ionicons name="medkit" size={14} color={COLORS.brand} />
              </View>
            </View>
            <View style={styles.bentoValueCircle}>
              <Text style={styles.bentoBigNumber}>{filteredHistory.length}</Text>
              <Text style={styles.bentoSubText}>Tercatat</Text>
            </View>
          </View>

          {/* Bento 2: Rata-rata Akurasi CF */}
          <View style={[styles.bentoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.line }]}>
            <View style={styles.bentoTop}>
              <Text style={styles.bentoTitle}>Rata-rata CF</Text>
              <View style={styles.bentoIconCircle}>
                <Ionicons name="pulse" size={14} color={COLORS.brand} />
              </View>
            </View>
            <View style={styles.bentoValueCircle}>
              <Text style={styles.bentoBigNumber}>{avgAccuracy > 0 ? `${avgAccuracy}%` : '-'}</Text>
              <Text style={styles.bentoSubText}>Kepastian</Text>
            </View>
          </View>
        </View>

        {/* Consultation Records Section Header */}
        <View style={styles.recordsSectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Kasus</Text>
        </View>

        {filteredHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={40} color={COLORS.subtle} />
            <Text style={styles.emptyTitle}>Tidak Ada Catatan</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery || dateFilter !== 'SEMUA'
                ? 'Tidak ada diagnosis yang cocok dengan filter tanggal atau kata kunci.'
                : 'Diagnosis yang Anda lakukan akan otomatis tersimpan rapi di database lokal.'}
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {filteredHistory.map((record) => {
              const matchedDisease = DISEASES.find((d) => d.id === record.diseaseId);

              return (
                <SwipeableHistoryCard
                  key={record.id}
                  record={record}
                  onPress={() => {
                    if (matchedDisease) openDiseaseDetail(matchedDisease);
                  }}
                  onDelete={(id) => deleteHistoryItem(id)}
                />
              );
            })}
          </View>
        )}
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
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  datePillActive: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brandBorder
  },
  datePillText: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  datePillTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  topBentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  bentoCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1
  },
  bentoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  bentoTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  bentoIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bentoValueCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  bentoBigNumber: {
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink
  },
  bentoSubText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  recordsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginTop: 6
  },
  emptyDesc: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 17
  },
  recordsList: {
    gap: 10
  },
  swipeContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden'
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 80,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteActionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FONTS.bold
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 8
  },
  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  recordDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  recordDateText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.muted
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
  riskBadgeText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold
  },
  riskTextHigh: {
    color: COLORS.danger
  },
  riskTextMedium: {
    color: '#D97706'
  },
  recordMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  recordDiseaseName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 2
  },
  recordSymptoms: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.muted
  },
  pctBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  pctNumber: {
    fontSize: 16,
    fontFamily: FONTS.extraBold,
    color: COLORS.brand
  },
  pctLabel: {
    fontSize: 8.5,
    fontFamily: FONTS.bold,
    color: COLORS.brandDark
  },
  recordFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lineSubtle,
    paddingTop: 8,
    marginTop: 4
  },
  footerHint: {
    fontSize: 10.5,
    fontFamily: FONTS.semiBold,
    color: COLORS.brand
  }
});
