// Supabase public project settings. Only use the publishable/anon key in frontend code.
// Never place service_role or secret keys in a GitHub Pages project.
window.SUPABASE_CONFIG = {
  url: "https://orwnceakiqwjrtqxgdax.supabase.co",
  anonKey: "sb_publishable_fZChWYb198C6BU_PlWcX0A_4HVP6sy2"
};

(function () {
  const cfg = window.SUPABASE_CONFIG;
  const valid = Boolean(cfg && typeof cfg.url === "string" && cfg.url.startsWith("https://") &&
    !cfg.url.includes("YOUR_") && typeof cfg.anonKey === "string" && cfg.anonKey.length > 0 &&
    !cfg.anonKey.includes("YOUR_"));
  window.sb = (valid && window.supabase && typeof window.supabase.createClient === "function")
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;
  window.SUPABASE_READY = Boolean(window.sb);
})();
