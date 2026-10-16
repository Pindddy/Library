document.addEventListener("DOMContentLoaded", async () => {
  const {$,loadBooks,getProgress,saveProgress,isFavorite,toggleFavorite,escapeHtml,getUser} = Wuxia;
  const params = new URLSearchParams(location.search);
  const bookId = params.get("book");
  let book = null, chapterIndex = 0, fontSize = Number(localStorage.getItem("wuxia-font-size") || 17);
  const panel=$(".reading-panel");

  function showMessage(message) { $("readingNotice").textContent=message; }

  function renderChapterList() {
    const list=$("chapterList");list.replaceChildren();
    book.chapters.forEach((chapter,index)=>{
      const button=document.createElement("button");
      button.className="reader-chapter-item"+(index===chapterIndex?" active":"");
      button.textContent=`${String(index+1).padStart(2,"0")}　${chapter.title}`;
      button.addEventListener("click",()=>selectChapter(index));
      list.append(button);
    });
    $("chapterCount").textContent=book.chapters.length;
  }

  async function selectChapter(index) {
    if(index<0||index>=book.chapters.length)return;
    chapterIndex=index;
    const chapter=book.chapters[index];
    $("chapterKicker").textContent=`CHAPTER ${String(index+1).padStart(2,"0")}`;
    $("chapterTitle").textContent=chapter.title;
    const body=$("chapterBody");body.replaceChildren();
    String(chapter.content || "本章尚未加入正文。").split(/\n{2,}/).forEach(text=>{
      const p=document.createElement("p");p.textContent=text;body.append(p);
    });
    body.style.fontSize=fontSize+"px";
    $("chapterPosition").textContent=`${index+1} / ${book.chapters.length}`;
    $("prevChapter").disabled=index===0;$("nextChapter").disabled=index===book.chapters.length-1;
    renderChapterList();
    try { await saveProgress(book.id,chapter.id); } catch(error) { showMessage("閱讀進度尚未同步至雲端："+error.message); }
    const url=new URL(location.href);url.searchParams.set("chapter",chapter.id);history.replaceState({}, "",url);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  try {
    const books=await loadBooks();
    book=books.find(b=>String(b.id)===String(bookId));
    if(!book){$("sidebarBookTitle").textContent="找不到這部作品";$("chapterBody").textContent="請返回書庫，重新選擇作品。";$("chapterTitle").textContent="作品不存在";return;}
    $("sidebarBookTitle").textContent=book.title;$("sidebarAuthor").textContent=`作者｜${book.author_name}`;$("readingCategory").textContent=book.category||"武俠小說";
    if(!book.chapters.length){$("chapterTitle").textContent="尚無章節";$("chapterBody").textContent="這部作品目前尚未公開任何章節。";$("chapterList").textContent="尚無章節";return;}
    renderChapterList();
    const requestedChapter=params.get("chapter");
    let index=book.chapters.findIndex(c=>String(c.id)===String(requestedChapter));
    if(index<0){const progress=await getProgress(book.id);index=book.chapters.findIndex(c=>String(c.id)===String(progress));}
    await selectChapter(index>=0?index:0);
    const favorite=await isFavorite(book.id);
    $("bookmarkBtn").textContent=favorite?"★ 已收藏":"☆ 收藏";
  } catch(error) {
    $("chapterTitle").textContent="載入失敗";$("chapterBody").textContent=error.message;
  }

  $("prevChapter").addEventListener("click",()=>selectChapter(chapterIndex-1));
  $("nextChapter").addEventListener("click",()=>selectChapter(chapterIndex+1));
  $("fontDown").addEventListener("click",()=>{fontSize=Math.max(13,fontSize-1);localStorage.setItem("wuxia-font-size",fontSize);$("chapterBody").style.fontSize=fontSize+"px";});
  $("fontUp").addEventListener("click",()=>{fontSize=Math.min(26,fontSize+1);localStorage.setItem("wuxia-font-size",fontSize);$("chapterBody").style.fontSize=fontSize+"px";});
  $("themeToggle").addEventListener("click",()=>{panel.classList.toggle("dark");panel.classList.toggle("sepia",!panel.classList.contains("dark"));});
  $("bookmarkBtn").addEventListener("click",async()=>{
    try {
      const favorite=await toggleFavorite(book.id);
      $("bookmarkBtn").textContent=favorite?"★ 已收藏":"☆ 收藏";
      showMessage(favorite?"已加入收藏。":"已從收藏移除。");
      if(!(await getUser())) showMessage("目前為訪客示範模式，收藏只會保存在此瀏覽器。登入並設定 Supabase 後可同步收藏。");
    } catch(error){showMessage("收藏失敗："+error.message);}
  });
});
