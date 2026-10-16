document.addEventListener("DOMContentLoaded", () => {
  const {$}=Wuxia;
  let mode="login";
  document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
    mode=button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b===button));
    $("authTitle").textContent=mode==="login"?"重返江湖":"建立你的藏書閣";
    $("authSubtitle").textContent=mode==="login"?"登入你的藏書閣帳號。":"註冊後即可收藏作品與保存閱讀進度。";
    $("submitBtn").textContent=mode==="login"?"登入":"建立帳號";
    $("password").autocomplete=mode==="login"?"current-password":"new-password";
    $("authMessage").textContent="";
  }));
  $("authForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const email=$("email").value.trim(),password=$("password").value;
    const message=$("authMessage"),submit=$("submitBtn");
    if(!window.sb){message.textContent="尚未設定 Supabase。請編輯 js/supabase.js，填入 Project URL 與公開 publishable/anon key。";return;}
    submit.disabled=true;submit.textContent="處理中…";message.textContent="";
    try {
      if(mode==="signup"){
        const {data,error}=await sb.auth.signUp({email,password});
        if(error)throw error;
        if(data.session){message.className="form-message success";message.textContent="註冊成功，正在進入書架…";location.href="./account.html";}
        else {message.className="form-message success";message.textContent="註冊申請已送出。若已啟用郵件驗證，請到信箱完成驗證後再登入。";}
      } else {
        const {error}=await sb.auth.signInWithPassword({email,password});
        if(error)throw error;
        location.href="./account.html";
      }
    } catch(error){message.className="form-message";message.textContent=error.message || "操作失敗，請稍後再試。";}
    finally{submit.disabled=false;submit.textContent=mode==="login"?"登入":"建立帳號";}
  });
  if(window.sb) sb.auth.getSession().then(({data})=>{if(data.session)location.href="./account.html";});
});
