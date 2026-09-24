/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { AdministrasiTahunState } from "../types";
import { MessageSquare, Flame, ShieldAlert, CheckCircle, GraduationCap } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function RefleksiPenutup({ state, onChange }: Props) {
  const { identitas, refleksiTahunan } = state;

  const handleUpdateRefleksiField = (field: keyof typeof state.refleksiTahunan, value: string) => {
    onChange((prev) => ({
      ...prev,
      refleksiTahunan: {
        ...prev.refleksiTahunan,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* --- SECTION 18: REFLEKSI GURU TAHUNAN --- */}
      <section id="doc-refleksi" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8 text-left">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <MessageSquare aria-hidden="true" className="h-6 w-6 text-forest print:hidden" />
              REFLEKSI GURU TAHUNAN (SWOT PEDAGOGIS)
            </h2>
            <p className="text-xs font-semibold text-warm-secondary uppercase tracking-widest mt-1">
              SELF-EVALUATION PENYELENGGARAAN PEMBELAJARAN MODEL DEEP LEARNING SELAMA 1 TAHUN AJARAN FULL
            </p>
          </div>

          <div className="bg-forest/10 p-6 rounded-2xl border border-forest/20 text-xs">
            <span className="font-extrabold text-forest uppercase tracking-wider block text-[10px] mb-2">Evaluasi Utama & Masalah Operasional</span>
            <div className="space-y-1">
              <label htmlFor="kendala-utama" className="font-semibold block text-warm-secondary">Logiko-Pedagogical Milestone Terbesar & Kendala Utama</label>
              <textarea
                id="kendala-utama"
                rows={3}
                value={refleksiTahunan.kendalaUtama}
                onChange={(e) => handleUpdateRefleksiField("kendalaUtama", e.target.value)}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none font-semibold text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-6 text-xs">
            <h4 className="font-bold text-warm-text uppercase tracking-wider block">Matriks Analisis SWOT Guru Profesional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strength */}
              <div className="p-5 bg-emerald-50/10 border-l-4 border-emerald-500 rounded-r-2xl space-y-2">
                <span className="font-extrabold text-emerald-800 uppercase tracking-widest text-[11px] flex items-center gap-1">
                  <CheckCircle aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                  Kekuatan / Keberhasilan (Strengths)
                </span>
                <textarea
                  rows={4}
                  value={refleksiTahunan.keberhasilan}
                  onChange={(e) => handleUpdateRefleksiField("keberhasilan", e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] text-warm-text leading-relaxed font-semibold focus:outline-none resize-none"
                />
              </div>

              {/* Weakness */}
              <div className="p-5 bg-red-50/10 border-l-4 border-red-500 rounded-r-2xl space-y-2">
                <span className="font-extrabold text-red-800 uppercase tracking-widest text-[11px] flex items-center gap-1">
                  <ShieldAlert aria-hidden="true" className="h-4 w-4 text-red-600" />
                  Kelemahan / Tantangan (Weaknesses)
                </span>
                <textarea
                  rows={4}
                  value={refleksiTahunan.tantangan}
                  onChange={(e) => handleUpdateRefleksiField("tantangan", e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] text-warm-text leading-relaxed font-semibold focus:outline-none resize-none"
                />
              </div>

              {/* Opportunity */}
              <div className="p-5 bg-blue-50/10 border-l-4 border-blue-500 rounded-r-2xl space-y-2">
                <span className="font-extrabold text-blue-800 uppercase tracking-widest text-[11px] flex items-center gap-1">
                  <Flame aria-hidden="true" className="h-4 w-4 text-blue-600" />
                  Peluang / Rencana Perbaikan (Opportunities)
                </span>
                <textarea
                  rows={4}
                  value={refleksiTahunan.rencanaPerbaikan}
                  onChange={(e) => handleUpdateRefleksiField("rencanaPerbaikan", e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] text-warm-text leading-relaxed font-semibold focus:outline-none resize-none"
                />
              </div>

              {/* Threat */}
              <div className="p-5 bg-amber-50/10 border-l-4 border-amber-500 rounded-r-2xl space-y-2">
                <span className="font-extrabold text-amber-800 uppercase tracking-widest text-[11px] flex items-center gap-1">
                  <GraduationCap aria-hidden="true" className="h-4 w-4 text-amber-600" />
                  Hambatan / Hasil Evaluasi (Threats)
                </span>
                <textarea
                  rows={4}
                  value={refleksiTahunan.hasilEvaluasi}
                  onChange={(e) => handleUpdateRefleksiField("hasilEvaluasi", e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] text-warm-text leading-relaxed font-semibold focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text font-medium">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p>
            <p className="font-bold text-warm-text underline text-xs">Asesor / Supervisor Sekolah</p>
            <p className="text-[10px] text-warm-muted">NIP. 19780512 200501 2 003</p>
          </div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 19: PENUTUP --- */}
      <section id="doc-penutup" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8 text-center my-auto">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold text-forest tracking-tight">KATA PENUTUP & DEDIKASI</h1>
            <p className="text-xs font-bold text-warm-text uppercase tracking-widest">
              PORTAL ADMINISTRASI GURU TAHUNAN MODEL DEEP LEARNING
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-6 text-xs text-warm-secondary leading-relaxed font-medium">
            <p>
              Dengan memanjatkan puji dan syukur kehadirat Tuhan Yang Maha Esa, seluruh berkas perencanaan program pengajaran tahunan, semesteran, alur tujuan kurikulum merdeka (ATP), modul instasional ajar, hingga instrumen restoratif bimbingan konseling sederhana ini telah dirancang secara tuntas, empiris, realistis, dan modular.
            </p>
            <p>
              Besar harapan penyusun agar jalinan silabus administrasi yang diselaraskan dengan asas "Deep Learning" ini dapat mengantarkan anak didik melintasi garis ketuntasan logika secara merdeka, bahagia, penuh rasa ingin tahu, dan kritis bernalar positif demi kedaulatan bangsa Indonesia yang berbudi luhur.
            </p>
            <p className="italic text-warm-muted pt-4">
              "Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani."<br/>— Ki Hajar Dewantara
            </p>
          </div>
        </div>

        {/* Tanda Tangan Resmi Akhir */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text font-semibold">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengesahkan,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaGuru}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
