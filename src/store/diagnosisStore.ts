import { create } from 'zustand';
import { Disease, DiseaseDiagnosisResult } from '../core/certainty-factor/types';
import { DISEASES, DIAGNOSTIC_RULES, RESEARCH_SAMPLES } from '../data/knowledgeBase';
import { diagnoseDiseases } from '../core/certainty-factor/calculateCF';
import {
  initDatabase,
  dbLoginUser,
  dbRegisterUser,
  dbUpdateUserProfile,
  dbGetDefaultUser,
  dbSaveDiagnosis,
  dbGetDiagnosisHistory,
  dbDeleteSingleDiagnosis,
  dbClearDiagnosisHistory,
  dbAddNotification,
  dbGetNotifications,
  dbMarkNotificationsRead,
  dbClearNotifications,
  DBDiagnosisRecord,
  DBNotification
} from '../database/db';

export interface UserProfile {
  id: string;
  name: string;
  farmName: string;
  email: string;
  location?: string;
  avatar?: string;
}

export interface HistoryRecord {
  id: string;
  userId: string;
  date: string;
  time: string;
  diseaseName: string;
  diseaseId: string;
  percentage: number;
  symptomsCount: number;
  riskLevel: string;
  cageName?: string;
  chickenAge?: number;
  populationCount?: number;
  notes?: string;
  createdTimestamp?: number;
}

export interface FlockInfo {
  cageName: string;
  chickenAge: number | null;
  populationCount: number | null;
  affectedCount: number | null;
  notes: string;
}

export type TabKey = 'beranda' | 'katalog' | 'diagnosis' | 'riwayat' | 'profil';
export type ActiveScreen =
  | 'onboarding'
  | 'auth'
  | 'main'
  | 'diagnosis_info'
  | 'diagnosis_symptoms'
  | 'diagnosis_confidence'
  | 'diagnosis_result';

interface DiagnosisState {
  hasOnboarded: boolean;
  user: UserProfile | null;
  activeTab: TabKey;
  activeScreen: ActiveScreen;
  flockInfo: FlockInfo;
  selectedSymptoms: string[];
  confidenceValues: Record<string, number>; // symptomId -> cfUser
  selectedCategory: string;
  diagnosisResults: DiseaseDiagnosisResult[] | null;
  history: HistoryRecord[];
  notifications: DBNotification[];
  isNotificationModalOpen: boolean;
  selectedDiseaseDetail: Disease | null;
  isTestBenchOpen: boolean;
  offlineNotification: string | null;
  isDBReady: boolean;

  // Actions
  initAppDB: () => Promise<void>;
  finishOnboarding: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, farmName: string, email: string, password?: string, avatar?: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (name: string, farmName: string, avatar?: string) => Promise<boolean>;
  guestLogin: () => void;
  logout: () => void;
  setActiveTab: (tab: TabKey) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setFlockInfo: (info: Partial<FlockInfo>) => void;
  resetFlockInfo: () => void;
  setSelectedCategory: (cat: string) => void;
  toggleSymptom: (symptomId: string) => void;
  setSymptomConfidence: (symptomId: string, value: number) => void;
  clearSymptoms: () => void;
  calculateResult: () => Promise<void>;
  openDiseaseDetail: (disease: Disease) => void;
  closeDiseaseDetail: () => void;
  openTestBench: () => void;
  closeTestBench: () => void;
  openNotificationModal: () => void;
  closeNotificationModal: () => void;
  markNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  runTestSample: (sampleId: number) => void;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  resetAll: () => Promise<void>;
  dismissNotification: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  hasOnboarded: true,
  user: {
    id: 'USR-SEED-01',
    name: 'Budi Santoso',
    farmName: 'Berkah Broiler Farm',
    email: 'peternak@ohmychick.id',
    location: 'Ciamis, Jawa Barat',
    avatar: '👨‍🌾'
  },
  activeTab: 'beranda',
  activeScreen: 'main',
  flockInfo: {
    cageName: 'Kandang 1',
    chickenAge: 21,
    populationCount: 5000,
    affectedCount: 25,
    notes: ''
  },
  selectedSymptoms: [],
  confidenceValues: {},
  selectedCategory: 'SEMUA',
  diagnosisResults: null,
  offlineNotification: null,
  isNotificationModalOpen: false,
  isDBReady: false,
  notifications: [
    {
      id: 'NOTIF-INIT-1',
      user_id: 'USR-SEED-01',
      title: 'Selamat Datang di OhMyChick!',
      message: 'Sistem siap membantu diagnosis kesehatan ayam broiler Anda dengan metode Certainty Factor.',
      date: '8 Nov 2026',
      time: '18:30',
      is_read: 0,
      type: 'system',
      created_timestamp: Date.now()
    }
  ],
  history: [
    {
      id: 'HIST-INIT-1',
      userId: 'USR-SEED-01',
      date: '8 Nov 2026',
      time: '18:30',
      diseaseName: 'CRD (Chronic Respiratory Disease)',
      diseaseId: 'P13',
      percentage: 99,
      symptomsCount: 5,
      riskLevel: 'SEDANG',
      cageName: 'Kandang 1 - Postal',
      chickenAge: 24,
      populationCount: 5000,
      notes: 'Ayam tampak lesu dan ngorok di malam hari saat suhu dingin',
      createdTimestamp: Date.now() - 86400000
    }
  ],
  selectedDiseaseDetail: null,
  isTestBenchOpen: false,

  initAppDB: async () => {
    try {
      await initDatabase();
      const defaultUser = await dbGetDefaultUser();
      const user = defaultUser ? {
        id: defaultUser.id,
        name: defaultUser.name,
        farmName: defaultUser.farm_name,
        email: defaultUser.email,
        avatar: defaultUser.avatar || '👨‍🌾'
      } : get().user;

      const dbHistory = await dbGetDiagnosisHistory(user?.id);
      const dbNotifs = await dbGetNotifications(user?.id);

      set({
        isDBReady: true,
        user,
        history: dbHistory.map((h) => ({
          id: h.id,
          userId: h.user_id,
          date: h.date,
          time: h.time,
          diseaseName: h.disease_name,
          diseaseId: h.disease_id,
          percentage: h.percentage,
          symptomsCount: h.symptoms_count,
          riskLevel: h.risk_level,
          cageName: h.cage_name || 'Kandang Utama',
          chickenAge: h.chicken_age,
          populationCount: h.population_count,
          notes: h.notes,
          createdTimestamp: h.created_timestamp
        })),
        notifications: dbNotifs
      });
    } catch (err) {
      console.warn('[Store] DB Init error:', err);
      set({ isDBReady: true });
    }
  },

  finishOnboarding: () => {
    const { user } = get();
    set({
      hasOnboarded: true,
      activeScreen: user ? 'main' : 'auth',
      activeTab: 'beranda'
    });
  },

  login: async (email, password = '') => {
    try {
      const res = await dbLoginUser(email, password);
      if (res.success && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          farmName: u.farm_name,
          email: u.email,
          avatar: u.avatar || '👨‍🌾'
        };
        const dbHistory = await dbGetDiagnosisHistory(profile.id);
        const dbNotifs = await dbGetNotifications(profile.id);

        set({
          user: profile,
          activeScreen: 'main',
          activeTab: 'beranda',
          history: dbHistory.map((h) => ({
            id: h.id,
            userId: h.user_id,
            date: h.date,
            time: h.time,
            diseaseName: h.disease_name,
            diseaseId: h.disease_id,
            percentage: h.percentage,
            symptomsCount: h.symptoms_count,
            riskLevel: h.risk_level,
            cageName: h.cage_name || 'Kandang Utama',
            chickenAge: h.chicken_age,
            populationCount: h.population_count,
            notes: h.notes,
            createdTimestamp: h.created_timestamp
          })),
          notifications: dbNotifs,
          offlineNotification: `Selamat datang kembali, ${profile.name}`
        });
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal masuk akun' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Terjadi kesalahan' };
    }
  },

  register: async (name, farmName, email, password = '123456', avatar = '👨‍🌾') => {
    try {
      const res = await dbRegisterUser(name, farmName, email, password, avatar);
      if (res.success && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          farmName: u.farm_name,
          email: u.email,
          avatar: u.avatar || avatar
        };
        // Add welcome notification
        await dbAddNotification(
          profile.id,
          'Akun Berhasil Didaftarkan',
          `Selamat datang di OhMyChick, ${profile.name}! Peternakan ${profile.farmName} siap didiagnosis.`,
          'system'
        );
        const dbNotifs = await dbGetNotifications(profile.id);

        set({
          user: profile,
          activeScreen: 'main',
          activeTab: 'beranda',
          history: [],
          notifications: dbNotifs,
          offlineNotification: `Pendaftaran berhasil. Selamat datang, ${profile.name}`
        });
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal mendaftar' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Terjadi kesalahan' };
    }
  },

  updateProfile: async (name, farmName, avatar) => {
    const { user } = get();
    if (!user) return false;
    try {
      await dbUpdateUserProfile(user.id, name, farmName, avatar);
      set({
        user: {
          ...user,
          name,
          farmName,
          avatar: avatar || user.avatar
        },
        offlineNotification: 'Profil peternak berhasil diperbarui'
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  guestLogin: () => {
    set({
      user: {
        id: 'GUEST',
        name: 'Tamu (Peternak)',
        farmName: 'Mode Tamu Offline',
        email: 'tamu@ohmychick.local',
        avatar: '🐥'
      },
      activeScreen: 'main',
      activeTab: 'beranda'
    });
  },

  logout: () => {
    set({
      user: null,
      activeScreen: 'auth'
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab, activeScreen: 'main' }),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setFlockInfo: (info) =>
    set((state) => ({
      flockInfo: { ...state.flockInfo, ...info }
    })),
  resetFlockInfo: () =>
    set({
      flockInfo: {
        cageName: 'Kandang 1',
        chickenAge: 21,
        populationCount: 5000,
        affectedCount: 25,
        notes: ''
      }
    }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  toggleSymptom: (symptomId) => {
    const { selectedSymptoms, confidenceValues } = get();
    const exists = selectedSymptoms.includes(symptomId);
    if (exists) {
      const nextSymptoms = selectedSymptoms.filter((id) => id !== symptomId);
      const nextConf = { ...confidenceValues };
      delete nextConf[symptomId];
      set({ selectedSymptoms: nextSymptoms, confidenceValues: nextConf });
    } else {
      set({
        selectedSymptoms: [...selectedSymptoms, symptomId],
        confidenceValues: { ...confidenceValues, [symptomId]: 0.8 }
      });
    }
  },

  setSymptomConfidence: (symptomId, value) => {
    const { confidenceValues } = get();
    set({
      confidenceValues: { ...confidenceValues, [symptomId]: value }
    });
  },

  clearSymptoms: () => set({ selectedSymptoms: [], confidenceValues: {} }),

  calculateResult: async () => {
    const { selectedSymptoms, confidenceValues, history, user, flockInfo } = get();
    const selections = selectedSymptoms.map((id) => ({
      symptomId: id,
      userConfidence: confidenceValues[id] ?? 0.8
    }));

    const results = diagnoseDiseases(DISEASES, DIAGNOSTIC_RULES, selections);

    if (results.length > 0) {
      const primary = results[0];
      const now = new Date();
      const currentUserId = user ? user.id : 'GUEST';
      const recordId = `HIST-${Date.now()}`;

      const newHistoryItem: HistoryRecord = {
        id: recordId,
        userId: currentUserId,
        date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        diseaseName: primary.disease.name,
        diseaseId: primary.disease.id,
        percentage: primary.percentage,
        symptomsCount: primary.matchedRules.length,
        riskLevel: primary.disease.riskLevel,
        cageName: flockInfo.cageName || 'Kandang Utama',
        chickenAge: flockInfo.chickenAge ?? undefined,
        populationCount: flockInfo.populationCount ?? undefined,
        notes: flockInfo.notes || undefined,
        createdTimestamp: now.getTime()
      };

      // Save to SQLite
      await dbSaveDiagnosis({
        id: newHistoryItem.id,
        user_id: newHistoryItem.userId,
        date: newHistoryItem.date,
        time: newHistoryItem.time,
        disease_name: newHistoryItem.diseaseName,
        disease_id: newHistoryItem.diseaseId,
        percentage: newHistoryItem.percentage,
        symptoms_count: newHistoryItem.symptomsCount,
        risk_level: newHistoryItem.riskLevel,
        cage_name: newHistoryItem.cageName,
        chicken_age: newHistoryItem.chickenAge,
        population_count: newHistoryItem.populationCount,
        notes: newHistoryItem.notes,
        created_timestamp: now.getTime()
      });

      // Add Notification to SQLite
      const notif = await dbAddNotification(
        currentUserId,
        `Diagnosis Selesai: ${primary.disease.name}`,
        `Terindikasi ${primary.disease.name} (${primary.percentage}%) pada ${newHistoryItem.cageName} berdasarkan ${primary.matchedRules.length} gejala.`,
        'diagnosis'
      );

      const updatedNotifs = await dbGetNotifications(currentUserId);

      set({
        diagnosisResults: results,
        activeScreen: 'diagnosis_result',
        history: [newHistoryItem, ...history.slice(0, 50)],
        notifications: updatedNotifs,
        offlineNotification: `Diagnosis Selesai: ${primary.disease.name} (${primary.percentage}%)`
      });
    } else {
      set({
        diagnosisResults: [],
        activeScreen: 'diagnosis_result',
        offlineNotification: 'Gejala tidak cocok dengan basis aturan'
      });
    }
  },

  openNotificationModal: () => set({ isNotificationModalOpen: true }),
  closeNotificationModal: () => set({ isNotificationModalOpen: false }),

  markNotificationsRead: async () => {
    const { user } = get();
    await dbMarkNotificationsRead(user?.id);
    const updated = await dbGetNotifications(user?.id);
    set({ notifications: updated });
  },

  clearNotifications: async () => {
    const { user } = get();
    await dbClearNotifications(user?.id);
    set({ notifications: [] });
  },

  dismissNotification: () => set({ offlineNotification: null }),
  openDiseaseDetail: (disease) => set({ selectedDiseaseDetail: disease }),
  closeDiseaseDetail: () => set({ selectedDiseaseDetail: null }),
  openTestBench: () => set({ isTestBenchOpen: true }),
  closeTestBench: () => set({ isTestBenchOpen: false }),

  runTestSample: (sampleId) => {
    const sample = RESEARCH_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;

    const conf: Record<string, number> = {};
    sample.symptoms.forEach((s) => {
      conf[s] = 0.8;
    });

    set({
      selectedSymptoms: sample.symptoms,
      confidenceValues: conf,
      isTestBenchOpen: false
    });

    get().calculateResult();
  },

  deleteHistoryItem: async (id: string) => {
    await dbDeleteSingleDiagnosis(id);
    const { history } = get();
    set({
      history: history.filter((h) => h.id !== id),
      offlineNotification: 'Catatan diagnosis berhasil dihapus'
    });
  },

  clearHistory: async () => {
    const { user } = get();
    await dbClearDiagnosisHistory(user?.id);
    set({ history: [] });
  },

  refreshHistory: async () => {
    const { user } = get();
    const records = await dbGetDiagnosisHistory(user?.id);
    set({
      history: records.map((h) => ({
        id: h.id,
        userId: h.user_id,
        date: h.date,
        time: h.time,
        diseaseName: h.disease_name,
        diseaseId: h.disease_id,
        percentage: h.percentage,
        symptomsCount: h.symptoms_count,
        riskLevel: h.risk_level,
        cageName: h.cage_name || 'Kandang Utama',
        chickenAge: h.chicken_age,
        populationCount: h.population_count,
        notes: h.notes,
        createdTimestamp: h.created_timestamp
      }))
    });
  },

  resetAll: async () => {
    const { user } = get();
    await dbClearDiagnosisHistory(user?.id);
    await dbClearNotifications(user?.id);
    set({
      hasOnboarded: false,
      user: null,
      activeTab: 'beranda',
      activeScreen: 'onboarding',
      flockInfo: {
        cageName: 'Kandang 1',
        chickenAge: 21,
        populationCount: 5000,
        affectedCount: 25,
        notes: ''
      },
      selectedSymptoms: [],
      confidenceValues: {},
      diagnosisResults: null,
      history: [],
      notifications: [],
      offlineNotification: null
    });
  }
}));
