import React, { useState } from "react";
import { AdminMasterConfig } from "../utils";
import {
  School,
  ShieldAlert,
  UserCheck,
  KeyRound,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap
} from "lucide-react";

interface Props {
  config: AdminMasterConfig;
  onLogin: (role: "admin" | "guru", teacherId?: string) => void;
}

export default function LoginScreen({ config, onLogin }: Props) {
  const [role, setRole] = useState<"admin" | "guru">("guru");
  const [selectedTeacherId, setSelectedTeacherId] = useState(config.gurus[0]?.id || "");
  const [adminUsername, setAdminUsername] = useState(config.adminUsername || "admin");
  const [adminPassword, setAdminPassword] = useState(config.adminPassword || "superadmin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    setTimeout(() => {
      if (role === "admin") {
        if (adminUsername.trim().toLowerCase() === (config.adminUsername || "admin").toLowerCase() && adminPassword === (config.adminPassword || "superadmin123")) {
          onLogin("admin");
        } else {
          setError("Kombinasi ID Admin dan Password tidak valid!");
          setIsSubmitting(false);
        }
      } else {
        if (!selectedTeacherId) {
          setError("Silakan pilih pendidik / guru untuk masuk!");
          setIsSubmitting(false);
          return;
        }
        onLogin("guru", selectedTeacherId);
      }
    }, 600);
  };

  const activeTeacher = config.gurus.find(g => g.id === selectedTeacherId);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 pb-6 border-b border-dark-border text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center shadow-sm">
              <School className="w-9 h-9 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold tracking-wider text-dark-text uppercase flex items-center justify-center gap-1.5">
              <span>SIAS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest" aria-hidden="true" />
              <span className="text-dark-secondary">SMAN 1 BANDUNG</span>
            </h1>
            <p className="text-[10px] text-trust font-bold tracking-widest uppercase">
              Sistem Integrasi Administrasi Sekolah
            </p>
          </div>
        </div>
        <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-dark-secondary uppercase tracking-widest block" id="role-label">
              Pilih Akses Portal
            </label>
            <div
              className="relative p-1 bg-dark-bg border border-dark-border rounded-xl grid grid-cols-2 gap-1"
              role="radiogroup"
              aria-labelledby="role-label"
            >
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-surface border border-dark-border rounded-lg shadow-sm transition-all duration-200 ${
                  role === "guru" ? "left-1" : "left-[calc(50%+2px)]"
                }`}
                aria-hidden="true"
              />
              <button
                type="button"
                role="radio"
                aria-checked={role === "guru"}
                onClick={() => { setRole("guru"); setError(""); }}
                className={`relative py-2.5 rounded-lg text-xs font-bold uppercase transition-colors duration-200 z-10 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 ${
                  role === "guru" ? "text-forest font-bold" : "text-dark-secondary hover:text-dark-text"
                }`}
              >
                <UserCheck className="h-4 w-4" aria-hidden="true" />
                <span>Pendidik</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={role === "admin"}
                onClick={() => { setRole("admin"); setError(""); }}
                className={`relative py-2.5 rounded-lg text-xs font-bold uppercase transition-colors duration-200 z-10 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 ${
                  role === "admin" ? "text-forest font-bold" : "text-dark-secondary hover:text-dark-text"
                }`}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>Admin</span>
              </button>
            </div>
          </div>
          <div className="border-t border-dark-border pt-5 space-y-4">
            {role === "admin" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="admin-username" className="text-[10px] font-bold text-dark-secondary uppercase tracking-wide">ID Administrator</label>
                    <span className="text-[9px] text-dark-secondary">Contoh: admin</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-secondary pointer-events-none" aria-hidden="true">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="admin-username"
                      type="text"
                      required
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-text focus:outline-none focus:border-forest transition-colors font-sans"
                      placeholder="Masukkan ID Admin"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="admin-password" className="text-[10px] font-bold text-dark-secondary uppercase tracking-wide">Kunci Keamanan</label>
                    <span className="text-[9px] text-dark-secondary">Contoh: superadmin123</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-secondary pointer-events-none" aria-hidden="true">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-text focus:outline-none focus:border-forest transition-colors font-mono tracking-wide"
                      placeholder="Masukkan Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-secondary hover:text-dark-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-forest"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4.5">
                <div className="space-y-2">
                  <label htmlFor="teacher-select" className="text-[10px] font-bold text-dark-secondary uppercase tracking-wide block">
                    Pilih Akun Pendidik
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-secondary pointer-events-none" aria-hidden="true">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <select
                      id="teacher-select"
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-text focus:outline-none focus:border-forest transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>-- Pilih Akun Mengajar --</option>
                      {config.gurus.map((g) => (
                        <option key={g.id} value={g.id} className="bg-dark-surface text-dark-text">
                          {g.namaGuru} ({g.mapel.split(" ")[0]})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-dark-secondary pointer-events-none" aria-hidden="true">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {activeTeacher && (
                  <div className="bg-dark-bg border border-dark-border p-3.5 rounded-xl text-xs leading-relaxed space-y-1.5">
                    <div className="flex justify-between items-center text-dark-secondary">
                      <span className="font-bold uppercase tracking-wider text-[9px]">Mata Pelajaran</span>
                      <span className="text-[9px] bg-dark-surface border border-dark-border px-1.5 py-0.5 rounded text-trust">Fase E / Kelas X</span>
                    </div>
                    <p className="text-dark-text font-bold">{activeTeacher.mapel}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-dark-secondary border-t border-dark-border">
                      <div>NIP: {activeTeacher.nipGuru || "-"}</div>
                      <div className="text-right">Semester: {activeTeacher.semester}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-100 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
            >
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-forest hover:bg-forest-dark disabled:bg-dark-surface disabled:text-dark-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Perangkat Administrasi</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
        <div className="p-5 bg-dark-bg border-t border-dark-border text-center text-[10px] text-dark-secondary font-bold tracking-wider uppercase">
          Kurikulum Merdeka &bull; SMAN 1 Kota Bandung
        </div>
      </div>
    </div>
  );
}
