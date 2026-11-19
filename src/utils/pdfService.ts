import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { Disease, DiseaseDiagnosisResult } from '../core/certainty-factor/types';
import { SYMPTOMS, DIAGNOSTIC_RULES } from '../data/knowledgeBase';
import { UserProfile } from '../store/diagnosisStore';

interface DiagnosisPdfParams {
  primary: DiseaseDiagnosisResult;
  differentials?: DiseaseDiagnosisResult[];
  user?: UserProfile | null;
}

/**
 * Helper untuk membuat dan membagikan PDF secara aman di Android dan iOS
 * Menggunakan Base64 in-memory write untuk menghindari permission lock pada direktori Print Android
 */
const safeGenerateAndSharePdf = async (
  html: string,
  baseFileName: string,
  dialogTitle: string
) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Fitur Berbagi', 'Perangkat ini tidak mendukung fitur berbagi file.');
      return;
    }

    // 1. Generate PDF dengan base64: true agar byte data terbaca langsung di memori native
    const printResult = await Print.printToFileAsync({
      html,
      base64: true
    });

    const cleanName = baseFileName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetFileName = `${cleanName}_${Date.now()}.pdf`;
    const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const targetUri = `${targetDir}${targetFileName}`;

    if (printResult.base64) {
      // 2. Tulis data Base64 langsung ke documentDirectory aplikasi
      // Ini menyelesaikan masalah 'Location isn't readable' dan 'Not allowed to read file' di Android
      await FileSystem.writeAsStringAsync(targetUri, printResult.base64, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(targetUri, {
        mimeType: 'application/pdf',
        dialogTitle,
        UTI: '.pdf'
      });
    } else {
      // Fallback jika platform tidak mengembalikan base64
      await Sharing.shareAsync(printResult.uri, {
        mimeType: 'application/pdf',
        dialogTitle,
        UTI: '.pdf'
      });
    }
  } catch (err: any) {
    console.error('Error in safeGenerateAndSharePdf:', err);
    Alert.alert('Gagal Ekspor', 'Terjadi kesalahan saat memproses laporan PDF.');
  }
};

/**
 * Generate dan bagikan PDF Hasil Diagnosis Klinis
 */
export const shareDiagnosisResultPdf = async ({
  primary,
  differentials = [],
  user
}: DiagnosisPdfParams): Promise<void> => {
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
      <div style="margin-top: 22px;">
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          Diagnosa Banding
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
          <tbody>
            ${differentials
              .map(
                (d) => `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 7px 0; font-weight: 600; color: #1E293B;">${d.disease.name} <span style="font-style: italic; color: #64748B; font-weight: 400;">(${d.disease.latinName})</span></td>
                <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #2563EB;">${d.percentage}% CF</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Hasil Diagnosis - OhMyChick</title>
      <style>
        @page {
          margin: 18mm;
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
          margin-bottom: 18px;
        }
        .brand-title {
          font-size: 22px;
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
          gap: 10px;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 18px;
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
          margin-bottom: 18px;
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
          margin-top: 16px;
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
          padding: 7px 10px;
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
          margin-bottom: 10px;
          font-size: 12px;
          color: #334155;
          line-height: 1.6;
        }
        .footer-disclaimer {
          margin-top: 26px;
          padding-top: 10px;
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
        Digunakan sebagai acuan rujukan penanganan cepat dan mitigasi mortalitas kawanan ayam broiler di kandang.
      </div>
    </body>
    </html>
  `;

  await safeGenerateAndSharePdf(
    html,
    `Diagnosis_${primary.disease.name}`,
    `Laporan Diagnosis - ${primary.disease.name}`
  );
};

/**
 * Generate dan bagikan PDF Informasi Penyakit / Rujukan Riwayat
 */
export const shareDiseaseInfoPdf = async (
  disease: Disease,
  user?: UserProfile | null
): Promise<void> => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const rules = DIAGNOSTIC_RULES.filter((r) => r.diseaseId === disease.id);
  const symptomRows = rules
    .map((r, idx) => {
      const s = SYMPTOMS.find((x) => x.id === r.symptomId);
      return `
        <tr>
          <td style="text-align: center; color: #64748B;">${idx + 1}</td>
          <td style="font-weight: 600; color: #1E293B;">${s?.code || r.symptomId}</td>
          <td>${s?.name || r.symptomId}</td>
          <td style="text-align: right; font-weight: 600; color: #2563EB;">${r.cfExpert}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${disease.name} - OhMyChick</title>
      <style>
        @page {
          margin: 18mm;
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
          margin-bottom: 18px;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #2563EB;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748B;
        }
        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748B;
        }
        .primary-box {
          background-color: #EFF6FF;
          border: 1.5px solid #BFDBFE;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 18px;
        }
        .disease-name {
          font-size: 20px;
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
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .text-box {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 10px;
          font-size: 12px;
          color: #334155;
          line-height: 1.6;
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
          padding: 7px 10px;
          border: 1px solid #CBD5E1;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #E2E8F0;
          color: #334155;
        }
        .footer-disclaimer {
          margin-top: 26px;
          padding-top: 10px;
          border-top: 1px dashed #CBD5E1;
          font-size: 10px;
          color: #94A3B8;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header-top">
        <div>
          <div class="brand-title">OhMyChick</div>
          <div class="brand-sub">Lembar Informasi Klinis Patologi Broiler</div>
        </div>
        <div class="doc-meta">
          <div>Tanggal Unduh: ${dateStr}</div>
          <div>Pemohon: ${user?.name || 'Peternak Broiler'}</div>
        </div>
      </div>

      <div class="primary-box">
        <div class="disease-name">${disease.name}</div>
        <div class="disease-latin">${disease.latinName} (${disease.code})</div>
        <div class="risk-pill">TINGKAT RESIKO: ${disease.riskLevel}</div>
      </div>

      <div class="section-title">Deskripsi Patogen & Etiologi</div>
      <div class="text-box">
        ${disease.description}
        <div style="margin-top: 8px; font-weight: 600; color: #1E293B;">
          Penyebab Utama: <span style="font-weight: 400; color: #475569;">${disease.causes}</span>
        </div>
      </div>

      <div class="section-title">Karakteristik Gejala & Bobot Pakar</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25px; text-align: center;">No</th>
            <th style="width: 50px;">Kode</th>
            <th>Gejala Klinis</th>
            <th style="width: 80px; text-align: right;">CF Pakar</th>
          </tr>
        </thead>
        <tbody>
          ${symptomRows}
        </tbody>
      </table>

      <div class="section-title">Penanganan Medis & Terapi</div>
      <div class="text-box">
        ${disease.treatment}
      </div>

      <div class="section-title">Biosekuriti Kandang & Pencegahan</div>
      <div class="text-box">
        ${disease.prevention}
      </div>

      <div class="footer-disclaimer">
        Diterbitkan oleh OhMyChick Expert System. Referensi: Shortliffe & Buchanan (1975).
      </div>
    </body>
    </html>
  `;

  await safeGenerateAndSharePdf(
    html,
    `Info_${disease.name}`,
    `Informasi Penyakit - ${disease.name}`
  );
};
