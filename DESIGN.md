# RAUT / Lembar spesimen

RAUT adalah pustaka ikon vektor berbahasa Indonesia. Katalog memakai 612 gambar master dari Rounded Icons, dalam tujuh gaya: Outline, Bold, Broken, Potong Serong, Tipis, Bayang, dan Piksel. Grid, spesimen, inspektor, dan ekspor memakai sumber geometri yang sama. Tidak ada backend atau layanan publik yang diasumsikan.

## Arah visual

Lembar registrasi cetak sebagai acuan: kertas hangat `#F7F6EF`, tinta `#171B22`, dan satu ultramarin `#2446CB`. Garis tipis membentuk indeks datar tanpa kartu terpisah. Space Grotesk untuk judul, Source Sans 3 untuk teks UI, dan IBM Plex Mono untuk nama ikon, hitungan, dan kode. Font dilayani lokal.

Spesimen `arrow-up-right` menampilkan gaya aktif pada kisi 24 × 24 dan pada ukuran pakai 16, 24, dan 32 px. Inspektor memperluas perbandingan itu dengan ukuran dan warna yang dapat diatur. Pada layar kecil, spesimen dan navigasi gaya dipadatkan; semua gaya dan kategori tetap dapat dijangkau dari katalog.

## Tata letak dan gerak

- Desktop: masthead lengket → judul dan panel spesimen → pencarian dan tujuh tombol gaya → kategori dan grid enam kolom → paginasi.
- Mobile: masthead lengket → judul dan spesimen ringkas → pencarian dan dialog gaya → pintasan kategori → grid tiga kolom → paginasi. Dialog memakai lembar bawah.
- Target satu layar pada 320 × 690, 375 × 812, 768 × 900, 1366 × 768, dan 1440 × 900. Layar pendek tetap dapat digulir.
- Satu `GlareHover` dari registry React Bits hanya menyapu panel spesimen saat hover atau fokus keyboard di perangkat dengan pointer presisi. Tidak ada animasi masuk, loop, atau animasi grid. Preferensi reduced motion dan perangkat touch menonaktifkan efek tanpa mengubah fungsi tombol.

Tautan gaya dan ikon, ukuran ekspor, serta paket lokal tidak bergantung pada React Bits.
