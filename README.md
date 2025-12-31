# Pro Chess ♟️

Game cờ vua chuyên nghiệp với AI mạnh, chơi online real-time và phân tích nước đi chi tiết.

## ✨ Tính năng

- 🎮 **Bàn cờ đẹp với drag-drop** - Giao diện hiện đại, dễ sử dụng như chess.com
- 🤖 **Bot AI mạnh** - Sử dụng Stockfish.js, AI chơi client-side miễn phí
- 🌐 **Chơi online multiplayer** - Real-time 2 người qua link phòng (Firebase Realtime Database)
- 📊 **Phân tích nước đi** - Icons đánh giá như:
  - 💡 Nước đi thiên tài (Brilliant)
  - ⭐ Nước đi tốt nhất (Best)
  - 👍 Nước đi tốt (Good)
  - ⚠️ Không chính xác (Inaccuracy)
  - 😬 Sai lầm (Mistake)
  - 🤦 Ngớ ngẩn (Blunder)
- 📈 **Phân tích sau game** - Xem chi tiết từng nước đi với centipawn loss

## 🚀 Deploy lên Vercel (Miễn phí vĩnh viễn)

### Bước 1: Chuẩn bị

1. Đảm bảo code đã sẵn sàng:
   ```bash
   npm run build
   ```

2. Kiểm tra file `vercel.json` đã có trong project

### Bước 2: Deploy

**Cách 1: Deploy qua Vercel CLI (Khuyến nghị)**

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login vào Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

**Cách 2: Deploy qua GitHub (Tự động)**

1. Push code lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Vào [vercel.com](https://vercel.com)
3. Sign in với GitHub
4. Click "New Project"
5. Import repository của bạn
6. Vercel sẽ tự động detect Next.js và deploy
7. Bạn sẽ có domain: `your-project.vercel.app` (MIỄN PHÍ VĨNH VIỄN!)

### Bước 3: Cấu hình Environment Variables (nếu cần)

Nếu bạn muốn dùng Firebase riêng:
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm các biến môi trường cần thiết

### Bước 4: Custom Domain (Tùy chọn)

1. Vào Vercel Dashboard → Project → Settings → Domains
2. Thêm domain của bạn (miễn phí SSL tự động)

## 📦 Cài đặt và chạy local

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production
npm start
```

## 🛠️ Công nghệ sử dụng

- **Next.js 16** - React framework
- **React Chessboard** - UI bàn cờ
- **Chess.js** - Logic game cờ vua
- **Stockfish.js** - AI engine (client-side)
- **Firebase Realtime Database** - Online multiplayer
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 📁 Cấu trúc project

```
pro_chess/
├── src/
│   └── app/
│       ├── components/
│       │   ├── MoveEvaluation.tsx    # Popup đánh giá nước đi
│       │   └── GameAnalysis.tsx      # Phân tích sau game
│       ├── lib/
│       │   ├── firebase.ts           # Firebase config
│       │   └── moveEvaluator.ts     # Logic đánh giá nước đi
│       ├── page.tsx                  # Main game component
│       └── globals.css               # Global styles
├── public/
│   └── stockfish/                   # Stockfish.js files
├── vercel.json                       # Vercel config
└── package.json
```

## 🎯 Các chế độ chơi

1. **Local (2 người)** - Chơi trên cùng một máy
2. **Bot (AI)** - Chơi với Stockfish AI
3. **Online** - Chơi với người khác qua link phòng

## 📝 Lưu ý

- Stockfish.js cần được đặt trong `public/stockfish/`
- Firebase config cần được cấu hình trong `src/app/lib/firebase.ts`
- Vercel hỗ trợ Next.js out-of-the-box, không cần config đặc biệt

## 🌟 Tính năng nổi bật

### Phân tích nước đi real-time
- Tự động đánh giá sau mỗi nước đi
- Hiển thị popup animation với biểu tượng
- Lưu lịch sử với đánh giá

### Phân tích sau game
- Phân tích toàn bộ ván đấu
- Thống kê chi tiết từng loại nước đi
- Centipawn loss cho mỗi nước đi
- UI đẹp với progress bar

## 📄 License

MIT

## 🙏 Credits

- Stockfish - Chess engine
- React Chessboard - UI library
- Chess.js - Game logic

---

**Deploy ngay và có domain miễn phí vĩnh viễn trên Vercel!** 🚀
