# 📥 Hướng Dẫn Tải Stockfish.js

Stockfish.js là file cần thiết để bot AI hoạt động. Có 2 cách:

## Cách 1: Tải Từ CDN (Khuyến nghị - Dễ nhất)

1. Tạo thư mục:
```bash
mkdir public\stockfish
```

2. Tải file Stockfish.js:
- Vào: https://cdn.jsdelivr.net/npm/stockfish.js@10/stockfish.js
- Hoặc dùng link: https://raw.githubusercontent.com/niklasf/stockfish.js/master/stockfish.js
- Save as: `public/stockfish/stockfish.js`

## Cách 2: Dùng npm/yarn

```bash
npm install stockfish.js
```

Sau đó copy file từ `node_modules/stockfish.js/stockfish.js` vào `public/stockfish/stockfish.js`

## Cách 3: Tải Trực Tiếp

1. Vào: https://github.com/niklasf/stockfish.js
2. Download file `stockfish.js`
3. Đặt vào: `public/stockfish/stockfish.js`

## Kiểm Tra

Sau khi tải, cấu trúc thư mục phải như này:
```
public/
  └── stockfish/
      └── stockfish.js
```

## ⚠️ Lưu Ý

- File Stockfish.js thường khá lớn (~2-3MB)
- Không commit file này vào git nếu quá lớn (có thể dùng CDN thay thế)
- Nếu dùng CDN, có thể sửa code để load từ CDN thay vì local file

