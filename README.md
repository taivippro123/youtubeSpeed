# 🎵 YouTube Auto Speed

Extension Chrome tự động điều chỉnh tốc độ phát YouTube dựa trên loại video. Tự động phát video nhạc ở tốc độ 1x và video giải trí ở tốc độ 2x để tiết kiệm thời gian.

**English below ↓**

---

## 📥 Tải xuống

[![Download ZIP](https://img.shields.io/badge/Download-ZIP-blue?style=for-the-badge)](https://github.com/taivippro123/youtubeSpeed/archive/refs/heads/main.zip)

Hoặc click vào nút **Code** → **Download ZIP** ở góc trên bên phải của trang GitHub này.

---

## 🚀 Hướng dẫn cài đặt (Dành cho người không rành về kỹ thuật)

### Bước 1: Tải file ZIP

1. Click vào nút **Download ZIP** ở trên hoặc nút **Code** → **Download ZIP** trên GitHub
2. File sẽ được tải về thư mục Downloads của bạn

### Bước 2: Giải nén file ZIP

1. Mở thư mục **Downloads** trên máy tính
2. Tìm file `youtube-speed-extension.zip` (hoặc tên tương tự)
3. **Click chuột phải** vào file ZIP → Chọn **Extract All** (Giải nén tất cả) hoặc **Extract Here** (Giải nén tại đây)
4. Một thư mục mới sẽ xuất hiện tên là `youtube-speed-extension` (hoặc tương tự)

### Bước 3: Mở Chrome Extensions

1. Mở trình duyệt **Google Chrome**
2. Gõ vào thanh địa chỉ: `chrome://extensions/` và nhấn Enter
3. Hoặc vào menu **⋮** (3 chấm) ở góc trên bên phải → **Extensions** → **Manage extensions**

### Bước 4: Bật chế độ Developer (Nhà phát triển)

1. Ở góc trên bên phải của trang Extensions, bạn sẽ thấy công tắc **Developer mode**
2. **Bật công tắc** này (chuyển sang màu xanh)
3. Bạn sẽ thấy 3 nút mới xuất hiện: **Load unpacked**, **Pack extension**, **Update**

### Bước 5: Cài đặt Extension

1. Click vào nút **Load unpacked** (Tải tiện ích đã giải nén)
2. Một cửa sổ chọn thư mục sẽ hiện ra
3. **Điều hướng** đến thư mục `youtube-speed-extension` mà bạn đã giải nén ở Bước 2
4. **Chọn thư mục** `youtube-speed-extension` (không chọn file bên trong, chỉ chọn thư mục)
5. Click **Select Folder** (Chọn thư mục) hoặc **Select** (Chọn)

### Bước 6: Hoàn tất!

1. Extension **YouTube Auto Speed** sẽ xuất hiện trong danh sách extensions
2. Bạn sẽ thấy icon của extension ở thanh công cụ Chrome (có thể cần click vào icon puzzle để xem)
3. Mở YouTube và thử xem video - extension sẽ tự động hoạt động!

---

## ⚙️ Cách sử dụng

### Cấu hình cơ bản

1. Click vào **icon extension** trên thanh công cụ Chrome
2. Popup sẽ hiện ra với các tùy chọn:
   - **Từ khóa cho tốc độ chậm**: Nhập các từ khóa (mỗi từ khóa một dòng) như: `nhạc`, `music`, `MV`, `remix`
   - **Tốc độ cho video có từ khóa**: Mặc định là `1` (1x)
   - **Tốc độ cho video khác**: Mặc định là `2` (2x)
3. Click **Lưu cài đặt**

### Tùy chọn nâng cao

- **Tìm từ khóa trong**: Chọn nơi để tìm từ khóa (Tiêu đề, Tags, Category, Channel Type)
- **Sử dụng YouTube Data API**: Bật để phát hiện chính xác hơn (cần API key miễn phí từ Google Cloud)

### Lấy YouTube API Key (Tùy chọn)

1. Truy cập: https://console.cloud.google.com/apis/library/youtube.googleapis.com
2. Đăng nhập bằng tài khoản Google
3. Tạo project mới (nếu chưa có)
4. Bật **YouTube Data API v3**
5. Tạo **API Key**
6. Copy API key và dán vào extension

---

## 🎯 Tính năng

- ✅ Tự động phát hiện video nhạc và điều chỉnh tốc độ
- ✅ Tùy chỉnh từ khóa và tốc độ phát
- ✅ Hỗ trợ YouTube Data API để phát hiện chính xác
- ✅ Heuristics thông minh với scoring system
- ✅ Giao diện đơn giản, dễ sử dụng
- ✅ Không cần đăng nhập hay tài khoản

---

## 📝 Lưu ý

- Extension chỉ hoạt động trên trang YouTube
- Tốc độ phát có thể điều chỉnh từ 0.25x đến 4x
- YouTube Data API có giới hạn 10,000 requests/ngày (miễn phí)
- Extension hoạt động tốt nhất khi có YouTube API key

---

## 🐛 Báo lỗi

Nếu gặp vấn đề, vui lòng tạo [Issue](https://github.com/taivippro123/youtubeSpeed/issues) trên GitHub với:
- Mô tả vấn đề
- Video ID (nếu có)
- Screenshot (nếu có thể)

---

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

---

---

# 🎵 YouTube Auto Speed

Chrome extension that automatically adjusts YouTube playback speed based on video type. Automatically plays music videos at 1x speed and entertainment videos at 2x speed to save time.

---

## 📥 Download

[![Download ZIP](https://img.shields.io/badge/Download-ZIP-blue?style=for-the-badge)](https://github.com/taivippro123/youtubeSpeed/archive/refs/heads/main.zip)

Or click the **Code** → **Download ZIP** button in the top right corner of this GitHub page.

---

## 🚀 Installation Guide (For Non-Technical Users)

### Step 1: Download ZIP File

1. Click the **Download ZIP** button above or **Code** → **Download ZIP** on GitHub
2. The file will be downloaded to your Downloads folder

### Step 2: Extract ZIP File

1. Open your **Downloads** folder on your computer
2. Find the file `youtube-speed-extension.zip` (or similar name)
3. **Right-click** on the ZIP file → Select **Extract All** or **Extract Here**
4. A new folder will appear named `youtube-speed-extension` (or similar)

### Step 3: Open Chrome Extensions

1. Open **Google Chrome** browser
2. Type in the address bar: `chrome://extensions/` and press Enter
3. Or go to menu **⋮** (three dots) in the top right → **Extensions** → **Manage extensions**

### Step 4: Enable Developer Mode

1. In the top right corner of the Extensions page, you'll see a **Developer mode** toggle
2. **Turn on** this toggle (it will turn blue)
3. You'll see 3 new buttons appear: **Load unpacked**, **Pack extension**, **Update**

### Step 5: Install Extension

1. Click the **Load unpacked** button
2. A folder selection window will appear
3. **Navigate** to the `youtube-speed-extension` folder you extracted in Step 2
4. **Select** the `youtube-speed-extension` folder (not files inside, just the folder)
5. Click **Select Folder** or **Select**

### Step 6: Done!

1. The **YouTube Auto Speed** extension will appear in your extensions list
2. You'll see the extension icon in Chrome's toolbar (you may need to click the puzzle icon to see it)
3. Open YouTube and try watching a video - the extension will work automatically!

---

## ⚙️ How to Use

### Basic Configuration

1. Click the **extension icon** in Chrome's toolbar
2. A popup will appear with options:
   - **Keywords for slow speed**: Enter keywords (one per line) like: `music`, `nhạc`, `MV`, `remix`
   - **Speed for videos with keywords**: Default is `1` (1x)
   - **Speed for other videos**: Default is `2` (2x)
3. Click **Save Settings**

### Advanced Options

- **Search keywords in**: Choose where to search for keywords (Title, Tags, Category, Channel Type)
- **Use YouTube Data API**: Enable for more accurate detection (requires free API key from Google Cloud)

### Get YouTube API Key (Optional)

1. Visit: https://console.cloud.google.com/apis/library/youtube.googleapis.com
2. Sign in with your Google account
3. Create a new project (if you don't have one)
4. Enable **YouTube Data API v3**
5. Create an **API Key**
6. Copy the API key and paste it into the extension

---

## 🎯 Features

- ✅ Automatically detects music videos and adjusts speed
- ✅ Customizable keywords and playback speeds
- ✅ YouTube Data API support for accurate detection
- ✅ Smart heuristics with scoring system
- ✅ Simple, user-friendly interface
- ✅ No login or account required

---

## 📝 Notes

- Extension only works on YouTube pages
- Playback speed can be adjusted from 0.25x to 4x
- YouTube Data API has a limit of 10,000 requests/day (free)
- Extension works best with YouTube API key

---

## 🐛 Report Issues

If you encounter any problems, please create an [Issue](https://github.com/taivippro123/youtubeSpeed/issues) on GitHub with:
- Problem description
- Video ID (if applicable)
- Screenshot (if possible)

---

## 📄 License

MIT License - Free to use and modify

---

## 🙏 Credits

Made with ❤️ for YouTube users who want to save time while enjoying content

