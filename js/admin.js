document.addEventListener("DOMContentLoaded", async () => {
  const { $, getUser, getProfile } = Wuxia;
  const status = $("adminStatus");
  const message = $("adminMessage");
  let authors = [], books = [], chapters = [];
  let authorEditingId = "";

  const say = (text, success = false) => {
    message.textContent = text;
    message.className = "form-message" + (success ? " success" : "");
  };
  const fail = error => say(error?.message || String(error));
  const safeText = value => String(value ?? "").toLocaleLowerCase("zh-Hant");
  const matches = (query, values) => !query || values.some(value => safeText(value).includes(query));

  if (!window.sb) {
    status.textContent = "尚未設定 Supabase。請確認 js/supabase.js 的設定及載入順序。";
    disableForms();
    return;
  }
  try {
    const user = await getUser();
    if (!user) {
      status.textContent = "請先登入管理員帳號。";
      disableForms();
      return;
    }
    const profile = await getProfile();
    if (profile?.role !== "admin") {
      status.textContent = "目前帳號沒有管理員權限。請由 Supabase 管理者授權。";
      disableForms();
      return;
    }
    status.textContent = `已驗證管理員：${user.email}`;
    await loadAll();
  } catch (error) {
    status.textContent = "初始化管理後台失敗：" + (error?.message || String(error));
    disableForms();
  }

  async function loadAll() {
    setBusy(true);
    try {
      const [a, b, c] = await Promise.all([
        sb.from("authors").select("*").order("name"),
        sb.from("books").select("*").order("created_at", { ascending: false }),
        sb.from("chapters").select("*").order("book_id").order("chapter_number")
      ]);
      if (a.error) throw a.error;
      if (b.error) throw b.error;
      if (c.error) throw c.error;
      authors = a.data || [];
      books = b.data || [];
      chapters = c.data || [];
      fillSelects();
      renderStats();
      renderAuthors();
      renderBooks();
      renderChapters();
      renderCategoryFilter();
    } finally {
      setBusy(false);
    }
  }

  function setBusy(busy) {
    ["refreshDataBtn", "exportDataBtn"].forEach(id => { if ($(id)) $(id).disabled = busy; });
  }
  function disableForms() {
    document.querySelectorAll("form button,form input,form select,form textarea,#newBookBtn,#newChapterBtn,#refreshDataBtn,#exportDataBtn,#adminSearch,#categoryFilter").forEach(el => el.disabled = true);
  }
  function query() { return safeText($("adminSearch")?.value.trim() || ""); }
  function selectedCategory() { return $("categoryFilter")?.value || "all"; }

  function renderStats() {
    $("statBooks").textContent = books.length;
    $("statPublishedBooks").textContent = books.filter(item => item.is_published).length;
    $("statChapters").textContent = chapters.length;
    $("statAuthors").textContent = authors.length;
  }
  function fillSelects() {
    const authorSelect = $("bookAuthor");
    const currentAuthor = authorSelect.value;
    authorSelect.replaceChildren(new Option("選擇作者", ""));
    authors.forEach(author => authorSelect.add(new Option(author.name, author.id)));
    if (authors.some(author => author.id === currentAuthor)) authorSelect.value = currentAuthor;

    const bookSelect = $("chapterBook");
    const currentBook = bookSelect.value;
    bookSelect.replaceChildren(new Option("選擇作品", ""));
    books.forEach(book => bookSelect.add(new Option(book.title, book.id)));
    if (books.some(book => book.id === currentBook)) bookSelect.value = currentBook;
  }
  function renderCategoryFilter() {
    const filter = $("categoryFilter");
    const current = filter.value || "all";
    const categories = [...new Set(books.map(book => book.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
    filter.replaceChildren(new Option("所有分類", "all"));
    categories.forEach(category => filter.add(new Option(category, category)));
    filter.value = categories.includes(current) ? current : "all";
  }
  function table(headers, rows, emptyText) {
    const tableEl = document.createElement("table");
    tableEl.className = "admin-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach(header => { const th = document.createElement("th"); th.textContent = header; headRow.append(th); });
    thead.append(headRow); tableEl.append(thead);
    const tbody = document.createElement("tbody");
    if (!rows.length) {
      const tr = document.createElement("tr"), td = document.createElement("td");
      td.colSpan = headers.length; td.className = "admin-empty"; td.textContent = emptyText || "沒有符合條件的資料";
      tr.append(td); tbody.append(tr);
    } else {
      rows.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => { const td = document.createElement("td"); if (cell instanceof Node) td.append(cell); else td.textContent = cell ?? ""; tr.append(td); });
        tbody.append(tr);
      });
    }
    tableEl.append(tbody); return tableEl;
  }
  function actions(items) {
    const div = document.createElement("div"); div.className = "table-actions";
    items.forEach(({ label, run, danger }) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = label;
      if (danger) button.className = "danger";
      button.addEventListener("click", run); div.append(button);
    });
    return div;
  }
  function renderBooks() {
    const target = $("adminBooks"); target.replaceChildren();
    const q = query(), category = selectedCategory();
    const filtered = books.filter(book => (category === "all" || book.category === category) && matches(q, [book.title, book.category, book.description, authors.find(a => a.id === book.author_id)?.name]));
    target.append(table(["作品", "作者", "分類", "章節", "狀態", "操作"], filtered.map(book => [
      book.title,
      authors.find(author => author.id === book.author_id)?.name || "未知作者",
      book.category || "未分類",
      chapters.filter(chapter => chapter.book_id === book.id).length,
      book.is_published ? "公開" : "草稿",
      actions([{ label: "編輯", run: () => editBook(book) }, { label: "刪除", danger: true, run: () => deleteBook(book) }])
    ]), "沒有符合條件的作品"));
    $("booksResultCount").textContent = `顯示 ${filtered.length} / ${books.length} 部作品`;
  }
  function renderAuthors() {
    const target = $("adminAuthors"); target.replaceChildren();
    const q = query();
    const filtered = authors.filter(author => matches(q, [author.name, author.bio]));
    target.append(table(["作者", "簡介", "作品數", "操作"], filtered.map(author => [
      author.name, author.bio || "—", books.filter(book => book.author_id === author.id).length,
      actions([{ label: "編輯", run: () => editAuthor(author) }, { label: "刪除", danger: true, run: () => deleteAuthor(author) }])
    ]), "沒有符合條件的作者"));
  }
  function renderChapters() {
    const target = $("adminChapters"); target.replaceChildren();
    const q = query();
    const filtered = chapters.filter(chapter => matches(q, [chapter.title, chapter.content, books.find(book => book.id === chapter.book_id)?.title, String(chapter.chapter_number)]));
    target.append(table(["作品", "章節", "順序", "字數", "狀態", "操作"], filtered.map(chapter => [
      books.find(book => book.id === chapter.book_id)?.title || "未知作品",
      chapter.title, chapter.chapter_number, (chapter.content || "").length,
      chapter.is_published ? "公開" : "草稿",
      actions([{ label: "編輯", run: () => editChapter(chapter) }, { label: "刪除", danger: true, run: () => deleteChapter(chapter) }])
    ]), "沒有符合條件的章節"));
  }
  function refreshTables() { renderBooks(); renderAuthors(); renderChapters(); }
  function showPanel(id) {
    document.querySelectorAll(".admin-panel").forEach(panel => panel.hidden = panel.id !== id);
    document.querySelectorAll(".admin-tab").forEach(button => button.classList.toggle("active", button.dataset.panel === id));
  }
  document.querySelectorAll(".admin-tab").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.panel)));
  $("adminSearch").addEventListener("input", refreshTables);
  $("categoryFilter").addEventListener("change", renderBooks);
  $("refreshDataBtn").addEventListener("click", async () => { try { await loadAll(); say("資料已重新載入。", true); } catch (error) { fail(error); } });
  $("exportDataBtn").addEventListener("click", exportBackup);

  async function exportBackup() {
    if (typeof window.JSZip === "undefined") {
      say("ZIP 工具載入失敗。請確認網路連線後重新整理頁面。", false);
      return;
    }
    const zip = new window.JSZip();
    const exportedAt = new Date().toISOString();
    const safeFolderName = (title, id) => {
      const safe = String(title || "未命名作品")
        .normalize("NFKC")
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/[. ]+$/g, "")
        .trim() || "未命名作品";
      return `${safe}-${String(id || "unknown").slice(0, 8)}`;
    };
    zip.file("README.md", [
      "# 江湖藏書閣作品資料備份",
      "",
      `匯出時間：${exportedAt}`,
      "",
      "每部作品各自放在 `books/作品名稱-ID/` 資料夾中。作品資料位於 `book.json`，章節正文位於 `chapters/`，每個 Markdown 檔案前方包含章節資訊。",
      "修改這份 ZIP 內的檔案不會自動更新 Supabase；要讓網站內容同步，仍需在管理後台編輯，或透過後續匯入工具寫回資料庫。",
      ""
    ].join("\n"));
    zip.file("authors.json", JSON.stringify(authors, null, 2));
    zip.file("manifest.json", JSON.stringify({
      format: "wuxia-library-folder-backup",
      version: 2,
      exported_at: exportedAt,
      book_count: books.length,
      chapter_count: chapters.length,
      author_count: authors.length
    }, null, 2));

    books.forEach(book => {
      const folder = `books/${safeFolderName(book.title, book.id)}`;
      const author = authors.find(item => item.id === book.author_id) || null;
      const bookChapters = chapters
        .filter(chapter => chapter.book_id === book.id)
        .sort((a, b) => a.chapter_number - b.chapter_number);
      zip.file(`${folder}/book.json`, JSON.stringify({
        ...book,
        author: author ? { id: author.id, name: author.name } : null,
        chapter_count: bookChapters.length
      }, null, 2));
      zip.file(`${folder}/README.md`, [
        `# ${book.title}`,
        "",
        "- 編輯作品資訊：`book.json`",
        "- 章節內容：`chapters/`",
        "- 章節編號採三位數，例如 `001.md`、`002.md`。",
        "- 這是資料備份資料夾；直接修改檔案不會自動同步到 Supabase。",
        ""
      ].join("\n"));
      bookChapters.forEach(chapter => {
        const chapterName = `${String(chapter.chapter_number).padStart(3, "0")}.md`;
        const markdown = [
          "---",
          `id: ${JSON.stringify(chapter.id)}`,
          `book_id: ${JSON.stringify(chapter.book_id)}`,
          `chapter_number: ${chapter.chapter_number}`,
          `title: ${JSON.stringify(chapter.title)}`,
          `is_published: ${Boolean(chapter.is_published)}`,
          "---",
          "",
          chapter.content || "",
          ""
        ].join("\n");
        zip.file(`${folder}/chapters/${chapterName}`, markdown);
      });
    });

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wuxia-library-books-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say("已匯出分作品資料夾 ZIP。每部作品各有獨立資料夾，請妥善保存備份。", true);
    } catch (error) {
      fail(error);
    }
  }

  function resetBookForm() { $("bookForm").reset(); $("bookId").value = ""; $("bookForm").hidden = true; }
  function editBook(book) {
    showPanel("booksPanel"); $("bookForm").hidden = false; $("bookId").value = book.id;
    $("bookTitle").value = book.title; $("bookAuthor").value = book.author_id; $("bookCategory").value = book.category || "";
    $("bookCover").value = book.cover_style || "jade"; $("bookDescription").value = book.description || "";
    $("bookPublished").checked = book.is_published; $("bookForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("newBookBtn").addEventListener("click", () => { resetBookForm(); $("bookForm").hidden = false; });
  $("cancelBookBtn").addEventListener("click", resetBookForm);
  $("bookForm").addEventListener("submit", async event => {
    event.preventDefault(); const id = $("bookId").value;
    const payload = { title: $("bookTitle").value.trim(), author_id: $("bookAuthor").value, category: $("bookCategory").value.trim(), cover_style: $("bookCover").value, description: $("bookDescription").value.trim(), is_published: $("bookPublished").checked };
    try {
      const result = id ? await sb.from("books").update(payload).eq("id", id) : await sb.from("books").insert(payload);
      if (result.error) throw result.error;
      resetBookForm(); await loadAll(); say("作品已儲存。", true);
    } catch (error) { fail(error); }
  });
  async function deleteBook(book) {
    if (!confirm(`確定刪除「${book.title}」及其所有章節、相關收藏與閱讀進度？此操作無法復原。`)) return;
    try { const { error } = await sb.from("books").delete().eq("id", book.id); if (error) throw error; await loadAll(); say("作品已刪除。", true); }
    catch (error) { fail(error); }
  }

  function resetAuthorForm() { $("authorForm").reset(); authorEditingId = ""; $("authorSubmitBtn").textContent = "新增作者"; $("cancelAuthorBtn").hidden = true; }
  function editAuthor(author) {
    showPanel("authorsPanel"); authorEditingId = author.id; $("authorName").value = author.name; $("authorBio").value = author.bio || "";
    $("authorSubmitBtn").textContent = "儲存作者"; $("cancelAuthorBtn").hidden = false; $("authorForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("authorForm").addEventListener("submit", async event => {
    event.preventDefault();
    const payload = { name: $("authorName").value.trim(), bio: $("authorBio").value.trim() };
    try {
      const editing = Boolean(authorEditingId);
      const result = editing ? await sb.from("authors").update(payload).eq("id", authorEditingId) : await sb.from("authors").insert(payload);
      if (result.error) throw result.error;
      resetAuthorForm(); await loadAll(); say(editing ? "作者已更新。" : "作者已新增。", true);
    } catch (error) { fail(error); }
  });
  $("cancelAuthorBtn").addEventListener("click", resetAuthorForm);
  async function deleteAuthor(author) {
    if (!confirm(`確定刪除作者「${author.name}」？若仍有作品，資料庫會拒絕刪除。`)) return;
    try { const { error } = await sb.from("authors").delete().eq("id", author.id); if (error) throw error; await loadAll(); say("作者已刪除。", true); }
    catch (error) { fail(error); }
  }

  function resetChapterForm() { $("chapterForm").reset(); $("chapterId").value = ""; $("chapterNumber").value = 1; $("chapterForm").hidden = true; }
  function editChapter(chapter) {
    showPanel("chaptersPanel"); $("chapterForm").hidden = false; $("chapterId").value = chapter.id;
    $("chapterBook").value = chapter.book_id; $("chapterTitle").value = chapter.title; $("chapterNumber").value = chapter.chapter_number;
    $("chapterContent").value = chapter.content || ""; $("chapterPublished").checked = chapter.is_published;
    $("chapterForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("newChapterBtn").addEventListener("click", () => { resetChapterForm(); $("chapterForm").hidden = false; });
  $("cancelChapterBtn").addEventListener("click", resetChapterForm);
  $("chapterForm").addEventListener("submit", async event => {
    event.preventDefault(); const id = $("chapterId").value;
    const payload = { book_id: $("chapterBook").value, title: $("chapterTitle").value.trim(), chapter_number: Number($("chapterNumber").value), content: $("chapterContent").value, is_published: $("chapterPublished").checked };
    try {
      const result = id ? await sb.from("chapters").update(payload).eq("id", id) : await sb.from("chapters").insert(payload);
      if (result.error) throw result.error;
      resetChapterForm(); await loadAll(); say("章節已儲存。", true);
    } catch (error) { fail(error); }
  });
  async function deleteChapter(chapter) {
    if (!confirm(`確定刪除章節「${chapter.title}」？此操作無法復原。`)) return;
    try { const { error } = await sb.from("chapters").delete().eq("id", chapter.id); if (error) throw error; await loadAll(); say("章節已刪除。", true); }
    catch (error) { fail(error); }
  }
});
