// 請填入 Supabase 專案設定。此處只能使用公開 publishable/anon key。
// 絕對不要把 service_role 或 secret key 放入 GitHub Pages 前端。
window.SUPABASE_CONFIG = {
  url: "https://orwnceakiqwjrtqxgdax.supabase.co",
  anonKey: "sb_publishable_fZChWYb198C6BU_PlWcX0A_4HVP6sy2"
};

(function () {
  const cfg = window.SUPABASE_CONFIG;
  const valid = cfg.url.startsWith("https://") &&
    !cfg.url.includes("YOUR_") &&
    cfg.anonKey && !cfg.anonKey.includes("YOUR_");
  window.sb = (valid && window.supabase)
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;
  window.SUPABASE_READY = Boolean(window.sb);
})();
