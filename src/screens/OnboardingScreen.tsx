import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDiagnosisStore } from '../store/diagnosisStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    tag: 'SISTEM PAKAR',
    title: 'Deteksi Dini Kesehatan Ternak',
    description:
      'Identifikasi gejala klinis secara cepat dan akurat menggunakan mesin inferensi berbasis kepakaran veteriner.',
    icon: 'medkit' as const,
    cardBg: '#EFF6FF',
    iconColor: COLORS.brand,
    features: ['13 Penyakit Terdata', '40 Indikator Gejala', 'Solusi Tindakan Cepat']
  },
  {
    tag: 'METODE CERTAINTY FACTOR',
    title: 'Perhitungan Ilmiah Deterministik',
    description:
      'Skor kepastian dihasilkan dari kombinasi derajat keyakinan peternak dan bobot pakar (MB - MD) secara transparan.',
    icon: 'analytics' as const,
    cardBg: '#EFF6FF',
    iconColor: COLORS.brandDark,
    features: ['Bobot Pakar Jurnal', 'Diferensial Diagnosis', 'Langkah Hitung Transparan']
  },
  {
    tag: 'ARSITEKTUR OFFLINE-FIRST',
    title: '100% Bekerja Tanpa Internet',
    description:
      'Akses basis pengetahuan dan riwayat diagnosis langsung di area perkandangan tanpa perlu sinyal maupun paket data.',
    icon: 'cloud-offline' as const,
    cardBg: '#EFF6FF',
    iconColor: COLORS.brandAccent,
    features: ['Database Lokal SQLite', 'Riwayat per Peternak', 'Ringan & Responsif']
  }
];

export const OnboardingScreen: React.FC = () => {
  const finishOnboarding = useDiagnosisStore((s) => s.finishOnboarding);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Ionicons name="medkit" size={14} color={COLORS.brand} />
          <Text style={styles.brandBadgeText}>OhMyChick</Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Main Illustration Circle */}
        <View style={styles.heroWrap}>
          <View style={[styles.heroCircle, { backgroundColor: slide.cardBg }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={SCREEN_HEIGHT < 680 ? 44 : 54} color={slide.iconColor} />
            </View>
          </View>

          {/* Feature Pills under hero */}
          <View style={styles.badgeWrap}>
            {slide.features.map((feat, i) => (
              <View key={i} style={styles.pillBadge}>
                <Ionicons name="checkmark-circle" size={13} color={slide.iconColor} />
                <Text style={styles.pillBadgeText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.contentWrap}>
          {/* Tag */}
          <View style={styles.tagWrap}>
            <Text style={[styles.tagText, { color: slide.iconColor }]}>{slide.tag}</Text>
          </View>

          {/* Headline Title */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* Description */}
          <Text style={styles.desc}>{slide.description}</Text>
        </View>
      </ScrollView>

      {/* Persistent Bottom Bar with Indicators & Action */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsWrap}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide && styles.dotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? 'Mulai Sekarang' : 'Lanjutkan'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark' : 'arrow-forward'}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 8
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.brandBorder
  },
  brandBadgeText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: COLORS.brand
  },
  skipText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.semiBold
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  heroWrap: {
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT < 680 ? 12 : 24
  },
  heroCircle: {
    width: Math.min(SCREEN_WIDTH * 0.52, 210),
    height: Math.min(SCREEN_WIDTH * 0.52, 210),
    borderRadius: Math.min(SCREEN_WIDTH * 0.26, 105),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.brandBorder,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4
  },
  iconCircle: {
    width: Math.min(SCREEN_WIDTH * 0.3, 115),
    height: Math.min(SCREEN_WIDTH * 0.3, 115),
    borderRadius: Math.min(SCREEN_WIDTH * 0.15, 60),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  pillBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.inkSecondary
  },
  contentWrap: {
    alignItems: 'center',
    marginTop: 12
  },
  tagWrap: {
    marginBottom: 6
  },
  tagText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5
  },
  title: {
    fontSize: SCREEN_HEIGHT < 680 ? 20 : 23,
    fontFamily: FONTS.extraBold,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: SCREEN_HEIGHT < 680 ? 26 : 30
  },
  desc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lineSubtle,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.line
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.brand
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  nextBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#FFFFFF'
  }
});
