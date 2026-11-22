import * as SQLite from 'expo-sqlite';

export interface DBUser {
  id: string;
  name: string;
  farm_name: string;
  email: string;
  password?: string;
  avatar?: string;
  created_at: string;
}

export interface DBDiagnosisRecord {
  id: string;
  user_id: string;
  date: string;
  time: string;
  disease_name: string;
  disease_id: string;
  percentage: number;
  symptoms_count: number;
  risk_level: string;
  cage_name?: string;
  chicken_age?: number;
  population_count?: number;
  notes?: string;
  created_timestamp: number;
}

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  is_read: number; // 0 or 1
  type: string;
  created_timestamp: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

// In-memory fallback if SQLite fails in certain web environments
const memoryStore = {
  users: [] as DBUser[],
  history: [] as DBDiagnosisRecord[],
  notifications: [] as DBNotification[]
};

export async function getDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = await SQLite.openDatabaseAsync('ohmychick.db');
    return dbInstance;
  } catch (err) {
    console.warn('[DB] Using fallback storage:', err);
    return null;
  }
}

export async function initDatabase(): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        farm_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS diagnosis_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        disease_id TEXT NOT NULL,
        percentage REAL NOT NULL,
        symptoms_count INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        cage_name TEXT,
        chicken_age INTEGER,
        population_count INTEGER,
        notes TEXT,
        created_timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'diagnosis',
        created_timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_hist_user ON diagnosis_history (user_id);
      CREATE INDEX IF NOT EXISTS idx_hist_time ON diagnosis_history (created_timestamp);
      CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications (user_id);
    `);

    // Safe column migrations for existing databases
    try { await db.execAsync('ALTER TABLE diagnosis_history ADD COLUMN cage_name TEXT;'); } catch (_) {}
    try { await db.execAsync('ALTER TABLE diagnosis_history ADD COLUMN chicken_age INTEGER;'); } catch (_) {}
    try { await db.execAsync('ALTER TABLE diagnosis_history ADD COLUMN population_count INTEGER;'); } catch (_) {}
    try { await db.execAsync('ALTER TABLE diagnosis_history ADD COLUMN notes TEXT;'); } catch (_) {}

    // Check if initial seed user exists
    const existingUser = await db.getFirstAsync<DBUser>('SELECT * FROM users LIMIT 1');
    if (!existingUser) {
      await db.runAsync(
        `INSERT INTO users (id, name, farm_name, email, password, avatar, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'USR-SEED-01',
          'Budi Santoso',
          'Berkah Broiler Farm',
          'peternak@ohmychick.id',
          '123456',
          '👨‍🌾',
          new Date().toISOString()
        ]
      );

      // Seed initial history item
      const now = new Date();
      await db.runAsync(
        `INSERT INTO diagnosis_history (id, user_id, date, time, disease_name, disease_id, percentage, symptoms_count, risk_level, cage_name, chicken_age, population_count, notes, created_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'HIST-INIT-1',
          'USR-SEED-01',
          '8 Nov 2026',
          '18:30',
          'CRD (Chronic Respiratory Disease)',
          'P13',
          99,
          5,
          'SEDANG',
          'Kandang 1 - Postal',
          24,
          5000,
          'Ayam tampak lesu dan ngorok di malam hari saat suhu dingin',
          now.getTime() - 86400000
        ]
      );

      // Seed initial notification
      await db.runAsync(
        `INSERT INTO notifications (id, user_id, title, message, date, time, is_read, type, created_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'NOTIF-INIT-1',
          'USR-SEED-01',
          'Selamat Datang di OhMyChick!',
          'Sistem siap membantu diagnosis kesehatan ayam broiler Anda dengan metode Certainty Factor.',
          '8 Nov 2026',
          '18:30',
          0,
          'system',
          now.getTime()
        ]
      );
    }
  } else {
    if (memoryStore.users.length === 0) {
      memoryStore.users.push({
        id: 'USR-SEED-01',
        name: 'Budi Santoso',
        farm_name: 'Berkah Broiler Farm',
        email: 'peternak@ohmychick.id',
        password: '123456',
        avatar: '👨‍🌾',
        created_at: new Date().toISOString()
      });
      memoryStore.history.push({
        id: 'HIST-INIT-1',
        user_id: 'USR-SEED-01',
        date: '8 Nov 2026',
        time: '18:30',
        disease_name: 'CRD (Chronic Respiratory Disease)',
        disease_id: 'P13',
        percentage: 99,
        symptoms_count: 5,
        risk_level: 'SEDANG',
        cage_name: 'Kandang 1 - Postal',
        chicken_age: 24,
        population_count: 5000,
        notes: 'Ayam tampak lesu dan ngorok di malam hari saat suhu dingin',
        created_timestamp: Date.now() - 86400000
      });
      memoryStore.notifications.push({
        id: 'NOTIF-INIT-1',
        user_id: 'USR-SEED-01',
        title: 'Selamat Datang di OhMyChick!',
        message: 'Sistem siap membantu diagnosis kesehatan ayam broiler Anda.',
        date: '8 Nov 2026',
        time: '18:30',
        is_read: 0,
        type: 'system',
        created_timestamp: Date.now()
      });
    }
  }
}

// ----------------- USER AUTH & PROFILE -----------------

export async function dbRegisterUser(
  name: string,
  farmName: string,
  email: string,
  password = 'password123',
  avatar = '👨‍🌾'
): Promise<{ success: boolean; user?: DBUser; message?: string }> {
  const db = await getDB();
  const normalizedEmail = email.trim().toLowerCase();

  if (db) {
    const existing = await db.getFirstAsync<DBUser>(
      'SELECT id FROM users WHERE LOWER(email) = ?',
      [normalizedEmail]
    );
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' };
    }

    const newUser: DBUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      farm_name: farmName.trim(),
      email: normalizedEmail,
      password: password.trim(),
      avatar,
      created_at: new Date().toISOString()
    };

    await db.runAsync(
      `INSERT INTO users (id, name, farm_name, email, password, avatar, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.name, newUser.farm_name, newUser.email, newUser.password!, newUser.avatar!, newUser.created_at]
    );

    return { success: true, user: newUser };
  } else {
    const exists = memoryStore.users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    const newUser: DBUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      farm_name: farmName.trim(),
      email: normalizedEmail,
      password: password.trim(),
      avatar,
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    return { success: true, user: newUser };
  }
}

export async function dbLoginUser(
  email: string,
  password = ''
): Promise<{ success: boolean; user?: DBUser; message?: string }> {
  const db = await getDB();
  const normalizedEmail = email.trim().toLowerCase();

  if (db) {
    const user = await db.getFirstAsync<DBUser>(
      'SELECT * FROM users WHERE LOWER(email) = ?',
      [normalizedEmail]
    );
    if (!user) {
      return { success: false, message: 'Akun dengan email ini belum terdaftar. Silakan daftar baru.' };
    }
    if (password && user.password && user.password !== password.trim()) {
      return { success: false, message: 'Kata sandi salah. Silakan coba lagi.' };
    }
    return { success: true, user };
  } else {
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, message: 'Akun belum terdaftar.' };
    }
    if (password && user.password && user.password !== password.trim()) {
      return { success: false, message: 'Kata sandi salah.' };
    }
    return { success: true, user };
  }
}

export async function dbUpdateUserProfile(
  id: string,
  name: string,
  farmName: string,
  avatar?: string
): Promise<boolean> {
  const db = await getDB();
  if (db) {
    await db.runAsync(
      `UPDATE users SET name = ?, farm_name = ?, avatar = COALESCE(?, avatar) WHERE id = ?`,
      [name.trim(), farmName.trim(), avatar || null, id]
    );
    return true;
  } else {
    const u = memoryStore.users.find((x) => x.id === id);
    if (u) {
      u.name = name.trim();
      u.farm_name = farmName.trim();
      if (avatar) u.avatar = avatar;
      return true;
    }
    return false;
  }
}

export async function dbGetDefaultUser(): Promise<DBUser | null> {
  const db = await getDB();
  if (db) {
    return await db.getFirstAsync<DBUser>('SELECT * FROM users ORDER BY created_at ASC LIMIT 1');
  }
  return memoryStore.users[0] || null;
}

// ----------------- DIAGNOSIS HISTORY -----------------

export async function dbSaveDiagnosis(record: DBDiagnosisRecord): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.runAsync(
      `INSERT INTO diagnosis_history (id, user_id, date, time, disease_name, disease_id, percentage, symptoms_count, risk_level, cage_name, chicken_age, population_count, notes, created_timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.user_id,
        record.date,
        record.time,
        record.disease_name,
        record.disease_id,
        record.percentage,
        record.symptoms_count,
        record.risk_level,
        record.cage_name || null,
        record.chicken_age ?? null,
        record.population_count ?? null,
        record.notes || null,
        record.created_timestamp
      ]
    );
  } else {
    memoryStore.history.unshift(record);
  }
}

export async function dbGetDiagnosisHistory(userId?: string): Promise<DBDiagnosisRecord[]> {
  const db = await getDB();
  if (db) {
    if (userId) {
      return await db.getAllAsync<DBDiagnosisRecord>(
        'SELECT * FROM diagnosis_history WHERE user_id = ? ORDER BY created_timestamp DESC',
        [userId]
      );
    }
    return await db.getAllAsync<DBDiagnosisRecord>(
      'SELECT * FROM diagnosis_history ORDER BY created_timestamp DESC'
    );
  }
  return userId ? memoryStore.history.filter((h) => h.user_id === userId) : memoryStore.history;
}

export async function dbDeleteSingleDiagnosis(id: string): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.runAsync('DELETE FROM diagnosis_history WHERE id = ?', [id]);
  } else {
    memoryStore.history = memoryStore.history.filter((h) => h.id !== id);
  }
}

export async function dbClearDiagnosisHistory(userId?: string): Promise<void> {
  const db = await getDB();
  if (db) {
    if (userId) {
      await db.runAsync('DELETE FROM diagnosis_history WHERE user_id = ?', [userId]);
    } else {
      await db.runAsync('DELETE FROM diagnosis_history');
    }
  } else {
    if (userId) {
      memoryStore.history = memoryStore.history.filter((h) => h.user_id !== userId);
    } else {
      memoryStore.history = [];
    }
  }
}

// ----------------- NOTIFICATIONS -----------------

export async function dbAddNotification(
  userId: string,
  title: string,
  message: string,
  type = 'diagnosis'
): Promise<DBNotification> {
  const now = new Date();
  const notif: DBNotification = {
    id: `NOTIF-${Date.now()}`,
    user_id: userId,
    title,
    message,
    date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    is_read: 0,
    type,
    created_timestamp: now.getTime()
  };

  const db = await getDB();
  if (db) {
    await db.runAsync(
      `INSERT INTO notifications (id, user_id, title, message, date, time, is_read, type, created_timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [notif.id, notif.user_id, notif.title, notif.message, notif.date, notif.time, notif.is_read, notif.type, notif.created_timestamp]
    );
  } else {
    memoryStore.notifications.unshift(notif);
  }
  return notif;
}

export async function dbGetNotifications(userId?: string): Promise<DBNotification[]> {
  const db = await getDB();
  if (db) {
    if (userId) {
      return await db.getAllAsync<DBNotification>(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_timestamp DESC',
        [userId]
      );
    }
    return await db.getAllAsync<DBNotification>(
      'SELECT * FROM notifications ORDER BY created_timestamp DESC'
    );
  }
  return userId ? memoryStore.notifications.filter((n) => n.user_id === userId) : memoryStore.notifications;
}

export async function dbMarkNotificationsRead(userId?: string): Promise<void> {
  const db = await getDB();
  if (db) {
    if (userId) {
      await db.runAsync('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await db.runAsync('UPDATE notifications SET is_read = 1');
    }
  } else {
    memoryStore.notifications.forEach((n) => {
      if (!userId || n.user_id === userId) n.is_read = 1;
    });
  }
}

export async function dbClearNotifications(userId?: string): Promise<void> {
  const db = await getDB();
  if (db) {
    if (userId) {
      await db.runAsync('DELETE FROM notifications WHERE user_id = ?', [userId]);
    } else {
      await db.runAsync('DELETE FROM notifications');
    }
  } else {
    if (userId) {
      memoryStore.notifications = memoryStore.notifications.filter((n) => n.user_id !== userId);
    } else {
      memoryStore.notifications = [];
    }
  }
}
