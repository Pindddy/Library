# 江湖藏書閣 2.0

以 HTML、CSS、JavaScript、GitHub Pages 和 Supabase 建立的武俠小說圖書館。

## 功能

- 書庫搜尋、作者篩選、分類及排序
- 閱讀器、章節切換、字體大小、閱讀背景切換
- Supabase Auth 會員登入／註冊
- 雲端收藏與閱讀進度
- 管理員作品、作者、章節 CRUD
- Row Level Security (RLS) 權限政策
- Supabase 未設定時可瀏覽本機示範資料

## 1. 建立 Supabase

1. 建立 Supabase 專案。
2. 打開 SQL Editor，執行 `sql/schema.sql`。
3. 再執行 `sql/seed.sql`。
4. 到 Project Settings / API（或 Connect）取得 Project URL 和公開 publishable key（舊專案可使用 anon key）。
5. 編輯 `js/supabase.js`，填入設定。

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY"
};
```

**不要**將 `service_role` 或 secret key 放進前端、GitHub repository 或 GitHub Pages。

## 2. 設定會員登入

Supabase Dashboard → Authentication → URL Configuration：

- Site URL：填入你的 GitHub Pages 網址，例如 `https://USERNAME.github.io/WuxiaLibrary/`
- Redirect URLs：加入相同網址及你實際使用的回呼網址。
- 可依需求設定郵件驗證。

網站以電子郵件與密碼註冊、登入。若啟用郵件驗證，使用者需先完成驗證。

## 3. 建立第一位管理員

1. 先透過網站註冊你的帳號並登入一次。
2. 在 Supabase Dashboard → SQL Editor 執行下列 SQL，將 email 改成你註冊使用的電子郵件：

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'YOUR_EMAIL@example.com';
```

這個動作只能由可信任的專案管理者在 Supabase SQL Editor 執行。不要在前端提供會員自行升級成管理員的功能。

## 4. 部署到 GitHub Pages

1. 在 GitHub 建立 repository，例如 `WuxiaLibrary`。
2. 上傳 `index.html`、其他 HTML、`css/`、`js/` 和 `sql/`。
3. Repository → Settings → Pages。
4. 在 Build and deployment 選擇 `Deploy from a branch`。
5. 選擇 `main` 分支及 `/ (root)`，按 Save。
6. 等待部署完成，打開 GitHub 顯示的網站網址。

所有網站內部連結都使用相對路徑，適用於 GitHub Pages 專案子路徑。

## 5. 重要注意事項

- `sql/` 只是 SQL 腳本資料夾，GitHub Pages 不會自動執行 SQL。
- Supabase 的公開 publishable/anon key 可以出現在前端；安全性必須依靠正確的 RLS policy。
- 絕對不要將 `service_role` 或 secret key 放入前端。
- 管理後台的角色檢查由 `profiles.role` 和資料庫 `is_admin()` policy 控制。
- 書庫 seed 只有少量範例。示範正文是原創測試內容，不是任何既有小說的原文。
- 若要正式公開完整小說，請確保你有權發布相關作品及正文。
- 目前書架的訪客收藏使用瀏覽器 localStorage；登入後收藏與閱讀進度可同步至 Supabase。
