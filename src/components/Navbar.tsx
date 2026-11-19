import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore, TabKey } from '../store/diagnosisStore';

export const Navbar: React.FC = () => {
  const activeTab = useDiagnosisStore((s) => s.activeTab);
  const setActiveTab = useDiagnosisStore((s) => s.setActiveTab);
  const setActiveScreen = useDiagnosisStore((s) => s.setActiveScreen);
  const clearSymptoms = useDiagnosisStore((s) => s.clearSymptoms);

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    isAction?: boolean;
  }> = [
    { key: 'beranda', label: 'Beranda', icon: 'home-outline', activeIcon: 'home' },
    { key: 'katalog', label: 'Penyakit', icon: 'clipboard-outline', activeIcon: 'clipboard' },
    { key: 'diagnosis', label: 'Diagnosa', icon: 'pulse', activeIcon: 'pulse', isAction: true },
    { key: 'riwayat', label: 'Riwayat', icon: 'time-outline', activeIcon: 'time' },
    { key: 'profil', label: 'Profil', icon: 'person-outline', activeIcon: 'person' }
  ];

  const handleTabPress = (tab: typeof tabs[0]) => {
    if (tab.isAction) {
      clearSymptoms();
      setActiveScreen('diagnosis_symptoms');
    } else {
      setActiveTab(tab.key);
    }
  };

  return (
    <View style={styles.navWrapper}>
      <View style={styles.floatingBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          if (tab.isAction) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.actionTab}
                activeOpacity={0.85}
                onPress={() => handleTabPress(tab)}
              >
                <View style={styles.actionCircle}>
                  <Ionicons name="medkit" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab)}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={19}
                  color={isActive ? COLORS.brand : COLORS.muted}
                />
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: COLORS.canvas
  },
  floatingBar: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    borderRadius: 24,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 14
  },
  tabItemActive: {
    // subtle container styling
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapActive: {
    backgroundColor: COLORS.brandLight,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.brandBorder
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    marginTop: 2,
    letterSpacing: -0.2
  },
  tabLabelActive: {
    color: COLORS.brand,
    fontFamily: FONTS.bold
  },
  actionTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.brand,
    marginTop: 2,
    letterSpacing: -0.2
  }
});
