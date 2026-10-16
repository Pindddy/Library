window.Wuxia = (() => {
  const $ = id => document.getElementById(id);
  const demoBooks = [
    {id:"demo-1",title:"射鵰英雄傳",author_name:"金庸",category:"經典武俠",description:"以郭靖的成長為主線，交織江湖恩怨、家國情懷與武林傳奇。",cover_style:"jade",chapters:[{id:"d1c1",title:"第一章：大漠風雲",chapter_number:1,content:"暮色漸沉，遠山如黛。官道盡頭，一間老酒肆亮起昏黃燈火。屋外風聲漸急，簷下的銅鈴卻始終沒有響起。\n\n店中只有三張桌子，其中兩張空著。靠窗的青衣客放下茶盞，目光落在門外那柄被雨水打濕的長劍上。他沒有問劍的主人是誰，只說了一句：今晚的風，不太尋常。\n\n掌櫃聞言抬頭，手中的算盤停了一瞬。這座小鎮平日少有外客，近來卻接連來了幾名陌生人。有人尋人，有人尋物，也有人似乎只為等候一個從未露面的對手。"}]},
    {id:"demo-2",title:"神鵰俠侶",author_name:"金庸",category:"經典武俠",description:"楊過與小龍女的江湖經歷，交織情義、成長與世俗的衝突。",cover_style:"blue",chapters:[{id:"d2c1",title:"第一章：古墓初遇",chapter_number:1,content:"山間晨霧尚未散去，石階一路隱入松林深處。少年停下腳步，聽見林間傳來清越的鳥鳴，也聽見遠處似有人踏葉而來。\n\n他不知道前方等待自己的是何種命運，只將行囊重新繫緊，沿著石階繼續向前。江湖從不會因為一個人尚未準備好，就暫停它的風雨。"}]},
    {id:"demo-3",title:"天龍八部",author_name:"金庸",category:"群像武俠",description:"多位人物的命運交錯，呈現恩怨、身世與命運的複雜關係。",cover_style:"gold",chapters:[{id:"d3c1",title:"第一章：江湖異聞",chapter_number:1,content:"北風穿過城門，吹動街角酒旗。說書人拍下醒木，茶客們逐漸安靜下來，等著聽那段已在江湖流傳多年的故事。\n\n故事裡有豪傑，也有凡人；有一諾千金，也有身不由己。至於誰是英雄，誰又是輸家，往往要等到最後一頁才能知曉。"}]},
    {id:"demo-4",title:"笑傲江湖",author_name:"金庸",category:"經典武俠",description:"令狐沖身處門派紛爭與權力角逐之中，追尋自己的江湖之道。",cover_style:"red",chapters:[{id:"d4c1",title:"第一章：山門風波",chapter_number:1,content:"山門外雨聲連綿，石獅旁積起一汪清水。來客將斗笠放在門邊，沒有通報姓名，只向守門弟子問了一句：今日山上，可有人下山？\n\n弟子看了他一眼，發現那人衣著平常，腰間也沒有兵刃，卻有一種令人不敢輕忽的沉靜。"}]},
    {id:"demo-5",title:"多情劍客無情劍",author_name:"古龍",category:"奇情武俠",description:"以李尋歡的經歷，描繪友情、情感與江湖規則的矛盾。",cover_style:"blue",chapters:[{id:"d5c1",title:"第一章：風雪來客",chapter_number:1,content:"雪落得很慢，像是天地都忘了時間。客棧裡的人各懷心事，沒有人留意角落那個咳嗽的旅人。\n\n他面前的酒已經冷了，手邊的木盒卻收拾得一塵不染。有些人把刀藏在袖中，有些人把往事藏在心底；而真正危險的人，往往不需要提醒旁人他有多危險。"}]},
    {id:"demo-6",title:"楚留香傳奇",author_name:"古龍",category:"探案武俠",description:"楚留香憑藉機智與觀察力，追查撲朔迷離的江湖事件。",cover_style:"jade",chapters:[{id:"d6c1",title:"第一章：夜訪神秘客",chapter_number:1,content:"夜半，窗櫺被人輕敲三下。桌上的燈火未動，房中卻已多了一個人影。\n\n「你來得比我預想的晚。」坐在桌旁的人說。\n\n來客笑了笑，將一封沒有署名的信放在桌上。信封乾燥，窗外卻正下著雨。這個細節，足以讓一場看似簡單的拜訪變成一樁謎案。"}]},
    {id:"demo-7",title:"白髮魔女傳",author_name:"梁羽生",category:"歷史武俠",description:"以卓一航與練霓裳的故事，描繪情感、門派與時代的衝突。",cover_style:"gold",chapters:[{id:"d7c1",title:"第一章：塞外奇遇",chapter_number:1,content:"塞外的風帶著沙礫，吹過荒草與殘碑。年輕的旅人勒住馬，望見遠處一抹白影掠過山脊。\n\n他追了幾里，白影便消失在山谷之間。留下的只有一串足跡，以及一個多年後仍被人反覆提起的疑問：那日究竟是誰先看見了誰？"}]},
    {id:"demo-8",title:"七劍下天山",author_name:"梁羽生",category:"歷史武俠",description:"天山高手與江湖人物的行動，展開一段俠義傳奇。",cover_style:"red",chapters:[{id:"d8c1",title:"第一章：天山傳人",chapter_number:1,content:"天山積雪映著晨光，山路旁的松枝垂滿霜花。一位老人將長劍交到少年手中，只說此行不為爭名，也不為報仇。\n\n「若有一天，你必須在勝負與道義之間作出選擇，記住今日的山色。」少年沒有回答，只把這句話牢牢記在心裡。"}]}
  ];

  let cachedBooks = null;
  let cachedUser = undefined;
  let cachedProfile = undefined;
  const demoFavorites = new Set(JSON.parse(localStorage.getItem("wuxia-demo-favorites") || "[]"));

  async function getUser() {
    if (!window.sb) return null;
    const {data, error} = await sb.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function getProfile() {
    if (cachedProfile !== undefined) return cachedProfile;
    const user = await getUser();
    if (!user) { cachedProfile = null; return null; }
    const {data} = await sb.from("profiles").select("id,display_name,role").eq("id", user.id).maybeSingle();
    cachedProfile = data || {id:user.id, display_name:user.email, role:"reader"};
    return cachedProfile;
  }

  async function loadBooks({includeUnpublished=false}={}) {
    if (!window.sb) return demoBooks;
    let query = sb.from("books").select("id,title,description,category,cover_style,is_published,author_id,authors(name),chapters(id,title,chapter_number,content,is_published)").order("created_at",{ascending:false});
    if (!includeUnpublished) query = query.eq("is_published",true);
    const {data,error} = await query;
    if (error) throw error;
    return (data || []).map(b => ({
      ...b, author_name:b.authors?.name || "未署名",
      chapters:(b.chapters || []).filter(c => includeUnpublished || c.is_published).sort((a,b)=>a.chapter_number-b.chapter_number)
    }));
  }

  async function isFavorite(bookId) {
    const user = await getUser();
    if (!window.sb || !user || String(bookId).startsWith("demo-")) return demoFavorites.has(String(bookId));
    const {data,error} = await sb.from("favorites").select("book_id").eq("user_id",user.id).eq("book_id",bookId).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async function toggleFavorite(bookId) {
    const user = await getUser();
    if (!window.sb || !user || String(bookId).startsWith("demo-")) {
      const id = String(bookId);
      if (demoFavorites.has(id)) demoFavorites.delete(id); else demoFavorites.add(id);
      localStorage.setItem("wuxia-demo-favorites",JSON.stringify([...demoFavorites]));
      return demoFavorites.has(id);
    }
    const {data,error} = await sb.from("favorites").select("book_id").eq("user_id",user.id).eq("book_id",bookId).maybeSingle();
    if (error) throw error;
    if (data) {
      const result = await sb.from("favorites").delete().eq("user_id",user.id).eq("book_id",bookId);
      if (result.error) throw result.error;
      return false;
    }
    const result = await sb.from("favorites").insert({user_id:user.id,book_id:bookId});
    if (result.error) throw result.error;
    return true;
  }

  async function saveProgress(bookId, chapterId) {
    const user = await getUser();
    if (!window.sb || !user || String(bookId).startsWith("demo-")) {
      localStorage.setItem("wuxia-progress-" + bookId, chapterId);
      return;
    }
    const {error} = await sb.from("reading_progress").upsert({user_id:user.id,book_id:bookId,chapter_id:chapterId,updated_at:new Date().toISOString()},{onConflict:"user_id,book_id"});
    if (error) throw error;
  }

  async function getProgress(bookId) {
    const user = await getUser();
    if (!window.sb || !user || String(bookId).startsWith("demo-")) return localStorage.getItem("wuxia-progress-" + bookId);
    const {data,error} = await sb.from("reading_progress").select("chapter_id").eq("user_id",user.id).eq("book_id",bookId).maybeSingle();
    if (error) throw error;
    return data?.chapter_id || null;
  }

  async function renderHeader() {
    const user = await getUser();
    const authNav = $("authNav");
    if (authNav) {
      if (user) {
        authNav.textContent = "登出";
        authNav.href = "#logout";
        authNav.onclick = async e => {
          e.preventDefault();
          await sb.auth.signOut();
          location.reload();
        };
      } else {
        authNav.textContent = "登入 / 註冊";
        authNav.href = "./auth.html";
        authNav.onclick = null;
      }
    }
    const profile = await getProfile();
    const adminNav = $("adminNav");
    if (adminNav) adminNav.hidden = profile?.role !== "admin";
    $("year") && ($("year").textContent = new Date().getFullYear());
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  return { $, demoBooks, getUser, getProfile, loadBooks, isFavorite, toggleFavorite, saveProgress, getProgress, renderHeader, escapeHtml };
})();

document.addEventListener("DOMContentLoaded", () => {
  Wuxia.renderHeader().catch(console.error);
});
