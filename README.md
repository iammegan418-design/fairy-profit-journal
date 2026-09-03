# ✨ 仙女獲利手帳

> 記錄每一筆努力 · 看見自己的豐盛

仙女團隊專屬的每日獲利紀錄工具。夥伴打開網站，輸入銷售金額與成本，系統自動算出獲利，
並整理成「本月 / 今年 / 歷年累積」三種視角與趨勢曲線。

- 不用註冊、不用帳號密碼，第一次只填一個暱稱
- 紀錄存在使用者自己的瀏覽器，重新整理不會消失
- 手機可以「加入主畫面」，桌面圖示就是仙女獲利手帳的 Logo
- 可以匯出／匯入備份檔，換手機也不怕不見

---

## 一、這個專案裡有什麼

```
fairy-profit-journal/
├── index.html                  網站主頁（所有畫面都在這裡）
├── src/
│   ├── styles.css              全站樣式（品牌配色、版面、RWD）
│   └── main.js                 全部功能：紀錄、統計、曲線圖、備份
├── public/
│   ├── manifest.webmanifest    App 名稱與圖示設定（加入主畫面用）
│   └── icons/
│       ├── icon-32.png         瀏覽器分頁 favicon
│       ├── icon-180.png        iPhone 加入主畫面圖示
│       ├── icon-192.png        Android 圖示
│       ├── icon-512.png        Android 高解析圖示
│       ├── logo-lg.png         歡迎頁的大 Logo
│       ├── logo-sm.png         頁首的小 Logo
│       └── logo-original.png   原始 Logo 母檔（保存用）
├── standalone/
│   └── 仙女獲利手帳-單檔版.html   不用安裝、直接可用的單一檔案版本
├── .github/workflows/deploy.yml  自動部署到 GitHub Pages
├── package.json                套件與指令設定
├── vite.config.js              打包設定
├── netlify.toml                Netlify 部署設定
├── .env.example                環境變數範例（目前用不到，先留著）
└── .gitignore                  不要上傳到 GitHub 的東西
```

---

## 二、在自己電腦上執行（3 個步驟）

需要先安裝 [Node.js](https://nodejs.org/)（選 LTS 版本，一直按下一步就好）。

打開終端機（Mac：終端機／Windows：PowerShell），切換到這個資料夾，然後：

```bash
npm install     # 1. 安裝需要的套件（只要做一次）
npm run dev     # 2. 啟動網站
```

畫面會出現一個網址，例如 `http://localhost:5173`，用瀏覽器打開就看得到網站。
終端機還會顯示一個 `http://192.168.x.x:5173` 的網址，同一個 Wi-Fi 下用手機打開，就能直接測手機版。

要停止：在終端機按 `Ctrl + C`。

```bash
npm run build   # 3. 打包正式版，結果會放在 dist/ 資料夾
npm run preview # （選用）預覽打包後的成果
```

> 不想安裝任何東西也可以：直接打開 `standalone/仙女獲利手帳-單檔版.html`，
> 那是把所有圖片與程式打包進去的單一檔案版本，功能完全一樣。

---

## 三、部署到網路上（三選一）

### 方式 A｜GitHub Pages（免費，專案已附設定）

1. 把整個專案上傳到 GitHub（見下方第五節）。
2. GitHub 專案頁 → **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
3. 之後每次上傳新版本，網站會自動更新，網址類似
   `https://你的帳號.github.io/fairy-profit-journal/`

### 方式 B｜Netlify（最簡單，可綁自己的網域）

1. 到 [netlify.com](https://www.netlify.com/) 註冊，選 **Add new site → Import an existing project**。
2. 連結 GitHub 專案，Build command 填 `npm run build`，Publish directory 填 `dist`（`netlify.toml` 已經寫好，通常會自動帶入）。
3. 按部署，幾十秒後就有網址。

### 方式 C｜Vercel

到 [vercel.com](https://vercel.com/) 匯入 GitHub 專案，框架選 **Vite**，其餘用預設值即可。

---

## 四、手機加入主畫面

**iPhone（Safari）**：用 Safari 打開網站網址 → 分享按鈕 → 加入主畫面 → 顯示名稱是「仙女獲利手帳」，圖示是正式 Logo。
**Android（Chrome）**：右上角選單 → 加入主畫面／安裝應用程式。

⚠️ 一定要用「網址」打開才會有這個功能，本機直接雙擊 HTML 檔不會出現。
如果之前加過舊版本，請先把桌面舊圖示刪掉再重新加入，否則手機會沿用舊的快取圖示。

---

## 五、上傳到 GitHub

```bash
git init
git add .
git commit -m "仙女獲利手帳 第一版"
git branch -M main
git remote add origin https://github.com/你的帳號/fairy-profit-journal.git
git push -u origin main
```

`.gitignore` 已經設定好，`node_modules/`、`dist/`、`.env` 都不會被上傳。

---

## 六、資料存在哪裡？

目前所有紀錄存在使用者自己瀏覽器的 **localStorage**，key 是 `fairy_profit_journal_v1`。

- 沒有後端、沒有資料庫、沒有 API Key，**不需要設定任何環境變數**。
- 每位夥伴看到的都是自己手機上的紀錄，彼此看不到對方的數字。
- 重新整理、關掉再打開，紀錄都還在。
- 但如果**換手機、換瀏覽器、清除瀏覽器資料**，紀錄會不見 → 請提醒夥伴定期到「設定與備份」匯出備份檔。

未來若要升級成雲端保存（換手機也不怕、可跨裝置），到時才會需要後端服務與金鑰，
設定請寫進 `.env`（記得只把 `.env.example` 上傳 GitHub，`.env` 永遠不要上傳）。

---

## 七、功能一覽

| 畫面 | 內容 |
| --- | --- |
| 歡迎頁 | Logo、品牌標語、第一次進入的說明 |
| 建立手帳 | 只問暱稱，之後每次打開都是「歡迎○○回來」 |
| 首頁 | 本月獲利、本月銷售／成本、記錄按鈕、本月每日曲線、今年累積、歷年累積 |
| 記一筆 | 日期自動帶今天，填銷售與成本即時算出獲利，補充資料為選填 |
| 月度獲利 | 月份可前後切換、月總覽、每日曲線、每日紀錄（可修改／刪除） |
| 年度獲利 | 年份切換、年度總覽、1～12 月曲線、每月明細 |
| 設定與備份 | 修改名字、匯出／匯入備份檔、清除全部紀錄 |

---

仙女團隊專屬資源｜巧穎開發 ✨
Fairy Team · Created by 巧穎
