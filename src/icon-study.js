// Original RAUT concepts. Coordinates are drawn directly on the 24 × 24 grid.
export const studies = [
  { slug: 'home', label: 'Rumah', path: 'M3 10.5 12 3l9 7.5v8L18.5 21H5a2 2 0 0 1-2-2z M9 21v-7h6v3.5' },
  { slug: 'folder', label: 'Folder', path: 'M3 7V6a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v8.5L18.5 20H5a2 2 0 0 1-2-2v-7h11' },
  { slug: 'camera', label: 'Kamera', path: 'M3 9a2 2 0 0 1 2-2h2.5L10 4.5h4L16.5 7H19a2 2 0 0 1 2 2v8.5L18.5 20H5a2 2 0 0 1-2-2z M15 12a3.5 3.5 0 1 1-3-1.7 M18 10h.1' },
  { slug: 'mail', label: 'Surat', path: 'M5 5h14a2 2 0 0 1 2 2v9.5L18.5 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M3.5 7l7 5.5a2.4 2.4 0 0 0 3 0L18 9' },
  { slug: 'bookmark', label: 'Penanda', path: 'M8 3h8a2 2 0 0 1 2 2v12l-2.5 2.5-3.5-2.3-6 4V5a2 2 0 0 1 2-2z M9.5 7h5' },
  { slug: 'download', label: 'Unduh', path: 'M12 3v11m-4-4 4 4 4-4 M4 15v4a2 2 0 0 0 2 2h11.5l2.5-2.5V15' },
  { slug: 'search', label: 'Cari', path: 'M15.6 15.6 21 21 M17.5 10.5v2.5L13 17.5h-2.5a7 7 0 1 1 7-7z' },
  { slug: 'lock', label: 'Kunci', path: 'M7.5 10V7a4.5 4.5 0 0 1 9 0v.5 M6 10h12a2 2 0 0 1 2 2v6.5L17.5 21H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M12 14.5v2' },
].map((icon) => ({ ...icon, x: 0, y: 0 }))
