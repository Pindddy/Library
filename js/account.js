document.addEventListener("DOMContentLoaded", async()=>{
  const {$,getUser,getProfile,loadBooks,isFavorite,saveProgress,escapeHtml}=Wuxia;
  const message=$("accountMessage");
  if(!window.sb){message.textContent="目前尚未連接 Supabase。登入、雲端收藏與跨裝置閱讀進度需要完成資料庫設定。";return;}
  try{
    const user=await getUser();
    if(!user){location.href="./auth.html";return;}
    const profile=await getProfile();
    $("accountGreeting").textContent=`歡迎回來，${profile?.display_name || user.email}。整理喜愛的作品，接續未完的旅程。`;
    $("accountAdminLink").hidden=profile?.role!=="admin";
    const books=await loadBooks();
    const favoritesResult=await sb.from("favorites").select("book_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false});
    if(favoritesResult.error)throw favoritesResult.error;
    const favoriteBooks=(favoritesResult.data||[]).map(f=>books.find(b=>String(b.id)===String(f.book_id))).filter(Boolean);
    const favoriteList=$("favoriteList");
    if(!favoriteBooks.length)favoriteList.innerHTML='<p class="muted">目前還沒有收藏作品。可以先到藏書總目挑一本喜歡的書。</p>';
    favoriteBooks.forEach(book=>{
      const card=document.createElement("div");card.className="account-book";
      card.innerHTML=`<h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.author_name)} · ${escapeHtml(book.category||"武俠小說")}</p><div class="account-row-actions"><a class="text-button" href="./reader.html?book=${encodeURIComponent(book.id)}">繼續閱讀 →</a><button class="text-button" data-remove="${escapeHtml(book.id)}">移除收藏</button></div>`;
      card.querySelector("[data-remove]").addEventListener("click",async()=>{
        const {error}=await sb.from("favorites").delete().eq("user_id",user.id).eq("book_id",book.id);
        if(error){message.textContent=error.message;return;}card.remove();
      });
      favoriteList.append(card);
    });
    const progressResult=await sb.from("reading_progress").select("book_id,chapter_id,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false});
    if(progressResult.error)throw progressResult.error;
    const progressList=$("progressList");
    if(!progressResult.data?.length)progressList.innerHTML='<p class="muted">還沒有閱讀紀錄。選擇一部作品並閱讀章節後，紀錄會顯示在這裡。</p>';
    (progressResult.data||[]).forEach(item=>{
      const book=books.find(b=>String(b.id)===String(item.book_id));if(!book)return;
      const chapter=book.chapters.find(c=>String(c.id)===String(item.chapter_id));
      const row=document.createElement("div");row.className="account-row";
      row.innerHTML=`<div><h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(chapter?.title||"已保存閱讀位置")} · ${new Date(item.updated_at).toLocaleString("zh-TW")}</p></div><div class="account-row-actions"><a class="text-button" href="./reader.html?book=${encodeURIComponent(book.id)}&chapter=${encodeURIComponent(item.chapter_id)}">繼續閱讀 →</a></div>`;
      progressList.append(row);
    });
    $("logoutBtn").addEventListener("click",async()=>{await sb.auth.signOut();location.href="./index.html";});
  }catch(error){message.textContent="無法載入書架："+error.message;}
});
