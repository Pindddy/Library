document.addEventListener("DOMContentLoaded", async () => {
  const {$,loadBooks,escapeHtml} = Wuxia;
  let books = [];
  let category = "";
  const grid = $("bookGrid");
  const empty = $("emptyState");

  function coverClass(style) {
    return ({red:"red",blue:"blue",gold:"gold",jade:""}[style] ?? "");
  }

  function render() {
    const keyword = $("searchInput").value.trim().toLocaleLowerCase();
    const author = $("authorFilter").value;
    const sort = $("sortFilter").value;
    let filtered = books.filter(book => {
      const searchable = [book.title,book.author_name,book.category,book.description].join(" ").toLocaleLowerCase();
      return searchable.includes(keyword) && (!author || book.author_name === author) && (!category || book.category === category);
    });
    if (sort === "title") filtered.sort((a,b)=>a.title.localeCompare(b.title,"zh-Hant"));
    if (sort === "author") filtered.sort((a,b)=>a.author_name.localeCompare(b.author_name,"zh-Hant"));
    $("resultCount").textContent = `找到 ${filtered.length} 部作品`;
    grid.replaceChildren();
    empty.hidden = filtered.length !== 0;
    filtered.forEach((book,index) => {
      const card = document.createElement("article");
      card.className = "book-card";
      const cover = document.createElement("div");
      cover.className = `book-cover ${coverClass(book.cover_style)}`;
      cover.innerHTML = `<div class="cover-sun"></div><div class="cover-mountain"></div><div class="cover-title">${escapeHtml(book.title)}</div><div class="cover-label">江湖藏書閣</div><div class="cover-number">${String(index+1).padStart(2,"0")}</div>`;
      const info = document.createElement("div");
      info.className = "book-info";
      info.innerHTML = `<div class="book-category">${escapeHtml(book.category || "武俠小說")}</div><h3 title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3><div class="book-author">著者｜${escapeHtml(book.author_name)}</div><p class="book-description">${escapeHtml(book.description || "尚未提供作品簡介。")}</p><div class="book-bottom"><span class="book-chapters">${book.chapters.length} 個章節</span><button class="book-open">開始閱讀 ↗</button></div>`;
      info.querySelector("button").addEventListener("click",()=>location.href=`./reader.html?book=${encodeURIComponent(book.id)}`);
      card.append(cover,info);grid.append(card);
    });
  }

  try {
    books = await loadBooks();
    $("dataStatus").textContent = window.SUPABASE_READY ? "已連接雲端書庫" : "示範模式 · 尚未連接資料庫";
    const authors = [...new Set(books.map(b=>b.author_name))].sort((a,b)=>a.localeCompare(b,"zh-Hant"));
    authors.forEach(name=>{const option=document.createElement("option");option.value=name;option.textContent=name;$("authorFilter").append(option);});
    $("statBooks").textContent = books.length;
    $("statAuthors").textContent = authors.length;
    $("statChapters").textContent = books.reduce((n,b)=>n+b.chapters.length,0);
    render();
  } catch(error) {
    $("dataStatus").textContent = "無法載入雲端書庫";
    grid.innerHTML = `<div class="empty-state"><h3>載入失敗</h3><p>${escapeHtml(error.message)}<br>請檢查 Supabase 設定與資料表。</p></div>`;
  }

  $("searchInput").addEventListener("input",render);
  $("authorFilter").addEventListener("change",render);
  $("sortFilter").addEventListener("change",render);
  $("categoryRow").addEventListener("click",event=>{
    const btn=event.target.closest("[data-category]");if(!btn)return;
    category=btn.dataset.category;
    $("categoryRow").querySelectorAll(".chip").forEach(chip=>chip.classList.toggle("active",chip===btn));
    render();
  });
});
