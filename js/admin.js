document.addEventListener("DOMContentLoaded", async()=>{
  const {$,getUser,getProfile,escapeHtml}=Wuxia;
  const status=$("adminStatus"),message=$("adminMessage");
  let authors=[],books=[],chapters=[];
  const say=(text,success=false)=>{message.textContent=text;message.className="form-message"+(success?" success":"");};
  const fail=error=>say(error.message||String(error));
  if(!window.sb){status.textContent="尚未設定 Supabase。管理後台需要雲端資料庫及管理員權限。";disableForms();return;}
  const user=await getUser();
  if(!user){status.textContent="請先登入管理員帳號。";disableForms();return;}
  const profile=await getProfile();
  if(profile?.role!=="admin"){status.textContent="目前帳號沒有管理員權限。請由既有管理員在 Supabase profiles 資料表授權。";disableForms();return;}
  status.textContent=`已驗證管理員：${user.email}`;
  async function loadAll(){
    const a=await sb.from("authors").select("*").order("name");if(a.error)throw a.error;authors=a.data||[];
    const b=await sb.from("books").select("*").order("created_at",{ascending:false});if(b.error)throw b.error;books=b.data||[];
    const c=await sb.from("chapters").select("*").order("book_id").order("chapter_number");if(c.error)throw c.error;chapters=c.data||[];
    fillSelects();renderAuthors();renderBooks();renderChapters();
  }
  function fillSelects(){
    $("bookAuthor").replaceChildren();authors.forEach(a=>{const o=new Option(a.name,a.id);$("bookAuthor").add(o);});
    $("chapterBook").replaceChildren();books.forEach(b=>{const o=new Option(b.title,b.id);$("chapterBook").add(o);});
  }
  function table(headers,rows){
    const table=document.createElement("table");table.className="admin-table";
    const thead=document.createElement("thead"),tr=document.createElement("tr");
    headers.forEach(h=>{const th=document.createElement("th");th.textContent=h;tr.append(th);});thead.append(tr);table.append(thead);
    const tbody=document.createElement("tbody");
    rows.forEach(row=>{const tr=document.createElement("tr");row.forEach(cell=>{const td=document.createElement("td");if(cell instanceof Node)td.append(cell);else td.textContent=cell??"";tr.append(td);});tbody.append(tr);});
    table.append(tbody);return table;
  }
  function actions(items){const div=document.createElement("div");div.className="table-actions";items.forEach(({label,run,danger})=>{const b=document.createElement("button");b.textContent=label;if(danger)b.className="danger";b.addEventListener("click",run);div.append(b);});return div;}
  function renderBooks(){
    const target=$("adminBooks");target.replaceChildren();
    target.append(table(["作品","分類","狀態","操作"],books.map(book=>[
      book.title,book.category||"未分類",book.is_published?"公開":"草稿",
      actions([{label:"編輯",run:()=>editBook(book)},{label:"刪除",danger:true,run:()=>deleteBook(book)}])
    ])));
  }
  function renderAuthors(){
    const target=$("adminAuthors");target.replaceChildren();
    target.append(table(["作者","簡介","操作"],authors.map(author=>[
      author.name,author.bio||"—",actions([{label:"刪除",danger:true,run:()=>deleteAuthor(author)}])
    ])));
  }
  function renderChapters(){
    const target=$("adminChapters");target.replaceChildren();
    target.append(table(["作品","章節","順序","狀態","操作"],chapters.map(chapter=>[
      books.find(b=>b.id===chapter.book_id)?.title||"未知作品",chapter.title,chapter.chapter_number,chapter.is_published?"公開":"草稿",
      actions([{label:"編輯",run:()=>editChapter(chapter)},{label:"刪除",danger:true,run:()=>deleteChapter(chapter)}])
    ])));
  }
  function disableForms(){document.querySelectorAll("form button,form input,form select,form textarea,#newBookBtn,#newChapterBtn").forEach(el=>el.disabled=true);}
  function showPanel(id){document.querySelectorAll(".admin-panel").forEach(p=>p.hidden=p.id!==id);document.querySelectorAll(".admin-tab").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));}
  document.querySelectorAll(".admin-tab").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panel)));
  function resetBookForm(){ $("bookForm").reset();$("bookId").value="";$("bookForm").hidden=true; }
  function editBook(book){
    showPanel("booksPanel");$("bookForm").hidden=false;$("bookId").value=book.id;$("bookTitle").value=book.title;$("bookAuthor").value=book.author_id;$("bookCategory").value=book.category||"";$("bookCover").value=book.cover_style||"jade";$("bookDescription").value=book.description||"";$("bookPublished").checked=book.is_published;
    $("bookForm").scrollIntoView({behavior:"smooth",block:"center"});
  }
  $("newBookBtn").addEventListener("click",()=>{resetBookForm();$("bookForm").hidden=false;});
  $("cancelBookBtn").addEventListener("click",resetBookForm);
  $("bookForm").addEventListener("submit",async e=>{
    e.preventDefault();const id=$("bookId").value;
    const payload={title:$("bookTitle").value.trim(),author_id:$("bookAuthor").value,category:$("bookCategory").value.trim(),cover_style:$("bookCover").value,description:$("bookDescription").value.trim(),is_published:$("bookPublished").checked};
    try{const result=id?await sb.from("books").update(payload).eq("id",id):await sb.from("books").insert(payload);if(result.error)throw result.error;resetBookForm();await loadAll();say("作品已儲存。",true);}catch(error){fail(error);}
  });
  $("authorForm").addEventListener("submit",async e=>{
    e.preventDefault();try{const {error}=await sb.from("authors").insert({name:$("authorName").value.trim(),bio:$("authorBio").value.trim()});if(error)throw error;$("authorForm").reset();await loadAll();say("作者已新增。",true);}catch(error){fail(error);}
  });
  async function deleteBook(book){if(!confirm(`確定刪除「${book.title}」及其章節？`))return;try{const {error}=await sb.from("books").delete().eq("id",book.id);if(error)throw error;await loadAll();say("作品已刪除。",true);}catch(error){fail(error);}}
  async function deleteAuthor(author){if(!confirm(`確定刪除作者「${author.name}」？該作者若仍有作品，資料庫會拒絕刪除。`))return;try{const {error}=await sb.from("authors").delete().eq("id",author.id);if(error)throw error;await loadAll();say("作者已刪除。",true);}catch(error){fail(error);}}
  function resetChapterForm(){$("chapterForm").reset();$("chapterId").value="";$("chapterNumber").value=1;$("chapterForm").hidden=true;}
  function editChapter(chapter){showPanel("chaptersPanel");$("chapterForm").hidden=false;$("chapterId").value=chapter.id;$("chapterBook").value=chapter.book_id;$("chapterTitle").value=chapter.title;$("chapterNumber").value=chapter.chapter_number;$("chapterContent").value=chapter.content;$("chapterPublished").checked=chapter.is_published;$("chapterForm").scrollIntoView({behavior:"smooth",block:"center"});}
  $("newChapterBtn").addEventListener("click",()=>{resetChapterForm();$("chapterForm").hidden=false;});
  $("cancelChapterBtn").addEventListener("click",resetChapterForm);
  $("chapterForm").addEventListener("submit",async e=>{
    e.preventDefault();const id=$("chapterId").value;
    const payload={book_id:$("chapterBook").value,title:$("chapterTitle").value.trim(),chapter_number:Number($("chapterNumber").value),content:$("chapterContent").value,is_published:$("chapterPublished").checked};
    try{const result=id?await sb.from("chapters").update(payload).eq("id",id):await sb.from("chapters").insert(payload);if(result.error)throw result.error;resetChapterForm();await loadAll();say("章節已儲存。",true);}catch(error){fail(error);}
  });
  async function deleteChapter(chapter){if(!confirm(`確定刪除章節「${chapter.title}」？`))return;try{const {error}=await sb.from("chapters").delete().eq("id",chapter.id);if(error)throw error;await loadAll();say("章節已刪除。",true);}catch(error){fail(error);}}
  try{await loadAll();}catch(error){status.textContent="載入管理資料失敗："+error.message;}
});
