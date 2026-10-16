# 每部作品獨立資料夾

每部作品各自存放於本資料夾中：

```text
content/books/
├── shediao-yingxiongzhuan/
│   ├── book.json
│   ├── README.md
│   └── chapters/
│       └── 001.md
├── shendiao-xialv/
│   ├── book.json
│   └── chapters/
└── _template-work/
```

- `book.json`：書名、作者、分類、簡介、封面樣式等作品資料。
- `chapters/001.md`：單章正文；每章一個檔案，使用三位數章節編號。
- 新作品請複製 `_template-work` 資料夾，重新命名後再填入資料。

**同步注意：** GitHub Pages 是靜態網站；目前線上作品、作者與章節的即時資料儲存在 Supabase。`content/books/` 是便於版本管理的原始檔副本，修改這裡不會自動寫入 Supabase。管理後台的「匯出分作品資料夾 ZIP」會依照當前資料庫內容建立可更新的分作品備份。
