# 🚀 Hướng Dẫn Deploy Lên Vercel (Chi Tiết Từng Bước)

## Bước 1: Tạo Repository trên GitHub

1. Vào https://github.com và đăng nhập
2. Click nút **"+"** ở góc trên phải → **"New repository"**
3. Đặt tên: `pro-chess` (hoặc tên bạn muốn)
4. Chọn **Public** hoặc **Private**
5. **KHÔNG** tích "Initialize with README" (vì đã có code)
6. Click **"Create repository"**

## Bước 2: Push Code Lên GitHub

Sau khi tạo repo, GitHub sẽ hiển thị các lệnh. Chạy trong terminal:

```bash
# Thay <your-username> và <repo-name> bằng thông tin của bạn
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

**Ví dụ:**
```bash
git remote add origin https://github.com/yourname/pro-chess.git
git branch -M main
git push -u origin main
```

## Bước 3: Deploy Lên Vercel

### Cách 1: Qua Website (Dễ nhất) ⭐

1. Vào https://vercel.com
2. Click **"Sign Up"** (hoặc "Log In" nếu đã có tài khoản)
3. Chọn **"Continue with GitHub"** → Authorize Vercel
4. Sau khi đăng nhập, click **"Add New..."** → **"Project"**
5. Tìm repository `pro-chess` của bạn → Click **"Import"**
6. Vercel sẽ tự động detect Next.js:
   - **Framework Preset:** Next.js (tự động)
   - **Root Directory:** `./` (để mặc định)
   - **Build Command:** `npm run build` (tự động)
   - **Output Directory:** `.next` (tự động)
7. Click **"Deploy"**
8. Đợi 2-3 phút để build
9. ✅ Xong! Bạn sẽ có link: `https://pro-chess-xxx.vercel.app`

### Cách 2: Qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (lần đầu sẽ hỏi một số câu hỏi)
vercel

# Deploy production
vercel --prod
```

## Bước 4: Kiểm Tra

1. Vào link Vercel đã cung cấp
2. Test các tính năng:
   - ✅ Chơi local
   - ✅ Chơi với bot
   - ✅ Chơi online
   - ✅ Phân tích nước đi

## ⚠️ Lưu Ý Quan Trọng

### 1. File Stockfish.js
Đảm bảo bạn có file Stockfish.js trong `public/stockfish/`:
- Nếu chưa có, tải từ: https://github.com/niklasf/stockfish.js
- Hoặc tạo thư mục và copy file vào

### 2. Firebase Config
File `src/app/lib/firebase.ts` đã có config sẵn, nhưng bạn có thể thay bằng config của mình nếu muốn.

### 3. Environment Variables (Nếu cần)
Nếu bạn muốn dùng Firebase riêng:
- Vào Vercel Dashboard → Project → Settings → Environment Variables
- Thêm các biến cần thiết

## 🎉 Xong!

Sau khi deploy, bạn sẽ có:
- ✅ Domain miễn phí vĩnh viễn: `your-project.vercel.app`
- ✅ SSL tự động (HTTPS)
- ✅ Auto-deploy khi push code lên GitHub
- ✅ CDN toàn cầu (nhanh)

## 🔄 Update Code Sau Này

Mỗi khi bạn push code mới lên GitHub:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel sẽ **tự động deploy** bản mới! 🚀

