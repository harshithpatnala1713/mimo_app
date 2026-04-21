import { useState, useEffect, useCallback } from "react";
import { authAPI, ordersAPI, optimizeAPI, inventoryAPI, getToken, saveToken, clearToken } from "./services/api";

// ─── Styles ───────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0c10;--surface:#111318;--surface2:#181c24;
    --border:#222733;--border2:#2d3444;
    --accent:#e8c44a;--accent2:#f0d875;
    --red:#e85c5c;--green:#4ecb8d;--blue:#5b9cf6;
    --text:#e8eaf0;--muted:#6b7280;--muted2:#9ca3af;
    --font:'Syne',sans-serif;--mono:'DM Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font)}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-in{animation:fadeIn .35s ease both}
  .slide-in{animation:slideIn .3s ease both}

  /* spinner */
  .spinner{display:inline-block;width:18px;height:18px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .65s linear infinite;flex-shrink:0}

  /* login */
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse 80% 60% at 50% 0%,#1a1e2e 0%,var(--bg) 70%);position:relative;overflow:hidden}
  .login-wrap::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,.015) 60px,rgba(255,255,255,.015) 61px),repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(255,255,255,.015) 60px,rgba(255,255,255,.015) 61px)}
  .login-card{width:430px;padding:48px 40px;background:var(--surface);border:1px solid var(--border2);border-radius:16px;box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04);animation:fadeIn .5s ease;position:relative;z-index:1}
  .login-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
  .login-logo-icon{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#c89b2a);display:flex;align-items:center;justify-content:center;font-size:18px;color:#0a0c10;font-weight:800}
  .login-logo-text{font-size:20px;font-weight:800;letter-spacing:-.5px}
  .login-logo-text span{color:var(--accent)}
  .login-subtitle{font-size:13px;color:var(--muted);font-family:var(--mono);margin-bottom:24px}
  .role-tabs{display:flex;gap:6px;margin-bottom:14px}
  .role-tab{flex:1;padding:8px;border-radius:7px;border:1px solid var(--border);background:var(--surface2);color:var(--muted2);font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;text-align:center}
  .role-tab.active{border-color:var(--accent);color:var(--accent);background:rgba(232,196,74,.08)}
  .mode-tabs{display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:20px}
  .mode-tab{flex:1;padding:8px;border:none;background:transparent;color:var(--muted2);font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .18s}
  .mode-tab.active{background:var(--surface2);color:var(--text)}
  .field{margin-bottom:16px}
  .field label{display:block;font-size:11px;font-family:var(--mono);color:var(--muted2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
  .field input{width:100%;padding:11px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font);font-size:14px;transition:border-color .2s,box-shadow .2s;outline:none}
  .field input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(232,196,74,.12)}
  .btn-primary{width:100%;padding:13px;margin-top:8px;background:var(--accent);color:#0a0c10;font-family:var(--font);font-size:14px;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:background .2s,transform .1s;display:flex;align-items:center;justify-content:center;gap:8px}
  .btn-primary:hover:not(:disabled){background:var(--accent2);box-shadow:0 4px 20px rgba(232,196,74,.3)}
  .btn-primary:active:not(:disabled){transform:scale(.98)}
  .btn-primary:disabled{opacity:.6;cursor:not-allowed}
  .login-hint{font-size:11px;font-family:var(--mono);color:var(--muted);text-align:center;margin-top:20px;line-height:1.8}
  .err-msg{font-size:12px;color:var(--red);font-family:var(--mono);margin-top:6px}

  /* shell */
  .app-shell{display:flex;min-height:100vh}
  .sidebar{width:240px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
  .sidebar-logo{padding:22px 20px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
  .sidebar-logo-icon{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,var(--accent),#c89b2a);display:flex;align-items:center;justify-content:center;font-size:14px;color:#0a0c10;font-weight:800}
  .sidebar-logo-text{font-size:15px;font-weight:800;letter-spacing:-.4px}
  .sidebar-logo-text span{color:var(--accent)}
  .sidebar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
  .nav-section-label{font-size:9px;font-family:var(--mono);color:var(--muted);letter-spacing:.12em;text-transform:uppercase;padding:8px 8px 4px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--muted2);transition:all .18s;border:none;background:none;width:100%;text-align:left}
  .nav-item:hover{background:var(--surface2);color:var(--text)}
  .nav-item.active{background:rgba(232,196,74,.1);color:var(--accent)}
  .nav-item .nav-icon{font-size:16px;width:20px;text-align:center}
  .sidebar-footer{padding:16px 12px;border-top:1px solid var(--border)}
  .user-card{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px}
  .avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#5b9cf6,#a855f7);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0}
  .user-name{font-size:13px;font-weight:700}
  .user-role{font-size:10px;font-family:var(--mono);color:var(--muted);text-transform:capitalize}
  .btn-logout{background:none;border:1px solid var(--border);color:var(--muted2);padding:6px 12px;border-radius:6px;font-size:11px;font-family:var(--mono);cursor:pointer;margin-top:10px;width:100%;transition:all .18s}
  .btn-logout:hover{border-color:var(--red);color:var(--red)}

  /* main */
  .main{margin-left:240px;flex:1;min-height:100vh;background:var(--bg)}
  .topbar{padding:20px 32px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg);position:sticky;top:0;z-index:50}
  .topbar-title{font-size:22px;font-weight:800;letter-spacing:-.5px}
  .topbar-subtitle{font-size:12px;font-family:var(--mono);color:var(--muted);margin-top:2px}
  .page-content{padding:32px;animation:fadeIn .3s ease}

  /* stats */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .stats-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
  .stat-card.y::before{background:var(--accent)}
  .stat-card.g::before{background:var(--green)}
  .stat-card.b::before{background:var(--blue)}
  .stat-card.r::before{background:var(--red)}
  .stat-label{font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
  .stat-value{font-size:32px;font-weight:800;margin:8px 0 4px;letter-spacing:-1px}
  .stat-sub{font-size:11px;font-family:var(--mono);color:var(--muted2)}
  .stat-icon{position:absolute;right:18px;top:18px;font-size:28px;opacity:.15}

  /* table */
  .table-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .table-header{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .table-title{font-size:15px;font-weight:700}
  .table-tools{display:flex;gap:8px;align-items:center}
  .search-input{padding:8px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;width:200px;transition:border-color .2s}
  .search-input:focus{border-color:var(--accent)}
  table{width:100%;border-collapse:collapse}
  thead th{text-align:left;padding:10px 16px;font-size:9px;font-family:var(--mono);color:var(--muted);letter-spacing:.1em;text-transform:uppercase;background:var(--surface2);border-bottom:1px solid var(--border)}
  tbody tr{border-bottom:1px solid var(--border);transition:background .15s}
  tbody tr:last-child{border-bottom:none}
  tbody tr:hover{background:var(--surface2)}
  td{padding:12px 16px;font-size:13px}

  /* badges */
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:10px;font-family:var(--mono);font-weight:500}
  .badge.pending {background:rgba(232,196,74,.12);color:var(--accent)}
  .badge.approved{background:rgba(78,203,141,.12);color:var(--green)}
  .badge.rejected{background:rgba(232,92,92,.12); color:var(--red)}
  .badge.active  {background:rgba(78,203,141,.12);color:var(--green)}
  .badge.inactive{background:rgba(232,92,92,.12); color:var(--red)}

  /* action buttons */
  .action-btns{display:flex;gap:6px}
  .btn-icon{width:30px;height:30px;border-radius:6px;border:1px solid var(--border);background:none;color:var(--muted2);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .btn-icon:disabled{opacity:.4;cursor:not-allowed}
  .btn-icon.approve:hover:not(:disabled){border-color:var(--green);color:var(--green);background:rgba(78,203,141,.08)}
  .btn-icon.reject:hover:not(:disabled){border-color:var(--red);color:var(--red);background:rgba(232,92,92,.08)}

  /* form */
  .form-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .form-body{padding:24px}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .form-field{margin-bottom:14px}
  .form-label{display:block;font-size:10px;font-family:var(--mono);color:var(--muted2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}
  .form-input,.form-select,.form-textarea{width:100%;padding:9px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font);font-size:13px;transition:border-color .2s;outline:none}
  .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(232,196,74,.1)}
  .form-select option{background:var(--surface2)}
  .form-textarea{resize:vertical;min-height:80px}
  .btn-save{padding:9px 18px;background:var(--accent);color:#0a0c10;border:none;border-radius:7px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:background .18s;display:flex;align-items:center;gap:8px}
  .btn-save:hover:not(:disabled){background:var(--accent2)}
  .btn-save:disabled{opacity:.6;cursor:not-allowed}

  /* empty / loading */
  .empty{text-align:center;padding:48px 20px}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:.3}
  .empty-text{font-size:14px;color:var(--muted2)}
  .loading-row{display:flex;align-items:center;justify-content:center;gap:12px;padding:40px;color:var(--muted2);font-family:var(--mono);font-size:13px}

  /* toasts */
  .toast-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px}
  .toast{padding:12px 16px;border-radius:8px;font-size:13px;font-weight:600;border:1px solid;display:flex;align-items:center;gap:8px;animation:slideIn .25s ease;min-width:220px}
  .toast.success{background:rgba(78,203,141,.12);border-color:rgba(78,203,141,.3);color:var(--green)}
  .toast.error  {background:rgba(232,92,92,.12); border-color:rgba(232,92,92,.3); color:var(--red)}
  .toast.info   {background:rgba(91,156,246,.12); border-color:rgba(91,156,246,.3);color:var(--blue)}


  /* ── Inventory (Metal Types + Coil Stock) ────────────── */
  .btn-add{padding:8px 16px;background:var(--accent);color:#0a0c10;border:none;border-radius:7px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .18s,box-shadow .18s}
  .btn-add:hover{background:var(--accent2);box-shadow:0 2px 12px rgba(232,196,74,.25)}
  .btn-cancel{padding:8px 16px;background:none;color:var(--muted2);border:1px solid var(--border);border-radius:7px;font-family:var(--font);font-size:12px;cursor:pointer;transition:all .18s}
  .btn-cancel:hover{border-color:var(--border2);color:var(--text)}
  .btn-danger-sm{padding:8px 16px;background:rgba(232,92,92,.15);color:var(--red);border:1px solid rgba(232,92,92,.3);border-radius:7px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .18s}
  .btn-danger-sm:hover{background:rgba(232,92,92,.25)}
  .btn-icon-edit{width:30px;height:30px;border-radius:6px;border:1px solid var(--border);background:none;color:var(--muted2);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .btn-icon-edit:hover{border-color:var(--blue);color:var(--blue);background:rgba(91,156,246,.08)}
  .btn-icon-del{width:30px;height:30px;border-radius:6px;border:1px solid var(--border);background:none;color:var(--muted2);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .btn-icon-del:hover{border-color:var(--red);color:var(--red);background:rgba(232,92,92,.08)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .2s ease}
  .modal-box{background:var(--surface);border:1px solid var(--border2);border-radius:14px;width:520px;max-width:96vw;max-height:90vh;overflow-y:auto;box-shadow:0 40px 100px rgba(0,0,0,.6);animation:fadeIn .25s ease}
  .modal-head{padding:18px 22px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--surface);z-index:1}
  .modal-head-title{font-size:15px;font-weight:800}
  .modal-close-btn{background:none;border:none;color:var(--muted2);cursor:pointer;font-size:20px;line-height:1;padding:2px}
  .modal-close-btn:hover{color:var(--text)}
  .modal-body{padding:20px 22px}
  .modal-foot{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}
  .confirm-text{font-size:14px;color:var(--muted2);line-height:1.6;margin-bottom:4px}
  .confirm-name{font-weight:700;color:var(--text)}

  /* full-page bootstrap spinner */
  .boot-screen{min-height:100vh;display:flex;align-items:center;justify-content:center}
  .boot-spinner{width:40px;height:40px;border-width:3px}

  /* ── Optimization feature ──────────────────────────────── */
  .opt-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .opt-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .opt-card-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px}
  .opt-card-title{font-size:13px;font-weight:700}
  .opt-card-body{padding:18px}
  .opt-order-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;border:1px solid var(--border);margin-bottom:8px;cursor:pointer;transition:all .15s;user-select:none}
  .opt-order-row:hover{border-color:var(--border2);background:var(--surface2)}
  .opt-order-row.selected{border-color:var(--accent);background:rgba(232,196,74,.06)}
  .opt-order-row:last-child{margin-bottom:0}
  .opt-checkbox{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--border2);background:var(--surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
  .opt-checkbox.checked{background:var(--accent);border-color:var(--accent)}
  .opt-checkbox.checked::after{content:'✓';font-size:10px;color:#0a0c10;font-weight:900}
  .opt-order-info{flex:1;min-width:0}
  .opt-order-id{font-size:11px;font-family:var(--mono);color:var(--accent)}
  .opt-order-meta{font-size:12px;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .opt-order-width{font-size:11px;font-family:var(--mono);color:var(--muted);white-space:nowrap}
  .opt-generate-btn{width:100%;padding:11px;background:var(--accent);color:#0a0c10;border:none;border-radius:8px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;transition:background .18s}
  .opt-generate-btn:hover:not(:disabled){background:var(--accent2)}
  .opt-generate-btn:disabled{opacity:.5;cursor:not-allowed}
  .opt-select-hint{font-size:11px;font-family:var(--mono);color:var(--muted);text-align:center;margin-top:10px}

  /* sheet visualizer */
  .sheet-wrap{padding:18px}
  .sheet-meta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px}
  .sheet-meta-item{font-size:11px;font-family:var(--mono);color:var(--muted2)}
  .sheet-meta-item b{color:var(--text)}
  .sheet-outer{position:relative;background:var(--surface2);border:2px solid var(--border2);border-radius:6px;overflow:hidden;height:100px}
  .sheet-cut{position:absolute;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px dashed rgba(255,255,255,.2);transition:opacity .2s;overflow:hidden;padding:2px 4px;cursor:default}
  .sheet-cut:hover{filter:brightness(1.12)}
  .sheet-cut-label{font-size:9px;font-family:var(--mono);color:rgba(0,0,0,.75);font-weight:700;text-align:center;line-height:1.3;pointer-events:none;overflow:hidden;max-width:100%}
  .sheet-cut-width{font-size:8px;font-family:var(--mono);color:rgba(0,0,0,.6);margin-top:2px}
  .sheet-remaining{position:absolute;top:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);border-left:2px dashed var(--border2)}
  .sheet-remaining-label{font-size:10px;font-family:var(--mono);color:var(--muted);writing-mode:horizontal-tb;text-align:center;line-height:1.4}
  .sheet-ruler{display:flex;margin-top:4px;font-size:9px;font-family:var(--mono);color:var(--muted);position:relative;height:14px}
  .sheet-ruler-mark{position:absolute;top:0}

  /* plan summary */
  .plan-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
  .plan-stat{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center}
  .plan-stat-val{font-size:20px;font-weight:800;letter-spacing:-.5px}
  .plan-stat-lbl{font-size:9px;font-family:var(--mono);color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
  .plan-warnings{margin-top:12px}
  .plan-warning-item{font-size:11px;font-family:var(--mono);color:var(--accent);padding:6px 10px;background:rgba(232,196,74,.06);border:1px solid rgba(232,196,74,.15);border-radius:6px;margin-bottom:6px;display:flex;align-items:flex-start;gap:6px}

  /* cuts table */
  .cuts-table-wrap{margin-top:16px;border:1px solid var(--border);border-radius:8px;overflow:hidden}
  .cuts-table-wrap table{margin:0}
  .cuts-table-wrap thead th{background:var(--surface)}

  /* source badge */
  .source-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-family:var(--mono);font-weight:600}
  .source-badge.new_sheet {background:rgba(91,156,246,.12);color:var(--blue)}
  .source-badge.inventory {background:rgba(78,203,141,.12);color:var(--green)}
`;


// ─── Metal types (static master list — no backend needed) ─────
const METAL_TYPES = [
  "Stainless Steel 304",
  "Stainless Steel 316",
  "Galvanized Iron DX51",
  "Cold Rolled SPCE",
  "Aluminium 1050",
];

// ─── Toast hook ───────────────────────────────────────────────
let _tid = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success") => {
    const id = ++_tid;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

// ─── Shared components ────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"} {t.msg}
        </div>
      ))}
    </div>
  );
}

function Spinner({ size = 18 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

function LoadingRow({ text = "Loading…" }) {
  return <div className="loading-row"><Spinner />{text}</div>;
}

// ─── Login / Register ─────────────────────────────────────────
function Login({ onLogin }) {
  const [mode,  setMode]  = useState("login");
  const [role,  setRole]  = useState("customer");
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const HINTS = {
    customer: "customer@metalinv.com / customer123",
    supplier: "supplier@metalinv.com / supplier123",
  };

  const reset = (m) => { setMode(m); setErr(""); setName(""); setEmail(""); setPass(""); };

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let data;
      if (mode === "login") {
        data = await authAPI.login(email.trim(), pass);
      } else {
        if (!name.trim()) { setErr("Name is required"); setBusy(false); return; }
        data = await authAPI.register(name.trim(), email.trim(), pass, role);
      }
      saveToken(data.token);
      onLogin(data.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onKey = e => e.key === "Enter" && submit();

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">M</div>
          <div className="login-logo-text">Metal<span>Inv</span></div>
        </div>
        <div className="login-subtitle">// inventory management system</div>

        <div className="role-tabs">
          {["customer","supplier"].map(r => (
            <button key={r} className={`role-tab ${role===r?"active":""}`}
              onClick={() => { setRole(r); setErr(""); }}>
              {r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>

        <div className="mode-tabs">
          <button className={`mode-tab ${mode==="login"?"active":""}`}    onClick={() => reset("login")}>Sign In</button>
          <button className={`mode-tab ${mode==="register"?"active":""}`} onClick={() => reset("register")}>Register</button>
        </div>

        {mode === "register" && (
          <div className="field">
            <label>Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" onKeyDown={onKey} />
          </div>
        )}
        <div className="field">
          <label>Email Address</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder={`${role}@metalinv.com`} onKeyDown={onKey} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
            placeholder="••••••••" onKeyDown={onKey} />
          {err && <div className="err-msg">{err}</div>}
        </div>

        <button className="btn-primary" onClick={submit} disabled={busy}>
          {busy && <Spinner size={16} />}
          {mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {mode === "login" && (
          <div className="login-hint">demo: {HINTS[role]}</div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboards ───────────────────────────────────────────────
function SupplierDashboard({ orders }) {
  const total    = orders.length;
  const pending  = orders.filter(o => o.status === "Pending").length;
  const approved = orders.filter(o => o.status === "Approved").length;
  return (
    <div className="page-content fade-in">
      <div className="stats-grid-3">
        <div className="stat-card y"><div className="stat-icon">📋</div><div className="stat-label">Total Requests</div><div className="stat-value">{total}</div><div className="stat-sub">All customer orders</div></div>
        <div className="stat-card b"><div className="stat-icon">⏳</div><div className="stat-label">Pending</div><div className="stat-value">{pending}</div><div className="stat-sub">Awaiting your action</div></div>
        <div className="stat-card g"><div className="stat-icon">✅</div><div className="stat-label">Approved</div><div className="stat-value">{approved}</div><div className="stat-sub">Fulfilled requests</div></div>
      </div>
    </div>
  );
}

function CustomerDashboard({ orders }) {
  const total    = orders.length;
  const pending  = orders.filter(o => o.status === "Pending").length;
  const approved = orders.filter(o => o.status === "Approved").length;
  return (
    <div className="page-content fade-in">
      <div className="stats-grid-3">
        <div className="stat-card y"><div className="stat-icon">📋</div><div className="stat-label">My Requests</div><div className="stat-value">{total}</div><div className="stat-sub">Total submitted</div></div>
        <div className="stat-card b"><div className="stat-icon">⏳</div><div className="stat-label">Pending</div><div className="stat-value">{pending}</div><div className="stat-sub">Awaiting approval</div></div>
        <div className="stat-card g"><div className="stat-icon">✅</div><div className="stat-label">Approved</div><div className="stat-value">{approved}</div><div className="stat-sub">Approved orders</div></div>
      </div>
    </div>
  );
}

// ─── Customer: Create Request ─────────────────────────────────
const BLANK_FORM = {
  metalType:"", quantity:"", width:"", thickness:"",
  notes:"", contactName:"", contactInfo:"",
};

function CreateRequest({ toast, onSuccess }) {
  const [form, setForm]   = useState(BLANK_FORM);
  const [busy, setBusy]   = useState(false);
  const f = (k,v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.metalType || !form.quantity || !form.contactName) {
      toast("Please fill Metal Type, Quantity and Contact Name", "error");
      return;
    }
    setBusy(true);
    try {
      await ordersAPI.create(form);
      toast("Request submitted successfully!");
      setForm(BLANK_FORM);
      onSuccess();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="form-card">
        <div className="table-header"><span className="table-title">Create New Request</span></div>
        <div className="form-body">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Metal Type *</label>
              <select className="form-select" value={form.metalType} onChange={e=>f("metalType",e.target.value)}>
                <option value="">Select metal type…</option>
                {METAL_TYPES.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Quantity (kg) *</label>
              <input className="form-input" type="number" min="1" value={form.quantity}
                onChange={e=>f("quantity",e.target.value)} placeholder="e.g. 5000" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Thickness (mm)</label>
              <input className="form-input" type="number" value={form.thickness}
                onChange={e=>f("thickness",e.target.value)} placeholder="e.g. 2.0" />
            </div>
            <div className="form-field">
              <label className="form-label">Width (mm)</label>
              <input className="form-input" type="number" value={form.width}
                onChange={e=>f("width",e.target.value)} placeholder="e.g. 1250" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Contact Name *</label>
              <input className="form-input" value={form.contactName}
                onChange={e=>f("contactName",e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-field">
              <label className="form-label">Phone / Email</label>
              <input className="form-input" value={form.contactInfo}
                onChange={e=>f("contactInfo",e.target.value)} placeholder="Contact details" />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-textarea" value={form.notes}
              onChange={e=>f("notes",e.target.value)} placeholder="Any special requirements…" />
          </div>
          <button className="btn-save" onClick={submit} disabled={busy}>
            {busy && <Spinner size={14} />}
            Submit Request →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer: My Requests ────────────────────────────────────
function MyRequests({ orders, loading, onDelete, toast }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (o) => {
    if (!window.confirm(`Delete request ${o.id}? This cannot be undone.`)) return;
    setDeleting(o.dbId);
    try {
      await ordersAPI.deleteOrder(o.dbId);
      toast("Request deleted");
      onDelete();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">My Requests</span>
          {!loading && <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{orders.length} total</span>}
        </div>
        {loading ? <LoadingRow /> : orders.length === 0 ? (
          <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No requests yet — create one!</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request ID</th><th>Metal Type</th><th>Dimensions</th>
                <th>Quantity (kg)</th><th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o,i) => (
                <tr key={o.id} className="slide-in" style={{animationDelay:`${i*.04}s`}}>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--accent)"}}>{o.id}</span></td>
                  <td style={{fontWeight:600}}>{o.metalType}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted2)"}}>
                    {o.width||"—"}mm × {o.thickness||"—"}mm
                  </td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12}}>{o.quantity}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{o.createdAt}</td>
                  <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>
                    {o.status === "Pending" ? (
                      <button className="btn-icon-del" title="Delete request"
                        disabled={deleting === o.dbId}
                        onClick={() => handleDelete(o)}>
                        {deleting === o.dbId ? <Spinner size={12}/> : "🗑"}
                      </button>
                    ) : (
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)"}}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Supplier: Incoming Requests ──────────────────────────────
function SupplierRequests({ orders, loading, onStatusUpdate, toast }) {
  const [search,   setSearch]   = useState("");
  const [updating, setUpdating] = useState(null);

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(s) ||
      o.metalType?.toLowerCase().includes(s)    ||
      o.id?.toLowerCase().includes(s)
    );
  });

  const changeStatus = async (dbId, status) => {
    setUpdating(dbId);
    try {
      await ordersAPI.updateStatus(dbId, status);
      toast(status === "Approved" ? "Request approved" : "Request rejected",
            status === "Approved" ? "success" : "error");
      onStatusUpdate();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Incoming Customer Requests</span>
          <div className="table-tools">
            <input className="search-input" placeholder="Search…"
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <LoadingRow /> : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">📬</div><div className="empty-text">No requests found</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Metal Type</th><th>Dimensions</th>
                <th>Qty (kg)</th><th>Notes</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o,i) => (
                <tr key={o.id} className="slide-in" style={{animationDelay:`${i*.03}s`}}>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--accent)"}}>{o.id}</span></td>
                  <td style={{fontWeight:600}}>{o.customerName}</td>
                  <td>{o.metalType}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted2)"}}>
                    {o.width||"—"}×{o.thickness||"—"}
                  </td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12}}>{o.quantity}</td>
                  <td style={{fontSize:12,color:"var(--muted2)",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {o.notes||"—"}
                  </td>
                  <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{o.createdAt}</td>
                  <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>
                    {o.status === "Pending" ? (
                      <div className="action-btns">
                        <button className="btn-icon approve" title="Approve"
                          disabled={updating === o.dbId}
                          onClick={() => changeStatus(o.dbId, "Approved")}>
                          {updating === o.dbId ? <Spinner size={12}/> : "✓"}
                        </button>
                        <button className="btn-icon reject" title="Reject"
                          disabled={updating === o.dbId}
                          onClick={() => changeStatus(o.dbId, "Rejected")}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)"}}>Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


// ─── Inventory: shared helpers ────────────────────────────────
const METAL_CATEGORIES = [
  "Stainless Steel","Galvanized","Cold Rolled","Hot Rolled",
  "Aluminium","Copper","Brass","Titanium",
];
const COIL_STATUSES  = ["Available","In Use","Low Stock","Depleted","Reserved"];
const COIL_LOCATIONS = [
  "Bay A-1","Bay A-2","Bay A-3","Bay B-1","Bay B-2",
  "Bay C-1","Bay C-2","Warehouse-1","Warehouse-2",
];

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-head-title">{title}</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onClose, busy }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{width:380}}>
        <div className="modal-head">
          <span className="modal-head-title">Confirm Delete</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{fontSize:32,marginBottom:12}}>🗑️</div>
          <p className="confirm-text">
            Delete <span className="confirm-name">"{name}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-danger-sm" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Metal Types CRUD ─────────────────────────────────────────
const BLANK_MT = { code:"", name:"", grade:"", category:"Stainless Steel", density:"", unit:"kg/m³", status:"Active" };

function MetalTypeForm({ data, onChange }) {
  const f = (k,v) => onChange({...data,[k]:v});
  return (
    <>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Code *</label>
          <input className="form-input" value={data.code} onChange={e=>f("code",e.target.value)} placeholder="e.g. SS304" />
        </div>
        <div className="form-field">
          <label className="form-label">Name *</label>
          <input className="form-input" value={data.name} onChange={e=>f("name",e.target.value)} placeholder="Full name" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Grade</label>
          <input className="form-input" value={data.grade} onChange={e=>f("grade",e.target.value)} placeholder="e.g. 304" />
        </div>
        <div className="form-field">
          <label className="form-label">Category *</label>
          <select className="form-select" value={data.category} onChange={e=>f("category",e.target.value)}>
            {METAL_CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Density (kg/m³)</label>
          <input className="form-input" type="number" value={data.density} onChange={e=>f("density",e.target.value)} placeholder="7.93" />
        </div>
        <div className="form-field">
          <label className="form-label">Status</label>
          <select className="form-select" value={data.status} onChange={e=>f("status",e.target.value)}>
            <option>Active</option><option>Inactive</option>
          </select>
        </div>
      </div>
    </>
  );
}

function MetalTypes({ toast }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);   // null | {mode,id?}
  const [form,     setForm]     = useState(BLANK_MT);
  const [deleting, setDeleting] = useState(null);   // item
  const [busy,     setBusy]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    inventoryAPI.getMetalTypes()
      .then(setItems)
      .catch(e=>toast(e.message,"error"))
      .finally(()=>setLoading(false));
  },[]);  // eslint-disable-line

  useEffect(()=>{load();},[load]);

  const filtered = items.filter(m=>{
    const s=search.toLowerCase();
    return m.name.toLowerCase().includes(s)||m.code.toLowerCase().includes(s)||m.category.toLowerCase().includes(s);
  });

  const openAdd  = ()  => { setForm(BLANK_MT); setModal({mode:"add"}); };
  const openEdit = (m) => { setForm({code:m.code,name:m.name,grade:m.grade||"",category:m.category,density:m.density||"",unit:m.unit||"kg/m³",status:m.status}); setModal({mode:"edit",id:m.id}); };

  const save = async () => {
    if(!form.code||!form.name||!form.category){toast("Code, Name and Category are required","error");return;}
    setBusy(true);
    try {
      if(modal.mode==="add") { await inventoryAPI.createMetalType(form); toast("Metal type added"); }
      else                   { await inventoryAPI.updateMetalType(modal.id,form); toast("Metal type updated"); }
      setModal(null); load();
    } catch(e){ toast(e.message,"error"); } finally{ setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try { await inventoryAPI.deleteMetalType(deleting.id); toast("Metal type deleted","error"); setDeleting(null); load(); }
    catch(e){ toast(e.message,"error"); } finally{ setBusy(false); }
  };

  return (
    <div className="page-content fade-in">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Metal Type Master</span>
          <div className="table-tools">
            <input className="search-input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
            <button className="btn-add" onClick={openAdd}>＋ Add Metal Type</button>
          </div>
        </div>
        {loading ? <LoadingRow /> : filtered.length===0 ? (
          <div className="empty"><div className="empty-icon">⚙️</div><div className="empty-text">No metal types found</div></div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Grade</th><th>Category</th><th>Density</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m,i)=>(
                <tr key={m.id} className="slide-in" style={{animationDelay:`${i*.04}s`}}>
                  <td style={{color:"var(--muted)",fontFamily:"var(--mono)",fontSize:11}}>{String(i+1).padStart(2,"0")}</td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--accent)"}}>{m.code}</span></td>
                  <td style={{fontWeight:600}}>{m.name}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted2)"}}>{m.grade||"—"}</td>
                  <td>{m.category}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12}}>{m.density||"—"} {m.unit}</td>
                  <td><span className={`badge ${m.status.toLowerCase()}`}>{m.status}</span></td>
                  <td><div className="action-btns">
                    <button className="btn-icon-edit" title="Edit" onClick={()=>openEdit(m)}>✏</button>
                    <button className="btn-icon-del"  title="Delete" onClick={()=>setDeleting(m)}>🗑</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode==="add"?"Add Metal Type":"Edit Metal Type"}
          onClose={()=>setModal(null)}
          footer={<><button className="btn-cancel" onClick={()=>setModal(null)} disabled={busy}>Cancel</button><button className="btn-save" onClick={save} disabled={busy}>{busy?<><Spinner size={13}/> Saving…</>:"Save"}</button></>}
        >
          <MetalTypeForm data={form} onChange={setForm}/>
        </Modal>
      )}
      {deleting && <ConfirmDelete name={deleting.name} onConfirm={confirmDelete} onClose={()=>setDeleting(null)} busy={busy}/>}
    </div>
  );
}

// ─── Coil Stock CRUD ──────────────────────────────────────────
const BLANK_COIL = {
  coilId:"", metalTypeId:"", supplierName:"", heatNo:"",
  width:"", thickness:"", grossWeight:"", currentWeight:"",
  location:"", status:"Available", receivedDate:"",
};

function CoilForm({ data, onChange, metalTypes }) {
  const f = (k,v) => onChange({...data,[k]:v});
  return (
    <>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Coil ID *</label>
          <input className="form-input" value={data.coilId} onChange={e=>f("coilId",e.target.value)} placeholder="C-2024-XXX" />
        </div>
        <div className="form-field">
          <label className="form-label">Metal Type *</label>
          <select className="form-select" value={data.metalTypeId} onChange={e=>f("metalTypeId",e.target.value)}>
            <option value="">Select…</option>
            {metalTypes.filter(m=>m.status==="Active").map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Supplier</label>
          <input className="form-input" value={data.supplierName} onChange={e=>f("supplierName",e.target.value)} placeholder="Supplier name" />
        </div>
        <div className="form-field">
          <label className="form-label">Heat No.</label>
          <input className="form-input" value={data.heatNo} onChange={e=>f("heatNo",e.target.value)} placeholder="HT-XXXX" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Width (mm)</label>
          <input className="form-input" type="number" value={data.width} onChange={e=>f("width",e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">Thickness (mm)</label>
          <input className="form-input" type="number" value={data.thickness} onChange={e=>f("thickness",e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Gross Weight (kg)</label>
          <input className="form-input" type="number" value={data.grossWeight} onChange={e=>f("grossWeight",e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">Current Weight (kg)</label>
          <input className="form-input" type="number" value={data.currentWeight} onChange={e=>f("currentWeight",e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Location</label>
          <select className="form-select" value={data.location} onChange={e=>f("location",e.target.value)}>
            <option value="">Select…</option>
            {COIL_LOCATIONS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Status</label>
          <select className="form-select" value={data.status} onChange={e=>f("status",e.target.value)}>
            {COIL_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Received Date</label>
        <input className="form-input" type="date" value={data.receivedDate} onChange={e=>f("receivedDate",e.target.value)} />
      </div>
    </>
  );
}

function CoilStock({ toast }) {
  const [coils,      setCoils]      = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterSt,   setFilterSt]   = useState("All");
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(BLANK_COIL);
  const [deleting,   setDeleting]   = useState(null);
  const [busy,       setBusy]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c,m] = await Promise.all([inventoryAPI.getCoils(), inventoryAPI.getMetalTypes()]);
      setCoils(c); setMetalTypes(m);
    } catch(e){ toast(e.message,"error"); }
    finally{ setLoading(false); }
  },[]);  // eslint-disable-line

  useEffect(()=>{load();},[load]);

  const filtered = coils.filter(c=>{
    const s=search.toLowerCase();
    const matchS = c.coil_id.toLowerCase().includes(s)||c.metal_type_name.toLowerCase().includes(s)||(c.supplier_name||"").toLowerCase().includes(s);
    const matchF = filterSt==="All"||c.status===filterSt;
    return matchS&&matchF;
  });

  const coilToForm = c => ({
    coilId: c.coil_id, metalTypeId: String(c.metal_type_id),
    supplierName: c.supplier_name||"", heatNo: c.heat_no||"",
    width: c.width||"", thickness: c.thickness||"",
    grossWeight: c.gross_weight||"", currentWeight: c.current_weight||"",
    location: c.location||"", status: c.status,
    receivedDate: c.received_date ? c.received_date.slice(0,10) : "",
  });

  const openAdd  = ()  => { setForm(BLANK_COIL); setModal({mode:"add"}); };
  const openEdit = (c) => { setForm(coilToForm(c)); setModal({mode:"edit",id:c.id}); };

  const save = async () => {
    if(!form.coilId||!form.metalTypeId){toast("Coil ID and Metal Type are required","error");return;}
    setBusy(true);
    try {
      if(modal.mode==="add"){ await inventoryAPI.createCoil(form); toast("Coil added to stock"); }
      else                  { await inventoryAPI.updateCoil(modal.id,form); toast("Coil updated"); }
      setModal(null); load();
    } catch(e){ toast(e.message,"error"); } finally{ setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try { await inventoryAPI.deleteCoil(deleting.id); toast("Coil deleted","error"); setDeleting(null); load(); }
    catch(e){ toast(e.message,"error"); } finally{ setBusy(false); }
  };

  const statusColor = s => s==="Available"?"ok":s==="Low Stock"?"low":s==="In Use"?"warn":"inactive";

  return (
    <div className="page-content fade-in">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Metal Coil Stock Master</span>
          <div className="table-tools">
            <input className="search-input" placeholder="Search coils…" value={search} onChange={e=>setSearch(e.target.value)} />
            <select className="search-input" style={{width:130}} value={filterSt} onChange={e=>setFilterSt(e.target.value)}>
              <option>All</option>
              {COIL_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn-add" onClick={openAdd}>＋ Add Coil</button>
          </div>
        </div>
        {loading ? <LoadingRow /> : filtered.length===0 ? (
          <div className="empty"><div className="empty-icon">📦</div><div className="empty-text">No coils found</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Coil ID</th><th>Metal Type</th><th>Supplier</th><th>Heat No.</th>
                <th>W×T (mm)</th><th>Gross (kg)</th><th>Current (kg)</th>
                <th>Location</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c,i)=>{
                const pct = c.gross_weight>0 ? Math.round((c.current_weight/c.gross_weight)*100) : 0;
                return (
                  <tr key={c.id} className="slide-in" style={{animationDelay:`${i*.03}s`}}>
                    <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--accent)"}}>{c.coil_id}</span></td>
                    <td style={{fontWeight:600,fontSize:12}}>{c.metal_type_name}</td>
                    <td style={{color:"var(--muted2)",fontSize:12}}>{c.supplier_name||"—"}</td>
                    <td><span style={{fontFamily:"var(--mono)",fontSize:11}}>{c.heat_no||"—"}</span></td>
                    <td style={{fontFamily:"var(--mono)",fontSize:12}}>{c.width||"—"}×{c.thickness||"—"}</td>
                    <td style={{fontFamily:"var(--mono)",fontSize:12}}>{Number(c.gross_weight).toLocaleString()}</td>
                    <td>
                      <span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:pct<20?"var(--red)":pct<50?"var(--accent)":"var(--green)"}}>
                        {Number(c.current_weight).toLocaleString()}
                      </span>
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginLeft:4}}>{pct}%</span>
                    </td>
                    <td style={{fontSize:12}}>{c.location||"—"}</td>
                    <td><span className={`badge ${statusColor(c.status)}`}>{c.status}</span></td>
                    <td><div className="action-btns">
                      <button className="btn-icon-edit" title="Edit" onClick={()=>openEdit(c)}>✏</button>
                      <button className="btn-icon-del"  title="Delete" onClick={()=>setDeleting(c)}>🗑</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode==="add"?"Add Coil to Stock":"Edit Coil Record"}
          onClose={()=>setModal(null)}
          footer={<><button className="btn-cancel" onClick={()=>setModal(null)} disabled={busy}>Cancel</button><button className="btn-save" onClick={save} disabled={busy}>{busy?<><Spinner size={13}/> Saving…</>:"Save"}</button></>}
        >
          <CoilForm data={form} onChange={setForm} metalTypes={metalTypes}/>
        </Modal>
      )}
      {deleting && <ConfirmDelete name={deleting.coil_id} onConfirm={confirmDelete} onClose={()=>setDeleting(null)} busy={busy}/>}
    </div>
  );
}

// ─── Optimization ────────────────────────────────────────────

// 20 visually distinct colours for cut sections
const CUT_COLORS = [
  "#e8c44a","#4ecb8d","#5b9cf6","#e85c5c","#a78bfa",
  "#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b",
  "#10b981","#6366f1","#ef4444","#8b5cf6","#14b8a6",
  "#f43f5e","#0ea5e9","#d946ef","#22c55e","#fb923c",
];

/** Sheet visualiser — pure CSS divs, no canvas needed */
function SheetVisualizer({ plan }) {
  const { sheetWidth, cuts, remaining, source, utilization, warnings } = plan;

  return (
    <div className="sheet-wrap">

      {/* Meta row */}
      <div className="sheet-meta">
        <div className="sheet-meta-item">Sheet width: <b>{sheetWidth}mm</b></div>
        <div className="sheet-meta-item">Cuts: <b>{cuts.length}</b></div>
        <div className="sheet-meta-item">Remaining: <b>{remaining}mm</b></div>
        <div className="sheet-meta-item">
          Source:&nbsp;
          <span className={`source-badge ${source}`}>
            {source === "inventory" ? "♻ Inventory piece" : "⬛ New sheet"}
          </span>
        </div>
      </div>

      {/* Sheet bar */}
      <div className="sheet-outer">
        {cuts.map((cut, i) => {
          const leftPct  = (cut.position / sheetWidth) * 100;
          const widthPct = (cut.cutWidth  / sheetWidth) * 100;
          return (
            <div
              key={cut.orderId}
              className="sheet-cut"
              title={`Order ${cut.orderId} — ${cut.metalType} — ${cut.cutWidth}mm`}
              style={{
                left:            `${leftPct}%`,
                width:           `${widthPct}%`,
                backgroundColor: CUT_COLORS[i % CUT_COLORS.length],
              }}
            >
              <div className="sheet-cut-label">
                {cut.metalType.length > 12 ? cut.metalType.slice(0,12)+"…" : cut.metalType}
              </div>
              <div className="sheet-cut-width">{cut.cutWidth}mm</div>
            </div>
          );
        })}

        {/* Remaining section */}
        {remaining > 0 && (
          <div
            className="sheet-remaining"
            style={{
              left:  `${((sheetWidth - remaining) / sheetWidth) * 100}%`,
              width: `${(remaining / sheetWidth) * 100}%`,
            }}
          >
            <div className="sheet-remaining-label">
              {remaining}mm<br/>left
            </div>
          </div>
        )}
      </div>

      {/* Ruler */}
      <div className="sheet-ruler" style={{ position:"relative", marginTop:4, height:14 }}>
        {[0, 25, 50, 75, 100].map(pct => (
          <span
            key={pct}
            className="sheet-ruler-mark"
            style={{ left:`${pct}%`, transform: pct===100 ? "translateX(-100%)" : pct===50 ? "translateX(-50%)" : "none" }}
          >
            {Math.round(sheetWidth * pct / 100)}mm
          </span>
        ))}
      </div>

      {/* Summary stats */}
      <div className="plan-summary">
        <div className="plan-stat">
          <div className="plan-stat-val" style={{color:"var(--green)"}}>{utilization}%</div>
          <div className="plan-stat-lbl">Utilization</div>
        </div>
        <div className="plan-stat">
          <div className="plan-stat-val" style={{color:"var(--accent)"}}>{cuts.length}</div>
          <div className="plan-stat-lbl">Orders cut</div>
        </div>
        <div className="plan-stat">
          <div className="plan-stat-val" style={{color: remaining < 50 ? "var(--red)" : "var(--muted2)"}}>{remaining}mm</div>
          <div className="plan-stat-lbl">Remaining</div>
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="plan-warnings">
          {warnings.map((w,i) => (
            <div key={i} className="plan-warning-item">⚠ {w}</div>
          ))}
        </div>
      )}

      {/* Cuts detail table */}
      <div className="cuts-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Metal Type</th>
              <th>Cut Width</th>
              <th>Quantity (kg)</th>
              <th>Start Pos</th>
            </tr>
          </thead>
          <tbody>
            {cuts.map((cut, i) => (
              <tr key={cut.orderId}>
                <td>
                  <div style={{
                    width:16, height:16, borderRadius:4,
                    backgroundColor: CUT_COLORS[i % CUT_COLORS.length],
                    border:"1px solid rgba(255,255,255,.15)"
                  }} />
                </td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--accent)"}}>
                  REQ-{String(cut.orderId).padStart(4,"0")}
                </span></td>
                <td style={{fontWeight:600}}>{cut.customerName}</td>
                <td style={{fontSize:12}}>{cut.metalType}</td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:12}}>{cut.cutWidth}mm</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:12}}>{cut.quantity}</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{cut.position}mm</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Main Optimization page — shown to supplier only */
function Optimization({ orders, toast }) {
  const [selected, setSelected] = useState([]);  // array of dbId (numbers)
  const [plan,     setPlan]     = useState(null);
  const [busy,     setBusy]     = useState(false);

  // Only show Pending / Approved orders that have been placed
  const eligible = orders.filter(o => ["Pending","Approved"].includes(o.status));

  const toggle = (dbId) => {
    setSelected(prev =>
      prev.includes(dbId) ? prev.filter(x => x !== dbId) : [...prev, dbId]
    );
    setPlan(null); // clear old plan when selection changes
  };

  const toggleAll = () => {
    if (selected.length === eligible.length) {
      setSelected([]);
    } else {
      setSelected(eligible.map(o => o.dbId));
    }
    setPlan(null);
  };

  const generate = async () => {
    if (selected.length === 0) {
      toast("Select at least one order to optimize", "error");
      return;
    }
    setBusy(true);
    setPlan(null);
    try {
      const data = await optimizeAPI.generate(selected);
      setPlan(data.plan);
      toast(`Cutting plan generated — ${data.plan.utilization}% utilization`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-content fade-in">

      {/* Two-column selection + result layout */}
      <div className="opt-layout">

        {/* Left: order selection */}
        <div className="opt-card">
          <div className="opt-card-header">
            <span className="opt-card-title">Select Orders to Cut</span>
            {eligible.length > 0 && (
              <button
                style={{background:"none",border:"none",color:"var(--muted2)",fontFamily:"var(--mono)",fontSize:11,cursor:"pointer"}}
                onClick={toggleAll}
              >
                {selected.length === eligible.length ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>
          <div className="opt-card-body">
            {eligible.length === 0 ? (
              <div className="empty" style={{padding:"24px 0"}}>
                <div className="empty-icon">📋</div>
                <div className="empty-text">No pending orders to optimize</div>
              </div>
            ) : (
              eligible.map(o => {
                const isSelected = selected.includes(o.dbId);
                return (
                  <div
                    key={o.dbId}
                    className={`opt-order-row ${isSelected ? "selected" : ""}`}
                    onClick={() => toggle(o.dbId)}
                  >
                    <div className={`opt-checkbox ${isSelected ? "checked" : ""}`} />
                    <div className="opt-order-info">
                      <div className="opt-order-id">{o.id}</div>
                      <div className="opt-order-meta">{o.metalType} · {o.customerName}</div>
                    </div>
                    <div className="opt-order-width">
                      {o.width ? `${o.width}mm` : "—"}
                    </div>
                    <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                  </div>
                );
              })
            )}

            <button
              className="opt-generate-btn"
              onClick={generate}
              disabled={busy || selected.length === 0}
            >
              {busy ? <><Spinner size={14}/> Generating…</> : `⚡ Generate Cutting Plan (${selected.length} order${selected.length!==1?"s":""})`}
            </button>

            {selected.length === 0 && eligible.length > 0 && (
              <div className="opt-select-hint">← Select one or more orders above</div>
            )}
          </div>
        </div>

        {/* Right: quick stats or empty state */}
        <div className="opt-card">
          <div className="opt-card-header">
            <span className="opt-card-title">Selection Summary</span>
          </div>
          <div className="opt-card-body">
            {selected.length === 0 ? (
              <div className="empty" style={{padding:"24px 0"}}>
                <div className="empty-icon">📐</div>
                <div className="empty-text">Select orders to see summary</div>
              </div>
            ) : (
              <>
                <div className="plan-summary" style={{marginTop:0}}>
                  <div className="plan-stat">
                    <div className="plan-stat-val" style={{color:"var(--accent)"}}>{selected.length}</div>
                    <div className="plan-stat-lbl">Orders selected</div>
                  </div>
                  <div className="plan-stat">
                    <div className="plan-stat-val" style={{color:"var(--blue)"}}>
                      {eligible.filter(o=>selected.includes(o.dbId))
                        .reduce((a,o)=>a+(o.width||0),0)}mm
                    </div>
                    <div className="plan-stat-lbl">Total width</div>
                  </div>
                  <div className="plan-stat">
                    <div className="plan-stat-val" style={{color:"var(--green)"}}>
                      {eligible.filter(o=>selected.includes(o.dbId))
                        .reduce((a,o)=>a+(Number(o.quantity)||0),0)}
                    </div>
                    <div className="plan-stat-lbl">Total qty (kg)</div>
                  </div>
                </div>
                <div style={{marginTop:14}}>
                  {eligible.filter(o=>selected.includes(o.dbId)).map((o,i)=>(
                    <div key={o.dbId} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
                      <div style={{width:10,height:10,borderRadius:2,background:CUT_COLORS[i%CUT_COLORS.length],flexShrink:0}}/>
                      <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--accent)",minWidth:80}}>{o.id}</span>
                      <span style={{flex:1,color:"var(--muted2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.metalType}</span>
                      <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{o.width||"?"}mm</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cutting plan visualization — shown after generation */}
      {plan && (
        <div className="opt-card fade-in">
          <div className="opt-card-header">
            <span className="opt-card-title">Cutting Plan — Plan #{plan.planId}</span>
            <span className={`source-badge ${plan.source}`}>
              {plan.source === "inventory" ? "♻ From Inventory" : "⬛ New Sheet"}
            </span>
          </div>
          <SheetVisualizer plan={plan} />
        </div>
      )}
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────
const NAV = {
  supplier: [
    { id:"dashboard",         label:"Dashboard",         icon:"◈", section:"Overview"    },
    { id:"metal-types",       label:"Metal Type Master", icon:"⚙", section:"Inventory"   },
    { id:"coil-stock",        label:"Coil Stock Master", icon:"⬡", section:"Inventory"   },
    { id:"supplier-requests", label:"Incoming Requests", icon:"📬", section:"Operations"  },
    { id:"optimization",      label:"Optimization",      icon:"⚡", section:"Operations"  },
  ],
  customer: [
    { id:"dashboard",      label:"Dashboard",     icon:"◈", section:"Overview"  },
    { id:"create-request", label:"Create Request", icon:"＋", section:"My Orders" },
    { id:"my-requests",    label:"My Requests",   icon:"📋", section:"My Orders" },
  ],
};

const PAGE_TITLE = {
  dashboard:           { t:"Dashboard",         s:"Overview & KPIs"                     },
  "metal-types":       { t:"Metal Type Master", s:"Manage metal type definitions"       },
  "coil-stock":        { t:"Coil Stock Master", s:"Manage coil inventory records"       },
  "supplier-requests": { t:"Incoming Requests", s:"Review and action customer requests" },
  "optimization":      { t:"Optimization",      s:"Generate cutting plans from orders"  },
  "create-request":    { t:"Create Request",    s:"Submit a new metal request"          },
  "my-requests":       { t:"My Requests",       s:"Track your submitted requests"       },
};

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(null);
  const [page,      setPage]      = useState("dashboard");
  const [booting,   setBooting]   = useState(true);    // checking stored token
  const [orders,    setOrders]    = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { toasts, show: toast }   = useToasts();

  // ── Restore session from localStorage on page load ──────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setBooting(false);
      return;
    }
    authAPI.me()
      .then(data => setUser(data.user))
      .catch(() => {
        // Token invalid / expired — clear it silently
        clearToken();
      })
      .finally(() => setBooting(false));
  }, []);

  // ── Fetch orders whenever user is set or we force a refresh ──
  const fetchOrders = useCallback(() => {
    if (!user) return;
    setOrdersLoading(true);
    ordersAPI.getAll()
      .then(setOrders)
      .catch(e => toast(e.message, "error"))
      .finally(() => setOrdersLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogin  = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = ()  => { clearToken(); setUser(null); setOrders([]); setPage("dashboard"); };

  // ── Bootstrap spinner (checking stored token) ────────────────
  if (booting) {
    return (
      <>
        <style>{styles}</style>
        <div className="boot-screen">
          <div className="spinner boot-spinner" />
        </div>
      </>
    );
  }

  // ── Not logged in ────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  const nav      = NAV[user.role] || NAV.customer;
  const sections = [...new Set(nav.map(n => n.section))];
  const title    = PAGE_TITLE[page] || { t:"Page", s:"" };

  // ── Logged-in shell ──────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">M</div>
            <div className="sidebar-logo-text">Metal<span>Inv</span></div>
          </div>
          <nav className="sidebar-nav">
            {sections.map(sec => (
              <div key={sec}>
                <div className="nav-section-label">{sec}</div>
                {nav.filter(n=>n.section===sec).map(n => (
                  <button key={n.id}
                    className={`nav-item ${page===n.id?"active":""}`}
                    onClick={() => setPage(n.id)}>
                    <span className="nav-icon">{n.icon}</span>{n.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="avatar">{user.name[0].toUpperCase()}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        {/* Main content */}
        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{title.t}</div>
              <div className="topbar-subtitle">{title.s}</div>
            </div>
          </div>

          {/* Supplier views */}
          {user.role === "supplier" && page === "dashboard" && (
            <SupplierDashboard orders={orders} />
          )}
          {user.role === "supplier" && page === "metal-types" && (
            <MetalTypes toast={toast} />
          )}
          {user.role === "supplier" && page === "coil-stock" && (
            <CoilStock toast={toast} />
          )}
          {user.role === "supplier" && page === "supplier-requests" && (
            <SupplierRequests
              orders={orders}
              loading={ordersLoading}
              onStatusUpdate={fetchOrders}
              toast={toast}
            />
          )}
          {user.role === "supplier" && page === "optimization" && (
            <Optimization orders={orders} toast={toast} />
          )}

          {/* Customer views */}
          {user.role === "customer" && page === "dashboard" && (
            <CustomerDashboard orders={orders} />
          )}
          {user.role === "customer" && page === "create-request" && (
            <CreateRequest
              toast={toast}
              onSuccess={() => { fetchOrders(); setPage("my-requests"); }}
            />
          )}
          {user.role === "customer" && page === "my-requests" && (
            <MyRequests orders={orders} loading={ordersLoading} onDelete={fetchOrders} toast={toast} />
          )}
        </main>
      </div>

      <Toast toasts={toasts} />
    </>
  );
}
