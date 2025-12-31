# 🚀 Hướng Dẫn Nhanh - 3 Bước Deploy

## ⚡ Bước 1: Tạo Repository trên GitHub (Bạn đang ở đây)

1. **Click nút "New"** (màu xanh) ở góc trên phải GitHub
2. **Repository name:** `pro-chess`
3. **Chọn Public** hoặc Private
4. **⚠️ QUAN TRỌNG:** KHÔNG tích bất kỳ checkbox nào:
   - ❌ Add a README file
   - ❌ Add .gitignore  
   - ❌ Choose a license
5. **Click "Create repository"**

✅ Sau khi tạo xong, GitHub sẽ hiển thị trang với URL như: `https://github.com/Phuc0705/pro-chess`

---

## ⚡ Bước 2: Push Code Lên GitHub

### Cách 1: Dùng Script Tự Động (Dễ nhất) ⭐

1. Chạy file `push-to-github.bat` (double-click)
2. Nhập tên repository: `pro-chess`
3. Nhập username: `Phuc0705` (hoặc username của bạn)
4. Đợi xong!

### Cách 2: Chạy Lệnh Thủ Công

Mở terminal/PowerShell trong thư mục project và chạy:

```bash
git remote add origin https://github.com/Phuc0705/pro-chess.git
git branch -M main
git push -u origin main
```

**Lưu ý:** Thay `Phuc0705` và `pro-chess` bằng thông tin của bạn!

---

## ⚡ Bước 3: Deploy Lên Vercel

1. Vào **https://vercel.com**
2. Click **"Sign Up"** → Chọn **"Continue with GitHub"**
3. Click **"Add New..."** → **"Project"**
4. Tìm repository `pro-chess` → Click **"Import"**
5. Click **"Deploy"** (giữ nguyên tất cả settings mặc định)
6. Đợi 2-3 phút
7. ✅ **XONG!** Bạn sẽ có link: `https://pro-chess-xxx.vercel.app`

---

## ⚠️ Lưu Ý Trước Khi Deploy

### File Stockfish.js (Quan trọng!)

Bot AI cần file này. Nếu chưa có:

1. Tạo thư mục: `public\stockfish`
2. Tải file từ: https://raw.githubusercontent.com/niklasf/stockfish.js/master/stockfish.js
3. Lưu vào: `public\stockfish\stockfish.js`

Hoặc chạy lệnh này trong PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "public\stockfish"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/niklasf/stockfish.js/master/stockfish.js" -OutFile "public\stockfish\stockfish.js"
```

---

## ✅ Checklist

- [ ] Đã tạo repository trên GitHub
- [ ] Đã push code lên GitHub
- [ ] Đã tải file Stockfish.js
- [ ] Đã deploy lên Vercel
- [ ] Đã test game trên Vercel

---

## 🎉 Xong!

Sau khi hoàn thành, bạn sẽ có:
- ✅ Domain miễn phí: `your-project.vercel.app`
- ✅ HTTPS tự động
- ✅ Auto-deploy khi push code mới
- ✅ CDN toàn cầu

**Chúc bạn thành công!** 🚀

