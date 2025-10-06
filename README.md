<div align="center">

![Banner](public/img/banner.png)

# 🎌 Web Info Anime - API & Portal Informasi Anime 🎌

### *Platform Lengkap untuk Pecinta Anime Indonesia*

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/hitlabmodv2/WEB_INFO_ANIME)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.javascript.com/)

[🚀 Demo Langsung](#) • [📖 Dokumentasi](#dokumentasi-api) • [💬 Komunitas](#) • [🐛 Laporkan Bug](#)

---

</div>

## ✨ Tentang Proyek

**Web Info Anime** adalah platform REST API dan web portal yang menyediakan informasi lengkap tentang anime dengan subtitle Indonesia. Terintegrasi dengan **Jikan API (MyAnimeList)** dan scraping data dari situs anime terpercaya, proyek ini memberikan pengalaman terbaik untuk para penggemar anime Indonesia!

### 🎯 Kenapa Memilih Web Info Anime?

- ✅ **Data Real-time** - Update otomatis setiap 5 menit
- ✅ **UI Modern** - Tampilan responsif dengan dark mode
- ✅ **Informasi Lengkap** - Detail anime, karakter, episode, review, dan rekomendasi
- ✅ **Cepat & Ringan** - Performa optimal dengan caching
- ✅ **API Gratis** - Akses unlimited tanpa biaya
- ✅ **Bahasa Indonesia** - Subtitle dan informasi dalam bahasa Indonesia

---

## 🎨 Fitur Unggulan

<table>
<tr>
<td width="50%">

### 🎬 Konten Anime
- 🆕 Anime Terbaru (New Release)
- 📺 Daftar Lengkap Anime
- 🎥 Film Anime (Movie)
- 🔥 Anime Populer
- 📅 Jadwal Tayang Real-time
- 🔤 A-Z List Anime

</td>
<td width="50%">

### 🛠️ Fitur Canggih
- 🎭 Browser Genre dengan Fuzzy Search
- 🔍 Pencarian Anime Cepat
- 📊 Detail Statistik Anime
- 👥 Informasi Karakter
- ⭐ Review & Rating
- 💡 Rekomendasi Personal

</td>
</tr>
</table>

---

## 🚀 Teknologi yang Digunakan

<div align="center">

| Frontend | Backend | Tools & Services |
|:--------:|:-------:|:----------------:|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | ![Express.js](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white) | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) |
| - | ![Cheerio](https://img.shields.io/badge/Cheerio-E88C00?style=flat&logoColor=white) | - |

</div>

### 📦 Dependencies Utama
- **Express.js** - Framework backend yang cepat dan minimalis
- **Axios** - HTTP client untuk request API
- **Cheerio** - Web scraping untuk parsing HTML
- **Jikan API** - Integrasi data MyAnimeList
- **CORS** - Cross-Origin Resource Sharing support

---

## 💻 Instalasi & Penggunaan

### 📋 Prasyarat
- Node.js versi 14 atau lebih baru
- NPM atau Yarn
- Git

### 🔧 Langkah Instalasi

```bash
# 1️⃣ Clone repository ini
git clone https://github.com/hitlabmodv2/WEB_INFO_ANIME.git

# 2️⃣ Masuk ke folder proyek
cd WEB_INFO_ANIME

# 3️⃣ Install semua dependencies
npm install

# 4️⃣ Jalankan server development
npm start
```

### ✅ Server Berhasil Berjalan!
Buka browser dan akses: **http://localhost:5000**

---

## 📖 Dokumentasi API

### 🌐 Base URL
```
https://your-domain.vercel.app/api
```

### 📋 Daftar Endpoint Lengkap

<details>
<summary><b>🆕 1. Anime Terbaru</b> (Klik untuk expand)</summary>

**Endpoint:** `GET /new/page/:pageNumber`

**Deskripsi:** Mendapatkan daftar anime terbaru yang baru rilis

**Contoh Request:**
```bash
curl https://your-domain.vercel.app/api/new/page/1
```

**Contoh Response:**
```json
{
  "status": "success",
  "data": [
    {
      "title": "Attack on Titan Final Season",
      "link": "https://...",
      "imageSrc": "https://...",
      "type": "TV Series",
      "score": "9.5"
    }
  ]
}
```
</details>

<details>
<summary><b>📺 2. Daftar Semua Anime</b></summary>

**Endpoint:** `GET /anime/page/:pageNumber`

**Deskripsi:** Mendapatkan daftar lengkap semua anime

**Parameter:**
- `pageNumber` - Nomor halaman (integer)

**Contoh:**
```
/api/anime/page/2
```
</details>

<details>
<summary><b>🎥 3. Film Anime (Movie)</b></summary>

**Endpoint:** `GET /movie/page/:pageNumber`

**Deskripsi:** Mendapatkan daftar film anime

**Contoh:**
```
/api/movie/page/1
```
</details>

<details>
<summary><b>🔥 4. Anime Populer</b></summary>

**Endpoint:** `GET /popular/page/:pageNumber`

**Deskripsi:** Mendapatkan daftar anime paling populer

**Contoh:**
```
/api/popular/page/1
```
</details>

<details>
<summary><b>📅 5. Jadwal Tayang Anime</b></summary>

**Endpoint:** `GET /schedule`

**Deskripsi:** Mendapatkan jadwal tayang anime real-time

**Contoh:**
```
/api/schedule
```
</details>

<details>
<summary><b>🔤 6. A-Z List Anime</b></summary>

**Endpoint:** `GET /azlist`

**Deskripsi:** Mendapatkan daftar anime berurutan A-Z

**Contoh:**
```
/api/azlist
```
</details>

<details>
<summary><b>🎭 7. Daftar Genre</b></summary>

**Endpoint:** `GET /genres`

**Deskripsi:** Mendapatkan semua genre anime yang tersedia

**Contoh:**
```
/api/genres
```
</details>

<details>
<summary><b>🎯 8. Anime Berdasarkan Genre</b></summary>

**Endpoint:** `GET /genre/:genreId/page/:pageNumber`

**Deskripsi:** Mendapatkan anime berdasarkan genre tertentu

**Parameter:**
- `genreId` - ID atau nama genre (string)
- `pageNumber` - Nomor halaman (integer)

**Contoh:**
```
/api/genre/action/page/1
```
</details>

<details>
<summary><b>🔍 9. Pencarian Anime</b></summary>

**Endpoint:** `GET /search/:keyword/page/:pageNumber`

**Deskripsi:** Mencari anime berdasarkan kata kunci

**Parameter:**
- `keyword` - Kata kunci pencarian (URL encoded)
- `pageNumber` - Nomor halaman (integer)

**Contoh:**
```
/api/search/attack%20on%20titan/page/1
```
</details>

<details>
<summary><b>📊 10. Detail Anime</b></summary>

**Endpoint:** `GET /detail/:animeId`

**Deskripsi:** Mendapatkan informasi detail lengkap anime

**Parameter:**
- `animeId` - ID atau slug anime (string)

**Contoh:**
```
/api/detail/attack-on-titan
```

**Response meliputi:**
- Informasi dasar anime
- Karakter & voice actors
- Episode list
- Review & rating
- Rekomendasi anime serupa
- Gambar & screenshot
</details>

<details>
<summary><b>🎬 11. Detail Episode</b></summary>

**Endpoint:** `GET /watch/:episodeId`

**Deskripsi:** Mendapatkan detail episode dan link streaming

**Contoh:**
```
/api/watch/attack-on-titan-episode-1
```
</details>

<details>
<summary><b>🎞️ 12. Link Streaming</b></summary>

**Endpoint:** `GET /stream/:streamId`

**Deskripsi:** Mendapatkan link streaming video episode

**Contoh:**
```
/api/stream/attack-on-titan-episode-1
```
</details>

---

## 🎨 Fitur Web Portal

### 🌙 Dark Mode
Toggle dark mode untuk kenyamanan mata saat menonton malam hari

### 🖼️ Dynamic Background
Latar belakang berubah otomatis sesuai waktu (pagi/siang/sore/malam) dengan 40 scene dari anime **Kimi no Nawa**

### 📱 Responsive Design
Tampilan optimal di semua perangkat: Desktop, Tablet, dan Mobile

### 🎬 Integrated Video Player
Nonton trailer dan preview anime langsung di dalam aplikasi

### ⚡ Real-time Updates
Data anime update otomatis setiap 5 menit tanpa refresh manual

---

## 📊 Contoh Response JSON

```json
{
  "title": "Boku no Hero Academia the Movie 4",
  "link": "https://samehadaku.mba/anime/boku-no-hero-academia-the-movie-4/",
  "imageSrc": "https://samehadaku.mba/wp-content/uploads/2025/02/143549.jpg",
  "type": "Movie",
  "score": "7.5",
  "status": "Completed",
  "views": "1304 Views",
  "description": "Movie ke 4 dari Boku no Hero Academia",
  "genres": [
    "Action",
    "School",
    "Super Power"
  ]
}
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. 🍴 Fork repository ini
2. 🌿 Buat branch fitur baru (`git checkout -b fitur-keren`)
3. ✍️ Commit perubahan (`git commit -m 'Tambah fitur keren'`)
4. 📤 Push ke branch (`git push origin fitur-keren`)
5. 🔃 Buat Pull Request

---

## 📝 Lisensi

Proyek ini menggunakan lisensi **ISC License**.

---

## 🙏 Acknowledgments

- **MyAnimeList** - Sumber data anime utama
- **Jikan API** - REST API untuk MyAnimeList
- **Samehadaku** - Sumber subtitle Indonesia
- **Kimi no Nawa** - Background images
- **Komunitas Anime Indonesia** - Support & feedback

---

## 📞 Kontak & Support

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-hitlabmodv2-181717?style=for-the-badge&logo=github)](https://github.com/hitlabmodv2)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your-email@example.com)

### ⭐ Jika proyek ini membantu, berikan bintang ya! ⭐

**Dibuat dengan ❤️ oleh Tim Hitlab Mod**

</div>

---

<div align="center">
  
### 📱 Screenshot Aplikasi

*Coming Soon...*

---

**© 2025 Web Info Anime. All Rights Reserved.**

</div>
