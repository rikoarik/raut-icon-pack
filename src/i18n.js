const requested = new URLSearchParams(window.location.search).get('lang')
let saved
try { saved = window.localStorage.getItem('raut-language') } catch { /* Storage may be unavailable. */ }
export const language = ['id', 'en'].includes(requested) ? requested : saved === 'en' ? 'en' : 'id'
try { window.localStorage.setItem('raut-language', language) } catch { /* URL still carries the preference. */ }
document.documentElement.lang = language

export const t = (id, en) => language === 'en' ? en : id
export function languageUrl(next, destination = window.location.href) {
  const url = new URL(destination, window.location.origin)
  url.searchParams.set('lang', next)
  return url.pathname + url.search + url.hash
}
export const pageUrl = (destination) => language === 'en' ? languageUrl(language, destination) : destination

const categoriesEn = {
  'Ikon inti': 'Core icons', Antarmuka: 'Interface', 'Bisnis & transaksi': 'Business & transactions', 'Data & teknologi': 'Data & technology', 'Perjalanan & lingkungan': 'Travel & environment', 'Kehidupan sehari-hari': 'Everyday life', 'Status & alur kerja': 'Status & workflow', 'Komunikasi & media': 'Communication & media', 'Desain & dokumen': 'Design & documents', 'Pembayaran & rumah': 'Payments & home', 'Rekreasi & layanan': 'Recreation & services', 'Sistem & sinkronisasi': 'System & sync', 'Akun, tim & izin': 'Accounts, teams & permissions', 'Makanan & restoran': 'Food & restaurants', 'Kesehatan & perawatan': 'Health & care', 'Properti & pemeliharaan': 'Property & maintenance', 'Pendidikan & kelas': 'Education & classrooms', 'Pengiriman & pelacakan': 'Delivery & tracking', 'Acara & tiket': 'Events & tickets',
  Navigasi: 'Navigation', Aksi: 'Actions', Komunikasi: 'Communication', Orang: 'People', Media: 'Media', File: 'Files', Edit: 'Editing', Keamanan: 'Security', 'Waktu & lokasi': 'Time & location', Perangkat: 'Devices', 'Kontrol & navigasi': 'Controls & navigation', 'Status & aksesibilitas': 'Status & accessibility', 'Tipografi & layout': 'Typography & layout', 'Pembayaran & keuangan': 'Payments & finance', 'Toko & katalog': 'Store & catalog', 'Operasional & logistik': 'Operations & logistics', 'Data & analitik': 'Data & analytics', 'Pengembang & otomasi': 'Developer & automation', 'Konektivitas & perangkat': 'Connectivity & devices', Transportasi: 'Transportation', 'Tempat & fasilitas': 'Places & facilities', 'Cuaca & alam': 'Weather & nature', 'Kesehatan & kebugaran': 'Health & fitness', 'Belajar & produktivitas': 'Learning & productivity', 'Sosial & sehari-hari': 'Social & everyday', 'Formulir & autentikasi': 'Forms & authentication', 'Jadwal & tugas': 'Schedules & tasks', 'Pesan & panggilan': 'Messages & calls', 'Pemutaran & rekaman': 'Playback & recording', 'Alat kreatif': 'Creative tools', 'Dokumen & arsip': 'Documents & archives', 'Pembayaran lokal & pesanan': 'Local payments & orders', 'Smart home & utilitas': 'Smart home & utilities', 'Olahraga & hiburan': 'Sports & entertainment', 'Fasilitas & layanan publik': 'Facilities & public services', 'Sinkronisasi & versi': 'Sync & versioning', 'Penyimpanan & operasi sistem': 'Storage & system operations', 'Akun, anggota & undangan': 'Accounts, members & invites', 'Peran, izin & sesi': 'Roles, permissions & sessions', 'Layanan restoran': 'Restaurant services', 'Makanan, minuman & diet': 'Food, drinks & diet', 'Pasien, jadwal & rekam medis': 'Patients, schedules & medical records', 'Pemeriksaan & alat perawatan': 'Exams & care tools', 'Hunian, ruang & sewa': 'Housing, spaces & rentals', 'Inspeksi, perbaikan & utilitas': 'Inspection, repairs & utilities', 'Tugas, ujian & penilaian': 'Assignments, exams & grading', 'Kelas & materi belajar': 'Classes & learning materials', 'Persiapan & perjalanan paket': 'Package preparation & transit', 'Penerimaan & kendala antar': 'Receiving & delivery issues', 'Pendaftaran, tiket & akses': 'Registration, tickets & access', 'Tempat, jadwal & kursi': 'Venues, schedules & seating',
}
export const categoryLabel = (name) => t(name, categoriesEn[name] ?? name)
const englishStyles = { 'potong-serong': 'Beveled', tipis: 'Thin', bayang: 'Shadow', piksel: 'Pixel' }
export const styleLabel = ({ id, label }) => t(label, englishStyles[id] ?? label)

export function localizePageMetadata(page) {
  if (language !== 'en') return
  const [title, description] = ({
    catalog: ['RAUT — Icons for interfaces', 'Find original RAUT vector icons, compare sizes, download SVG or copy React code.'],
    guide: ['Usage guide — RAUT', 'Learn how to preview and export RAUT icons.'],
    install: ['Installation — RAUT', 'Install RAUT for web, mobile and desktop, or fetch SVGs with the CLI.'],
    missing: ['Page not found — RAUT', 'This page is missing. Find your way back to the icon catalog.'],
  })[page]
  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}
