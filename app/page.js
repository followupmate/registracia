"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { INDIVIDUAL_SPORTS, TEAM_SPORTS } from "@/lib/sports";
import {
  fetchRegistrations,
  addRegistration as dbAdd,
  updateRegistration as dbUpdate,
  deleteRegistration as dbDelete,
  deleteAllRegistrations as dbDeleteAll,
  checkDuplicateEmail,
} from "@/lib/db";

/* ─── Theme ─── */
const light = {
  bg: "bg-gray-100", card: "bg-white", text: "text-gray-900", textSec: "text-gray-500",
  textMuted: "text-gray-400", border: "border-gray-300", inputBg: "bg-white",
  inputBorder: "border-gray-300", ring: "ring-magenta",
};
const dark = {
  bg: "bg-[#121212]", card: "bg-[#1e1e1e]", text: "text-gray-100", textSec: "text-gray-400",
  textMuted: "text-gray-500", border: "border-gray-700", inputBg: "bg-[#2a2a2a]",
  inputBorder: "border-gray-600", ring: "ring-magenta-dark",
};

export default function Page() {
  const [page, setPage] = useState("home");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const th = isDark ? dark : light;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchRegistrations();
      setRegistrations(data);
    } catch (e) {
      showToast("Chyba pri načítaní dát", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  /* Hash routing */
  useEffect(() => {
    const h = () => {
      const hash = window.location.hash.replace("#", "");
      if (["register", "admin"].includes(hash)) setPage(hash);
    };
    h();
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    window.location.hash = p === "home" ? "" : p;
  }, []);

  const handleAdd = useCallback(async (reg) => {
    try {
      await dbAdd(reg);
      await loadData();
      showToast("Registrácia úspešná! ✅");
      navigate("success");
    } catch (e) {
      if (e.message === "DUPLICATE_EMAIL") {
        showToast("Email už je registrovaný", "error");
      } else {
        showToast("Chyba pri registrácii", "error");
      }
    }
  }, [loadData, showToast, navigate]);

  const handleUpdate = useCallback(async (email, reg) => {
    try {
      await dbUpdate(email, reg);
      await loadData();
      showToast("Registrácia aktualizovaná! ✅");
      navigate("success");
    } catch (e) {
      showToast("Chyba pri aktualizácii", "error");
    }
  }, [loadData, showToast, navigate]);

  const handleDelete = useCallback(async (id) => {
    try {
      await dbDelete(id);
      await loadData();
      showToast("Registrácia zmazaná");
    } catch (e) {
      showToast("Chyba pri mazaní", "error");
    }
  }, [loadData, showToast]);

  const [confirmReset, setConfirmReset] = useState(false);
  const handleReset = useCallback(async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    try {
      await dbDeleteAll();
      await loadData();
      setConfirmReset(false);
      showToast("Všetky registrácie vymazané");
    } catch (e) {
      showToast("Chyba pri resetovaní", "error");
    }
  }, [confirmReset, loadData, showToast]);

  const getCount = useCallback((id) => registrations.filter((r) => r.activities?.includes(id)).length, [registrations]);
  const getTeamCount = useCallback((id) => registrations.filter((r) => r.team_sports?.includes(id)).length, [registrations]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${isDark ? "bg-[#121212]" : "bg-gray-100"}`}>
        <div className="w-8 h-8 border-3 border-gray-300 border-t-magenta rounded-full animate-spin" />
        <p className={`mt-4 ${th.textSec}`}>Načítavam...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${th.bg} ${th.text}`}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm z-50 shadow-xl ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 ${isDark ? "bg-[#b8005c]" : "bg-magenta"}`}>
        <div className="max-w-3xl mx-auto px-5 py-3 flex justify-between items-center">
          <h1
            className="text-xl font-extrabold text-white cursor-pointer"
            onClick={() => { navigate("home"); setAdminAuth(false); }}
          >
            🏆 Športový Deň 2026
          </h1>
          <div className="flex gap-2 items-center">
            <button
              className="bg-white/15 text-white border-none rounded-lg px-2.5 py-1.5 text-base cursor-pointer"
              onClick={() => setIsDark((d) => !d)}
              title={isDark ? "Svetlý režim" : "Tmavý režim"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            {page !== "home" && (
              <button className="bg-white/20 text-white border-none rounded-lg px-3.5 py-1.5 text-sm font-semibold cursor-pointer" onClick={() => navigate("home")}>
                ← Späť
              </button>
            )}
            <button
              className={`text-white border-none rounded-lg px-3.5 py-1.5 text-sm font-semibold cursor-pointer ${page === "admin" ? "bg-white/35" : "bg-white/20"}`}
              onClick={() => navigate("admin")}
            >
              📊 Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto pb-10">
        {page === "home" && <HomePage navigate={navigate} regCount={registrations.length} th={th} />}
        {page === "register" && (
          <RegisterForm
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
            registrations={registrations}
            getCount={getCount}
            getTeamCount={getTeamCount}
            th={th}
            isDark={isDark}
          />
        )}
        {page === "success" && <SuccessPage navigate={navigate} th={th} />}
        {page === "admin" && (
          <AdminPanel
            registrations={registrations}
            adminAuth={adminAuth}
            setAdminAuth={setAdminAuth}
            handleDelete={handleDelete}
            handleReset={handleReset}
            confirmReset={confirmReset}
            getCount={getCount}
            getTeamCount={getTeamCount}
            refreshData={loadData}
            showToast={showToast}
            th={th}
            isDark={isDark}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`text-center py-6 text-sm border-t ${th.border} ${th.textMuted}`}>
        <p>Športový Deň 2026 • Registrácia otvorená</p>
      </footer>
    </div>
  );
}

/* ═══════════════════ HOME ═══════════════════ */
function HomePage({ navigate, regCount, th }) {
  return (
    <div className="px-4">
      <div className="text-center py-7">
        <span className={`inline-block ${th.card} ${th.textSec} text-xs font-semibold px-3 py-1 rounded-full mb-3 border ${th.border}`}>
          {regCount} registrovaných
        </span>
        <h2 className={`text-2xl font-extrabold mb-2 ${th.text}`}>Pripoj sa k nám!</h2>
        <p className={`text-sm ${th.textSec} max-w-sm mx-auto mb-5 leading-relaxed`}>
          Vyber si z voľných disciplín alebo sa zapoj do tímového turnaja.
        </p>
        <button
          className="bg-magenta hover:bg-magenta/90 text-white border-none px-7 py-3 rounded-xl text-base font-bold cursor-pointer shadow-lg shadow-magenta/25 transition-transform active:scale-95"
          onClick={() => navigate("register")}
        >
          📝 Registrovať sa
        </button>
      </div>

      <h3 className={`text-base font-bold ${th.text} mt-5 mb-2.5 pl-1`}>🏃 Voľné disciplíny</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        {INDIVIDUAL_SPORTS.map((sp) => (
          <div key={sp.id} className={`${th.card} border ${th.border} rounded-xl p-3 flex flex-col gap-0.5 transition-colors`}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{sp.icon}</span>
              <div>
                <strong className={`${th.text} text-sm`}>{sp.name}</strong>
                <div className={`${th.textMuted} text-[11px] leading-tight`}>{sp.description}</div>
              </div>
            </div>
            {sp.afternoon && (
              <span className="inline-block bg-magenta/10 text-magenta text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 w-fit">
                🕐 Popoludní
              </span>
            )}
          </div>
        ))}
      </div>

      <h3 className={`text-base font-bold ${th.text} mt-6 mb-2.5 pl-1`}>🏆 Skupinové turnaje</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        {TEAM_SPORTS.map((sp) => (
          <div key={sp.id} className={`${th.card} border ${th.border} border-l-[3px] border-l-magenta rounded-xl p-3`}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{sp.icon}</span>
              <div>
                <strong className={`${th.text} text-sm`}>{sp.name}</strong>
                <div className={`${th.textMuted} text-[11px] leading-tight`}>{sp.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ REGISTER FORM ═══════════════════ */
function RegisterForm({ handleAdd, handleUpdate, registrations, getCount, getTeamCount, th, isDark }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activities, setActivities] = useState([]);
  const [teamSports, setTeamSports] = useState([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [duplicateReg, setDuplicateReg] = useState(null);
  const [animCard, setAnimCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const activitiesRef = useRef(null);

  const toggle = (id, setter) => {
    setAnimCard(id);
    setTimeout(() => setAnimCard(null), 250);
    setter((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Meno je povinné";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Zadaj platný email";
    if (activities.length === 0 && teamSports.length === 0) e.activities = "Vyber aspoň jednu aktivitu";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.name) scrollTo(nameRef);
      else if (e.email) scrollTo(emailRef);
      else scrollTo(activitiesRef);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const existing = await checkDuplicateEmail(email.trim());
    if (existing && !duplicateReg) {
      setDuplicateReg(existing);
      return;
    }
    setShowConfirm(true);
  };

  const doSubmit = async (isUpdate) => {
    setSubmitting(true);
    const reg = { name: name.trim(), email: email.trim().toLowerCase(), activities, teamSports, note: note.trim() };
    if (isUpdate) {
      await handleUpdate(reg.email, reg);
    } else {
      await handleAdd(reg);
    }
    setSubmitting(false);
  };

  const selectedNames = [
    ...activities.map((id) => INDIVIDUAL_SPORTS.find((s) => s.id === id)).filter(Boolean).map((s) => s.icon + " " + s.name),
    ...teamSports.map((id) => TEAM_SPORTS.find((s) => s.id === id)).filter(Boolean).map((s) => s.icon + " " + s.name),
  ];

  const inputCls = `w-full px-3.5 py-2.5 ${th.inputBg} border ${th.inputBorder} rounded-lg ${th.text} text-sm outline-none transition-colors`;
  const errInputCls = "border-magenta dark:border-magenta-dark";

  /* Duplicate dialog */
  if (duplicateReg) {
    const ea = (duplicateReg.activities || []).map((id) => INDIVIDUAL_SPORTS.find((s) => s.id === id)?.name).filter(Boolean);
    const et = (duplicateReg.team_sports || []).map((id) => TEAM_SPORTS.find((s) => s.id === id)?.name).filter(Boolean);
    return (
      <div className="px-4 pt-4">
        <StepIndicator step={0} th={th} isDark={isDark} />
        <div className={`${th.card} border ${th.border} rounded-2xl p-7 max-w-md mx-auto animate-pop-in`}>
          <div className="text-center text-4xl">⚠️</div>
          <h3 className={`${th.text} text-center my-2 font-bold`}>Email už je registrovaný</h3>
          <p className={`${th.textSec} text-sm text-center mb-3`}>
            <strong>{duplicateReg.name}</strong> ({duplicateReg.email}) je už prihlásený na:
          </p>
          <div className={`${th.textMuted} text-sm text-center mb-4`}>
            {[...ea, ...et].join(", ") || "—"}
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              className="bg-magenta text-white border-none px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              onClick={() => { setDuplicateReg(null); setShowConfirm(true); }}
            >
              ✏️ Aktualizovať registráciu
            </button>
            <button
              className={`${th.card} border ${th.inputBorder} px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${th.text}`}
              onClick={() => setDuplicateReg(null)}
            >
              ← Späť
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Confirmation dialog */
  if (showConfirm) {
    const isUpdate = registrations.some((r) => r.email.toLowerCase() === email.trim().toLowerCase());
    return (
      <div className="px-4 pt-4">
        <StepIndicator step={1} th={th} isDark={isDark} />
        <div className={`${th.card} border ${th.border} rounded-2xl p-7 max-w-md mx-auto animate-pop-in`}>
          <div className="text-center text-4xl">📋</div>
          <h3 className={`${th.text} text-center mt-2 mb-1 font-bold`}>
            {isUpdate ? "Potvrď aktualizáciu" : "Potvrď registráciu"}
          </h3>
          <p className={`${th.textSec} text-sm text-center mb-1`}><strong>{name.trim()}</strong></p>
          <p className={`${th.textMuted} text-xs text-center mb-4`}>{email.trim()}</p>
          <div className={`${th.text} text-sm mb-2`}>Prihlasuješ sa na:</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedNames.map((n, i) => (
              <span key={i} className={`${th.bg} border ${th.border} rounded-md px-2.5 py-1 text-xs ${th.text}`}>{n}</span>
            ))}
          </div>
          {note.trim() && <p className={`${th.textMuted} text-xs mb-3`}>📝 {note.trim()}</p>}
          <div className="flex gap-2">
            <button
              className="flex-1 bg-magenta text-white border-none py-3 rounded-xl text-base font-bold cursor-pointer disabled:opacity-50"
              onClick={() => doSubmit(isUpdate)}
              disabled={submitting}
            >
              {submitting ? "⏳" : "✅"} {isUpdate ? "Aktualizovať" : "Odoslať"}
            </button>
            <button
              className={`flex-1 ${th.card} border ${th.inputBorder} py-3 rounded-xl text-sm font-semibold cursor-pointer ${th.text}`}
              onClick={() => setShowConfirm(false)}
            >
              ← Upraviť
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = activities.length + teamSports.length;

  return (
    <>
    <div className={`px-4 pt-4 ${selectedCount > 0 ? "pb-24" : ""}`}>
      <StepIndicator step={0} th={th} isDark={isDark} />
      <h2 className={`${th.text} text-2xl font-bold mb-5`}>📝 Registračný formulár</h2>

      <div className="mb-5" ref={nameRef}>
        <label className={`block ${th.text} text-sm font-semibold mb-1.5`}>Meno a priezvisko *</label>
        <input className={`${inputCls} ${errors.name ? errInputCls : ""}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ján Novák" />
        {errors.name && <span className="text-magenta text-xs mt-1 inline-block">{errors.name}</span>}
      </div>

      <div className="mb-5" ref={emailRef}>
        <label className={`block ${th.text} text-sm font-semibold mb-1.5`}>Email *</label>
        <input className={`${inputCls} ${errors.email ? errInputCls : ""}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@email.sk" />
        {errors.email && <span className="text-magenta text-xs mt-1 inline-block">{errors.email}</span>}
      </div>

      <div className="mb-5" ref={activitiesRef}>
        <label className={`block ${th.text} text-sm font-semibold mb-1.5`}>
          Voľné disciplíny {errors.activities && <span className="text-magenta text-xs">— {errors.activities}</span>}
        </label>
        <p className={`${th.textSec} text-xs mb-2`}>Vyber jednu alebo viac disciplín</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {INDIVIDUAL_SPORTS.map((sp) => {
            const sel = activities.includes(sp.id);
            return (
              <button
                key={sp.id}
                className={`flex justify-between items-center px-3.5 py-2.5 border rounded-lg text-sm cursor-pointer transition-all ${animCard === sp.id ? "animate-card-pulse" : ""} ${sel ? "bg-magenta border-magenta text-white" : `${th.inputBg} ${th.inputBorder} ${th.text}`}`}
                onClick={() => toggle(sp.id, setActivities)}
              >
                <span className="flex items-center gap-1.5">
                  {sp.icon} {sp.name}
                  {getCount(sp.id) >= 20 && !sel && (
                    <span className="text-[10px] bg-orange-500/15 text-orange-400 px-1 py-0.5 rounded font-semibold">🔥</span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  {sp.afternoon && (
                    <span className={`text-[10px] px-1 py-0.5 rounded ${sel ? "bg-white/20 text-white" : "bg-magenta/10 text-magenta"}`}>PM</span>
                  )}
                  {sel ? (
                    <span className="text-white text-sm font-bold leading-none">✓</span>
                  ) : (
                    <span className={`text-xs ${th.textMuted}`}>{getCount(sp.id)}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <label className={`block ${th.text} text-sm font-semibold mb-1.5`}>Skupinové turnaje (voliteľné)</label>
        <p className={`${th.textSec} text-xs mb-2`}>Môžeš sa prihlásiť do viacerých turnajov.</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {TEAM_SPORTS.map((sp) => {
            const sel = teamSports.includes(sp.id);
            return (
              <button
                key={sp.id}
                className={`flex justify-between items-center px-3.5 py-2.5 border rounded-lg text-sm cursor-pointer transition-all ${animCard === "t-" + sp.id ? "animate-card-pulse" : ""} ${sel ? "bg-tblue border-tblue text-white" : `${th.inputBg} ${th.inputBorder} ${th.text}`}`}
                onClick={() => toggle(sp.id, setTeamSports)}
              >
                <span className="flex items-center gap-1.5">
                  {sp.icon} {sp.name}
                  {getTeamCount(sp.id) >= 20 && !sel && (
                    <span className="text-[10px] bg-orange-500/15 text-orange-400 px-1 py-0.5 rounded font-semibold">🔥</span>
                  )}
                </span>
                {sel ? (
                  <span className="text-white text-sm font-bold leading-none">✓</span>
                ) : (
                  <span className={`text-xs ${th.textMuted}`}>{getTeamCount(sp.id)}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <label className={`block ${th.text} text-sm font-semibold mb-1.5`}>Poznámka (voliteľné)</label>
        <textarea className={`${inputCls} min-h-[60px]`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Niečo, čo by sme mali vedieť? Alergie, obmedzenia..." maxLength={300} />
        <div className={`text-right text-xs mt-0.5 ${note.length > 250 ? "text-orange-400" : th.textMuted}`}>{note.length}/300</div>
      </div>

      <button
        className="w-full py-3.5 bg-magenta text-white border-none rounded-xl text-base font-bold cursor-pointer mt-3 shadow-lg shadow-magenta/25 active:scale-[0.98] transition-transform"
        onClick={handleSubmit}
      >
        ✅ Odoslať registráciu
      </button>
    </div>

    {/* Floating selection summary bar */}
    {selectedCount > 0 && (
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 animate-slide-up pointer-events-none">
        <div className={`max-w-3xl mx-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border pointer-events-auto ${isDark ? "bg-[#1e1e1e] border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex-1 min-w-0">
            <span className="text-magenta font-extrabold">{selectedCount}</span>
            <span className={`${th.textSec} text-sm`}> {selectedCount === 1 ? "aktivita" : selectedCount < 5 ? "aktivity" : "aktivít"} vybraté</span>
            <div className={`text-xs truncate ${th.textMuted} mt-0.5`}>
              {[...activities.map((id) => INDIVIDUAL_SPORTS.find((s) => s.id === id)?.icon), ...teamSports.map((id) => TEAM_SPORTS.find((s) => s.id === id)?.icon)].filter(Boolean).join("  ")}
            </div>
          </div>
          <button
            className="flex-shrink-0 bg-magenta hover:bg-magenta/90 text-white border-none px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer shadow-lg shadow-magenta/25 active:scale-95 transition-transform"
            onClick={handleSubmit}
          >
            Pokračovať →
          </button>
        </div>
      </div>
    )}
    </>
  );
}

/* ═══════════════════ SUCCESS ═══════════════════ */
function SuccessPage({ navigate, th }) {
  return (
    <div className="px-4 text-center pt-16">
      <div className="text-6xl">🎉</div>
      <h2 className={`${th.text} text-3xl font-extrabold mt-4 mb-2`}>Registrácia úspešná!</h2>
      <p className={`${th.textSec} max-w-sm mx-auto mb-8`}>
        Ďakujeme za registráciu. Tešíme sa na teba na Športovom dni!
      </p>
      <button
        className="bg-magenta text-white border-none px-7 py-3 rounded-xl text-base font-bold cursor-pointer shadow-lg shadow-magenta/25"
        onClick={() => navigate("home")}
      >
        ← Na úvod
      </button>
    </div>
  );
}

/* ═══════════════════ STEP INDICATOR ═══════════════════ */
function StepIndicator({ step, th, isDark }) {
  const steps = ["Formulár", "Potvrdenie", "Hotovo!"];
  return (
    <div className="flex items-start mb-5 select-none">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < step ? "bg-magenta/20 text-magenta" : i === step ? "bg-magenta text-white shadow-md shadow-magenta/30" : `${th.card} border ${th.border} ${th.textMuted}`}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-[11px] mt-1 font-medium whitespace-nowrap transition-colors ${i === step ? th.text : th.textMuted}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors duration-300 ${i < step ? "bg-magenta/40" : isDark ? "bg-gray-700" : "bg-gray-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════ ADMIN ═══════════════════ */
function AdminPanel({ registrations, adminAuth, setAdminAuth, handleDelete, handleReset, confirmReset, getCount, getTeamCount, refreshData, showToast, th, isDark }) {
  const [pin, setPin] = useState("");
  const [filter, setFilter] = useState("all");
  const [pinError, setPinError] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [pendingDelete, setPendingDelete] = useState(null);

  const inputCls = `w-full px-3.5 py-2.5 ${th.inputBg} border ${th.inputBorder} rounded-lg ${th.text} text-sm outline-none transition-colors`;

  if (!adminAuth) {
    const tryPin = async () => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const data = await res.json();
        if (data.success) setAdminAuth(true);
        else setPinError(true);
      } catch {
        setPinError(true);
      }
    };

    return (
      <div className="px-4 text-center pt-16">
        <h2 className={`${th.text} mb-4 text-xl font-bold`}>🔐 Admin prístup</h2>
        <p className={`${th.textSec} mb-4`}>Zadaj PIN pre prístup</p>
        <input
          className={`${inputCls} max-w-[200px] text-center mx-auto block ${pinError ? "border-magenta" : ""}`}
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setPinError(false); }}
          placeholder="PIN"
          onKeyDown={(e) => e.key === "Enter" && tryPin()}
        />
        {pinError && <span className="text-magenta text-xs mt-2 inline-block">Nesprávny PIN</span>}
        <button className="bg-magenta text-white border-none px-7 py-3 rounded-xl text-base font-bold cursor-pointer mt-4" onClick={tryPin}>
          Odomknúť
        </button>
      </div>
    );
  }

  const onlyInd = registrations.filter((r) => r.activities?.length > 0 && !(r.team_sports?.length > 0)).length;
  const onlyTeam = registrations.filter((r) => !(r.activities?.length > 0) && r.team_sports?.length > 0).length;
  const bothCount = registrations.filter((r) => r.activities?.length > 0 && r.team_sports?.length > 0).length;

  let filtered = filter === "all" ? registrations
    : filter === "individual" ? registrations.filter((r) => r.activities?.length > 0)
    : registrations.filter((r) => r.team_sports?.length > 0);

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return a.name.localeCompare(b.name, "sk");
  });

  const doRefresh = async () => {
    await refreshData();
    showToast("Dáta aktualizované 🔄");
  };

  const btnCls = `${th.card} border ${th.inputBorder} ${th.text} px-3.5 py-1.5 rounded-lg cursor-pointer text-sm font-semibold`;
  const filterCls = (active) => `border ${th.inputBorder} ${th.textSec} px-3 py-1 rounded-md cursor-pointer text-xs transition-colors ${active ? (isDark ? "bg-gray-700" : "bg-gray-200") : "bg-transparent"}`;

  return (
    <div className="px-4 pt-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className={`${th.text} text-xl font-bold`}>📊 Admin prehľad</h2>
        <div className="flex gap-2 flex-wrap">
          <button className={btnCls} onClick={doRefresh}>🔄 Refresh</button>
<button
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer text-white border-none ${confirmReset ? "bg-red-900" : "bg-red-600"}`}
            onClick={handleReset}
          >
            {confirmReset ? "⚠️ Klikni znova" : "🗑️ Reset"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-2.5 mt-5">
        {[
          { val: registrations.length, label: "Celkom", color: "text-magenta" },
          { val: onlyInd, label: "Len disciplíny", color: "text-tblue" },
          { val: onlyTeam, label: "Len turnaje", color: "text-tgold" },
          { val: bothCount, label: "Oboje", color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className={`${th.card} border ${th.border} rounded-xl p-3.5 text-center transition-colors`}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.val}</div>
            <div className={`${th.textSec} text-xs`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="mt-6">
        <h3 className={`${th.text} text-sm font-bold mb-3`}>Záujem o disciplíny</h3>
        {INDIVIDUAL_SPORTS.map((sp) => {
          const c = getCount(sp.id);
          const max = Math.max(...INDIVIDUAL_SPORTS.map((x) => getCount(x.id)), 1);
          return (
            <div key={sp.id} className="mb-2">
              <div className={`flex justify-between text-xs ${th.textSec} mb-0.5`}>
                <span>{sp.icon} {sp.name} {sp.afternoon ? <span className="text-magenta text-[11px]">(PM)</span> : ""}</span>
                <span>{c}</span>
              </div>
              <div className={`h-1.5 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <div className="h-full bg-magenta rounded-full transition-all duration-300" style={{ width: c > 0 ? `${Math.max((c / max) * 100, 4)}%` : "0%" }} />
              </div>
            </div>
          );
        })}
        <h3 className={`${th.text} text-sm font-bold mb-3 mt-4`}>Záujem o turnaje</h3>
        {TEAM_SPORTS.map((sp) => {
          const c = getTeamCount(sp.id);
          const max = Math.max(...TEAM_SPORTS.map((x) => getTeamCount(x.id)), 1);
          return (
            <div key={sp.id} className="mb-2">
              <div className={`flex justify-between text-xs ${th.textSec} mb-0.5`}>
                <span>{sp.icon} {sp.name}</span>
                <span>{c}</span>
              </div>
              <div className={`h-1.5 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <div className="h-full bg-tblue rounded-full transition-all duration-300" style={{ width: c > 0 ? `${Math.max((c / max) * 100, 4)}%` : "0%" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="mt-6 mb-3">
        <input className={`${inputCls} mb-2.5`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Hľadať podľa mena alebo emailu..." />
        <div className="flex gap-1.5 flex-wrap items-center">
          {["all", "individual", "team"].map((f) => (
            <button key={f} className={filterCls(filter === f)} onClick={() => setFilter(f)}>
              {f === "all" ? "Všetci" : f === "individual" ? "Disciplíny" : "Turnaje"}
            </button>
          ))}
          <span className={`${th.textMuted} text-xs mx-0.5`}>|</span>
          {["newest", "oldest", "name"].map((o) => (
            <button key={o} className={filterCls(sortBy === o)} onClick={() => setSortBy(o)}>
              {o === "newest" ? "Najnovšie" : o === "oldest" ? "Najstaršie" : "Meno A→Z"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className={`${th.textMuted} text-center py-8`}>{search.trim() ? "Žiadne výsledky" : "Žiadne registrácie"}</p>
      ) : (
        <>
          <p className={`${th.textMuted} text-xs mb-2`}>{filtered.length} záznamov</p>
          {filtered.map((r) => (
            <div key={r.id} className={`flex items-start p-3 ${th.card} rounded-xl mb-2 border ${th.border} transition-colors`}>
              <div className="flex-1">
                <div className={`${th.text} font-semibold`}>{r.name}</div>
                <div className={`${th.textSec} text-sm`}>{r.email}</div>
                <div className={`text-xs ${th.textMuted} mt-1`}>
                  {(r.activities || []).map((a) => INDIVIDUAL_SPORTS.find((s) => s.id === a)?.name).filter(Boolean).join(", ")}
                  {r.team_sports?.length > 0 && (
                    <span className="text-tblue">
                      {r.activities?.length ? " • " : ""}
                      {r.team_sports.map((a) => TEAM_SPORTS.find((s) => s.id === a)?.name).filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
                {r.note && <div className={`text-xs ${th.textMuted} mt-0.5`}>📝 {r.note}</div>}
                <div className={`text-[11px] ${th.textMuted} mt-0.5`}>{new Date(r.created_at).toLocaleString("sk")}</div>
              </div>
              {pendingDelete === r.id ? (
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <button
                    className="bg-red-600 text-white border-none px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                    onClick={() => { handleDelete(r.id); setPendingDelete(null); }}
                  >Zmazať</button>
                  <button
                    className={`bg-transparent border-none ${th.textMuted} cursor-pointer text-xs px-1`}
                    onClick={() => setPendingDelete(null)}
                  >Zrušiť</button>
                </div>
              ) : (
                <button
                  className={`bg-transparent border-none ${th.textMuted} hover:text-red-500 cursor-pointer text-base px-2 py-1 transition-colors flex-shrink-0`}
                  onClick={() => { setPendingDelete(r.id); setTimeout(() => setPendingDelete(null), 3000); }}
                >✕</button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
