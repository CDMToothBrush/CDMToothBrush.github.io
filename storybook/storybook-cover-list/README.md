# Storybook Cover List

這是一個可愛的故事書封面清單網頁專案，專為小朋友設計。使用者可以點擊每個故事書的封面，並在新視窗中查看故事書的內容。專案還提供了依據名稱和更新日期的排序功能，讓使用者能夠輕鬆找到他們喜愛的故事書。

## 專案結構

- `public/index.html`：主 HTML 檔案，包含基本結構和引入的 JavaScript 檔案。
- `src/assets/styles/cute-theme.css`：可愛的主題樣式，適合小孩的視覺風格。
- `src/components/CoverList.tsx`：顯示故事書封面清單的 React 組件，包含排序功能。
- `src/components/CoverItem.tsx`：顯示單個故事書封面的 React 組件，提供點擊連結到故事書的功能。
- `src/components/SortBar.tsx`：提供排序選項的 React 組件，依據名稱和更新日期進行排序。
- `src/data/books.json`：包含故事書資料的 JSON 檔案，包括名稱、封面圖片連結和更新日期等資訊。
- `src/App.tsx`：應用程式的主組件，負責組合其他組件並管理應用的狀態。
- `src/types/index.ts`：定義 TypeScript 的類型和介面，可能包括故事書的資料結構。
- `tsconfig.json`：TypeScript 的配置檔案，指定編譯選項和要包含的檔案。
- `package.json`：npm 的配置檔案，列出專案的依賴和腳本。

## 使用說明

1. 克隆此專案到本地。
2. 在專案目錄中運行 `npm install` 安裝依賴。
3. 使用 `npm start` 啟動開發伺服器。
4. 打開瀏覽器並訪問 `http://localhost:3000` 查看故事書封面清單。

希望你喜歡這個可愛的故事書封面清單專案！