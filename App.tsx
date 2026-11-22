import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold
} from '@expo-google-fonts/plus-jakarta-sans';
import { COLORS } from './src/constants/theme';
import { useDiagnosisStore } from './src/store/diagnosisStore';
import { Navbar } from './src/components/Navbar';
import { NotificationBanner } from './src/components/NotificationBanner';
import { NotificationModal } from './src/components/NotificationModal';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiagnosisInfoScreen } from './src/screens/DiagnosisInfoScreen';
import { SymptomPickerScreen } from './src/screens/SymptomPickerScreen';
import { ConfidencePickerScreen } from './src/screens/ConfidencePickerScreen';
import { DiagnosisResultScreen } from './src/screens/DiagnosisResultScreen';
import { DiseaseCatalogScreen } from './src/screens/DiseaseCatalogScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DiseaseDetailModal } from './src/components/DiseaseDetailModal';
import { ResearchBenchModal } from './src/components/ResearchBenchModal';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold
  });

  const initAppDB = useDiagnosisStore((s) => s.initAppDB);
  const hasOnboarded = useDiagnosisStore((s) => s.hasOnboarded);
  const user = useDiagnosisStore((s) => s.user);
  const activeTab = useDiagnosisStore((s) => s.activeTab);
  const activeScreen = useDiagnosisStore((s) => s.activeScreen);
  const isNotificationModalOpen = useDiagnosisStore((s) => s.isNotificationModalOpen);
  const closeNotificationModal = useDiagnosisStore((s) => s.closeNotificationModal);

  // Initialize SQLite Local Database on app startup
  useEffect(() => {
    initAppDB();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand} />
      </View>
    );
  }

  // Render active main tab (5 Menus)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'beranda':
        return <HomeScreen />;
      case 'katalog':
        return <DiseaseCatalogScreen />;
      case 'riwayat':
        return <HistoryScreen />;
      case 'profil':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Render screen flow with guaranteed safe area bounds for all devices (including Poco C65)
  const renderContent = () => {
    // 1. Onboarding
    if (!hasOnboarded || activeScreen === 'onboarding') {
      return <OnboardingScreen />;
    }

    // 2. Auth (Login/Register)
    if (!user || activeScreen === 'auth') {
      return <AuthScreen />;
    }

    // 3. Diagnosis Step 1: Flock & Cage Identification
    if (activeScreen === 'diagnosis_info') {
      return <DiagnosisInfoScreen />;
    }

    // 4. Diagnosis Step 2: Select symptoms
    if (activeScreen === 'diagnosis_symptoms') {
      return <SymptomPickerScreen />;
    }

    // 5. Diagnosis Step 3: Set confidence (Certainty Factor)
    if (activeScreen === 'diagnosis_confidence') {
      return <ConfidencePickerScreen />;
    }

    // 6. Diagnosis Step 4: Result & Treatment recommendations
    if (activeScreen === 'diagnosis_result') {
      return <DiagnosisResultScreen />;
    }

    // 6. Default to main 5-tab dashboard with responsive floating navbar
    return (
      <View style={styles.tabContainer}>
        <View style={styles.tabContent}>{renderTabContent()}</View>
        <Navbar />
      </View>
    );
  };

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider>
      <View style={isWeb ? styles.webOuterWrapper : styles.nativeRoot}>
        <View style={isWeb ? styles.webMobileFrame : styles.nativeRoot}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="dark" />
            {renderContent()}
            <NotificationBanner />
            <NotificationModal
              visible={isNotificationModalOpen}
              onClose={closeNotificationModal}
            />
            <DiseaseDetailModal />
            <ResearchBenchModal />
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nativeRoot: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  webOuterWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  webMobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: '100vh',
    backgroundColor: COLORS.canvas,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.canvas
  },
  tabContent: {
    flex: 1
  }
});
