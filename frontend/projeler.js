/* ═══════════════════════════════════════════════
   Oskar Duş — Tüm Projeler Sayfası
   projeler.js — Galeri & Lightbox
   ═══════════════════════════════════════════════ */

let allProjects = [];
let currentProject = 0;
let currentImage = 0;


// ═══════════════════════════════════════════════
// YARDIMCI: Projenin fotoğraflarını al
// ═══════════════════════════════════════════════
function getImages(index) {
  const p = allProjects[index];
  if (!p) return [];
  // Yeni format (images dizisi) veya eski format (tek image)
  return p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
}


// ═══════════════════════════════════════════════
// PROJELERİ YÜKLE & RENDER
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  allProjects = JSON.parse(localStorage.getItem('cc_projects') || '[]');
  const grid = document.getElementById('allProjectsGrid');
  const countEl = document.getElementById('projectsCount');

  // Boş durum
  if (allProjects.length === 0) {
    grid.innerHTML = `
      <div class="projects-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
        <p>Henüz proje eklenmemiş.</p>
      </div>`;
    return;
  }

  countEl.textContent = `Toplam ${allProjects.length} proje`;

  // Proje kartlarını oluştur
  allProjects.forEach((project, pIndex) => {
    const images = getImages(pIndex);

    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.style.cursor = images.length > 0 ? 'pointer' : 'default';

    // Tıklama → lightbox aç
    if (images.length > 0) {
      card.addEventListener('click', () => openLightbox(pIndex));
    }

    // Kapak fotoğrafı
    const imgDiv = document.createElement('div');
    imgDiv.className = 'gallery-item-img';

    if (images.length > 0) {
      imgDiv.style.backgroundImage = `url('${images[0]}')`;
      imgDiv.style.backgroundSize = 'cover';
      imgDiv.style.backgroundPosition = 'center';
    } else {
      imgDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>`;
    }

    // Fotoğraf sayısı rozeti (2+ fotoğraf varsa)
    if (images.length > 1) {
      const badge = document.createElement('span');
      badge.className = 'photo-count';
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        ${images.length}`;
      card.appendChild(badge);
    }

    // Overlay (başlık, açıklama, etiketler)
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <h4>${project.title || ''}</h4>
      <p>${project.description || ''}</p>
      ${project.tag ? `<span class="gallery-tag">${project.tag}</span>` : ''}
      ${project.details ? `<span class="gallery-tag">${project.details}</span>` : ''}
    `;

    card.appendChild(imgDiv);
    card.appendChild(overlay);
    grid.appendChild(card);
  });


  // ─── MOBİL MENÜ ───
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  document.getElementById('mobileCloseBtn').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('active');
    document.body.style.overflow = '';
  });
});


// ═══════════════════════════════════════════════
// LIGHTBOX — Aç / Kapat / Gezin
// ═══════════════════════════════════════════════
function openLightbox(projectIndex) {
  currentProject = projectIndex;
  currentImage = 0;
  const images = getImages(projectIndex);
  if (images.length === 0) return;

  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Tek fotoğrafsa okları ve thumbnail'leri gizle
  document.getElementById('lbPrev').classList.toggle('hidden', images.length <= 1);
  document.getElementById('lbNext').classList.toggle('hidden', images.length <= 1);
  document.getElementById('lbThumbs').classList.toggle('hidden', images.length <= 1);

  updateLightbox();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const images = getImages(currentProject);
  const project = allProjects[currentProject];

  // Ana fotoğraf
  document.getElementById('lbImg').src = images[currentImage];

  // Başlık + Açıklama
  document.getElementById('lbTitle').innerHTML = `
    ${project.title || ''}
    ${project.description ? `<span style="display:block;font-family:var(--font-body);font-size:0.95rem;font-weight:300;color:var(--text-secondary);margin-top:0.4rem;max-width:500px;line-height:1.6">${project.description}</span>` : ''}
  `;

  // Sayaç (2+ fotoğrafta göster)
  document.getElementById('lbCounter').textContent =
    images.length > 1 ? `${currentImage + 1} / ${images.length}` : '';

  // Thumbnail'ler
  if (images.length > 1) {
    document.getElementById('lbThumbs').innerHTML = images.map((img, i) => `
      <img
        src="${img}"
        class="lightbox-thumb ${i === currentImage ? 'active' : ''}"
        onclick="goToImage(${i})"
        alt="Fotoğraf ${i + 1}"
      >
    `).join('');
  }
}

function goToImage(index) {
  currentImage = index;
  updateLightbox();
}

function nextImage() {
  const images = getImages(currentProject);
  currentImage = (currentImage + 1) % images.length;
  updateLightbox();
}

function prevImage() {
  const images = getImages(currentProject);
  currentImage = (currentImage - 1 + images.length) % images.length;
  updateLightbox();
}


// ═══════════════════════════════════════════════
// LIGHTBOX EVENT LISTENER'LAR
// ═══════════════════════════════════════════════

// Kapat butonu
document.getElementById('lbClose').addEventListener('click', closeLightbox);

// Ok butonları
document.getElementById('lbPrev').addEventListener('click', prevImage);
document.getElementById('lbNext').addEventListener('click', nextImage);

// Boş alana tıklayınca kapat
document.getElementById('lbMain').addEventListener('click', (e) => {
  if (e.target.id === 'lbMain') closeLightbox();
});

// Klavye kontrolü
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('active')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});

// ═══════════════════════════════════════════════
// MOBİL SWIPE DESTEĞİ
// ═══════════════════════════════════════════════
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('lbMain').addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('lbMain').addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Yatay hareket dikey hareketten büyükse swipe say
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextImage();
    else prevImage();
  }
}, { passive: true });