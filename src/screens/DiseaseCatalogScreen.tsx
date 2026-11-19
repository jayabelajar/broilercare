import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { Header } from '../components/Header';
import { DISEASES, DIAGNOSTIC_RULES } from '../data/knowledgeBase';

type RiskFilter = 'SEMUA' | 'KRITIS' | 'TINGGI' | 'SEDANG';

export const DiseaseCatalogScreen: React.FC = () => {
  const openDiseaseDetail = useDiagnosisStore((s) => s.openDiseaseDetail);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('SEMUA');
  const [isSearchHidden, setIsSearchHidden] = useState(false);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    if (currentY > 60 && currentY > lastScrollY.current + 10) {
      if (!isSearchHidden) setIsSearchHidden(true);
    } else if (currentY < lastScrollY.current - 10 || currentY <= 20) {
      if (isSearchHidden) setIsSearchHidden(false);
    }
    lastScrollY.current = currentY;
  };

  const filteredDiseases = useMemo(() => {
    let result = DISEASES;

    // Filter by risk
    if (riskFilter !== 'SEMUA') {
      result = result.filter((d) => d.riskLevel === riskFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.latinName.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, riskFilter]);

  return (
    <View style={styles.container}>
      <Header title="Penyakit Broiler" />

      {/* Collapsible Search and Filter Container */}
      {!isSearchHidden && (
        <View style={styles.filterContainer}>
          {/* Modern Search Bar */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari penyakit (contoh: Tetelo, CRD, P01)..."
              placeholderTextColor={COLORS.subtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Risk Level Filter Chips */}
          <View style={styles.riskFilterRow}>
            {(
              [
                { key: 'SEMUA', label: 'Semua Risiko' },
                { key: 'KRITIS', label: 'Kritis' },
                { key: 'TINGGI', label: 'Tinggi' },
                { key: 'SEDANG', label: 'Sedang' }
              ] as Array<{ key: RiskFilter; label: string }>
            ).map((item) => {
              const isSelected = riskFilter === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.riskChip, isSelected && styles.riskChipActive]}
                  onPress={() => setRiskFilter(item.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.riskChipText, isSelected && styles.riskChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Disease Card List (Hapus teks menampilkan 13 dari 13 penyakit) */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredDiseases.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={36} color={COLORS.subtle} />
            <Text style={styles.emptyTitle}>Penyakit Tidak Ditemukan</Text>
            <Text style={styles.emptyDesc}>
              Coba sesuaikan kata kunci pencarian atau ubah filter tingkat risiko.
            </Text>
          </View>
        ) : (
          filteredDiseases.map((disease) => {
            const ruleCount = DIAGNOSTIC_RULES.filter((r) => r.diseaseId === disease.id).length;
            const isHighRisk = disease.riskLevel === 'KRITIS' || disease.riskLevel === 'TINGGI';

            return (
              <TouchableOpacity
                key={disease.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => openDiseaseDetail(disease)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.headerLeft}>
                    <View style={styles.badgeRow}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>{disease.code}</Text>
                      </View>
                      <View style={[styles.riskBadge, isHighRisk ? styles.riskHigh : styles.riskMedium]}>
                        <Text style={[styles.riskText, isHighRisk ? styles.riskTextHigh : styles.riskTextMedium]}>
                          Risiko: {disease.riskLevel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.diseaseName}>{disease.name}</Text>
                    <Text style={styles.diseaseLatin}>{disease.latinName}</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.brand} />
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {disease.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.ruleBadge}>
                    <Ionicons name="medkit-outline" size={13} color={COLORS.brand} />
                    <Text style={styles.ruleBadgeText}>{ruleCount} Gejala Patognomonik</Text>
                  </View>
                  <Text style={styles.viewDetailText}>Detail & Solusi &rarr;</Text>
                </View>
              </TouchableOpacity>
            );
          })
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: COLORS.canvas
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
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.ink
  },
  riskFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8
  },
  riskChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  riskChipActive: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brandBorder
  },
  riskChipText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.muted
  },
  riskChipTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 12
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginTop: 10
  },
  emptyDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  headerLeft: {
    flex: 1
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
    paddingVertical: 2.5,
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
    paddingVertical: 2.5,
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
  diseaseName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    marginBottom: 2
  },
  diseaseLatin: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    color: COLORS.muted
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center'
  },
  description: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.inkSecondary,
    lineHeight: 18,
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lineSubtle,
    paddingTop: 10
  },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  ruleBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.brand
  },
  viewDetailText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  }
});
