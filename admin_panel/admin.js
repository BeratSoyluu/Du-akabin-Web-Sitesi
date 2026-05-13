/* ═══════════════════════════════════════════════
   Oskar Duş — Admin Paneli JS
   admin.js — CRUD, EmailJS, Bildirimler
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// ŞİFRE KORUMASI — DOMContentLoaded'dan çağrılır
// ═══════════════════════════════════════════════
function initAuth() {
  const DEFAULT_PASSWORD = 'oskar2024';
  const SESSION_KEY = 'cc_admin_auth';

  if (sessionStorage.getItem(SESSION_KEY) === 'true') return;

  // body.style.display = 'none' yerine içerikleri gizle
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const mobileHeader = document.querySelector('.mobile-header');
  if (sidebar) sidebar.style.display = 'none';
  if (mainContent) mainContent.style.display = 'none';
  if (mobileHeader) mobileHeader.style.display = 'none';

  const overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:#0a0a0a;z-index:99999;
    display:flex;align-items:center;justify-content:center;
  `;
  overlay.innerHTML = `
    <div style="text-align:center;max-width:340px;width:90%;padding:2.5rem;border:1px solid #2a2a2a;background:#111">
      <h2 style="font-family:'Outfit',sans-serif;font-weight:300;color:#fff;font-size:1.4rem;margin-bottom:0.3rem">
        Oskar <span style="color:#c9a96e">Duş</span>
      </h2>
      <p style="color:#666;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:2rem">Admin Paneli</p>
      <input type="password" id="authInput" placeholder="Şifre"
        style="width:100%;padding:0.8rem 1rem;background:#1a1a1a;border:1px solid #2a2a2a;color:#fff;font-family:'Outfit',sans-serif;font-size:0.9rem;margin-bottom:0.8rem;box-sizing:border-box;outline:none">
      <p id="authError" style="color:#e74c3c;font-size:0.78rem;margin-bottom:0.8rem;min-height:1rem"></p>
      <button id="authBtn"
        style="width:100%;padding:0.8rem;background:#c9a96e;border:none;color:#0a0a0a;font-family:'Outfit',sans-serif;font-size:0.85rem;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">
        Giriş Yap
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  function tryLogin() {
    const storedPw = localStorage.getItem('cc_admin_password') || DEFAULT_PASSWORD;
    if (document.getElementById('authInput').value === storedPw) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      overlay.remove();
      const sb = document.querySelector('.sidebar');
      const mc = document.querySelector('.main-content');
      const mh = document.querySelector('.mobile-header');
      if (sb) sb.style.display = '';
      if (mc) mc.style.display = '';
      if (mh) mh.style.display = '';
    } else {
      document.getElementById('authError').textContent = 'Şifre hatalı, tekrar deneyin.';
      document.getElementById('authInput').value = '';
      document.getElementById('authInput').focus();
    }
  }

  document.getElementById('authBtn').addEventListener('click', tryLogin);
  document.getElementById('authInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') tryLogin();
  });

  setTimeout(() => document.getElementById('authInput')?.focus(), 50);
}


// ─── VERI YÖNETİMİ ───
const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem(`cc_${key}`) || '[]');
  },
  set(key, data) {
    localStorage.setItem(`cc_${key}`, JSON.stringify(data));
  },
  getObj(key) {
    return JSON.parse(localStorage.getItem(`cc_${key}`) || '{}');
  },
  setObj(key, data) {
    localStorage.setItem(`cc_${key}`, JSON.stringify(data));
  }
};

// ─── SAYFA NAVİGASYONU ───
const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
const pages = document.querySelectorAll('.page');

sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobil menü
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});


// ═══════════════════════════════════════════════
// [YENİ] FOTOĞRAF BOYUT KÜÇÜLTME (Canvas API)
// 2MB'ı aşan fotoğrafları otomatik küçültür
// ═══════════════════════════════════════════════
function resizeImageIfNeeded(file, maxSizeMB = 2, maxDim = 1600) {
  return new Promise((resolve) => {
    const limitBytes = maxSizeMB * 1024 * 1024;

    // Boyut sınır altındaysa direkt oku
    if (file.size <= limitBytes) {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }

    // Büyük dosyayı canvas ile küçült
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      // Kaliteyi düşürerek hedef boyuta getir
      let quality = 0.85;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length * 0.75 > limitBytes && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}


// ═══════════════════════════════════════════════
// PROJELER CRUD — ÇOKLU FOTOĞRAF DESTEĞİ
// ═══════════════════════════════════════════════
let editingProjectId = null;
let tempProjectImages = [];

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  const projects = DB.get('projects');

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <p>Henüz proje eklenmemiş. "Yeni Proje Ekle" butonuna tıklayarak başlayın.</p>
      </div>`;
    return;
  }

  grid.innerHTML = projects.map(p => {
    const images = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    const coverImg = images[0] || '';
    const photoCount = images.length;

    return `
      <div class="data-card">
        ${coverImg
          ? `<div style="position:relative">
              <img src="${coverImg}" class="data-card-img" alt="${p.title}">
              ${photoCount > 1 ? `<span style="position:absolute;top:0.5rem;right:0.5rem;background:rgba(0,0,0,0.7);color:var(--gold);font-size:0.7rem;padding:0.2rem 0.5rem;border:1px solid var(--border-light)">${photoCount} fotoğraf</span>` : ''}
            </div>`
          : `<div class="data-card-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>`
        }
        <div class="data-card-body">
          <h4>${p.title}</h4>
          <p>${p.description || ''}</p>
          <div class="data-card-meta">
            ${p.tag ? `<span class="data-card-tag">${p.tag}</span>` : ''}
            ${p.details ? `<span class="data-card-tag">${p.details}</span>` : ''}
          </div>
          <div class="data-card-actions">
            <button class="btn-sm" onclick="editProject(${p.id})">Düzenle</button>
            <button class="btn-sm danger" onclick="deleteProject(${p.id})">Sil</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openProjectModal(project = null) {
  editingProjectId = project ? project.id : null;

  if (project) {
    tempProjectImages = project.images && project.images.length > 0
      ? [...project.images]
      : (project.image ? [project.image] : []);
  } else {
    tempProjectImages = [];
  }

  document.getElementById('modalTitle').textContent = project ? 'Projeyi Düzenle' : 'Yeni Proje Ekle';

  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Proje Adı</label>
      <input type="text" id="projectTitle" value="${project?.title || ''}" placeholder="Örn: Zorlu Center Residence">
    </div>
    <div class="form-group">
      <label>Açıklama</label>
      <textarea id="projectDesc" rows="3" placeholder="Proje hakkında detaylı açıklama...">${project?.description || ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Etiket</label>
        <input type="text" id="projectTag" value="${project?.tag || ''}" placeholder="Örn: Toplu Proje">
      </div>
      <div class="form-group">
        <label>Detay</label>
        <input type="text" id="projectDetails" value="${project?.details || ''}" placeholder="Örn: 48 daire">
      </div>
    </div>
    <div class="form-group">
      <label>Fotoğraflar (birden fazla seçebilirsiniz)</label>
      <div class="file-upload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <p>Fotoğraf yüklemek için tıklayın <small style="display:block;color:var(--text-muted);margin-top:0.2rem">Büyük fotoğraflar otomatik küçültülür</small></p>
        <input type="file" id="projectFiles" accept="image/*" multiple onchange="handleProjectFiles(this)">
      </div>
      <div id="projectPreviews" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-add" onclick="saveProject()">
        ${project ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  `;

  renderProjectPreviews();
  openModalOverlay();
}

// [DÜZELTME] Fotoğraf yükleme artık canvas ile otomatik küçültüyor
function handleProjectFiles(input) {
  const files = Array.from(input.files);

  const promises = files.map(file =>
    resizeImageIfNeeded(file).then(dataUrl => {
      tempProjectImages.push(dataUrl);
    }).catch(() => {
      showToast(`${file.name} — yüklenemedi, atlandı`, 'error');
    })
  );

  Promise.all(promises).then(() => renderProjectPreviews());
  input.value = '';
}

function renderProjectPreviews() {
  const container = document.getElementById('projectPreviews');
  if (!container) return;

  if (tempProjectImages.length === 0) {
    container.innerHTML = '<p style="font-size:0.78rem;color:var(--text-muted)">Henüz fotoğraf eklenmedi</p>';
    return;
  }

  container.innerHTML = tempProjectImages.map((img, i) => `
    <div style="position:relative;width:80px;height:80px;flex-shrink:0">
      <img src="${img}" style="width:100%;height:100%;object-fit:cover;border:1px solid var(--border)">
      ${i === 0 ? '<span style="position:absolute;bottom:0;left:0;right:0;background:var(--gold);color:var(--bg-primary);font-size:0.55rem;text-align:center;padding:1px;letter-spacing:0.5px">KAPAK</span>' : ''}
      <button type="button" onclick="removeProjectImage(${i})" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:var(--danger);color:#fff;border:none;border-radius:50%;font-size:11px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center">&times;</button>
    </div>
  `).join('');
}

function removeProjectImage(index) {
  tempProjectImages.splice(index, 1);
  renderProjectPreviews();
}

function saveProject() {
  const title = document.getElementById('projectTitle').value.trim();
  if (!title) { showToast('Proje adı gerekli', 'error'); return; }

  const projects = DB.get('projects');

  const data = {
    id: editingProjectId || Date.now(),
    title,
    description: document.getElementById('projectDesc').value.trim(),
    tag: document.getElementById('projectTag').value.trim(),
    details: document.getElementById('projectDetails').value.trim(),
    images: [...tempProjectImages],
    image: tempProjectImages[0] || ''
  };

  if (editingProjectId) {
    const idx = projects.findIndex(p => p.id === editingProjectId);
    if (idx !== -1) projects[idx] = data;
    showToast('Proje güncellendi', 'success');
  } else {
    projects.push(data);
    showToast('Proje eklendi', 'success');
  }

  DB.set('projects', projects);
  renderProjects();
  closeModal();
}

function editProject(id) {
  const project = DB.get('projects').find(p => p.id === id);
  if (project) openProjectModal(project);
}

function deleteProject(id) {
  if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
  const projects = DB.get('projects').filter(p => p.id !== id);
  DB.set('projects', projects);
  renderProjects();
  showToast('Proje silindi', 'info');
}


// ═══════════════════════════════════════════════
// ÜRÜNLER CRUD
// ═══════════════════════════════════════════════
let editingProductId = null;

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const products = DB.get('products');

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18"/></svg>
        <p>Henüz ürün eklenmemiş. "Yeni Ürün Ekle" butonuna tıklayarak başlayın.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="data-card">
      ${p.image
        ? `<img src="${p.image}" class="data-card-img" alt="${p.name}">`
        : `<div class="data-card-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18"/></svg></div>`
      }
      <div class="data-card-body">
        <h4>${p.name}</h4>
        <p>${p.description || ''}</p>
        <div class="data-card-meta">
          ${(p.features || []).map(f => `<span class="data-card-tag">${f}</span>`).join('')}
        </div>
        ${p.price ? `<div class="data-card-price">₺${p.price}</div>` : ''}
        ${p.badge ? `<span class="data-card-tag" style="color:var(--gold);border-color:var(--gold-dark)">${p.badge}</span>` : ''}
        <div class="data-card-actions" style="margin-top:0.8rem">
          <button class="btn-sm" onclick="editProduct(${p.id})">Düzenle</button>
          <button class="btn-sm danger" onclick="deleteProduct(${p.id})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openProductModal(product = null) {
  editingProductId = product ? product.id : null;
  document.getElementById('modalTitle').textContent = product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle';

  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Ürün Adı</label>
      <input type="text" id="productName" value="${product?.name || ''}" placeholder="Örn: Frameless Duşakabin">
    </div>
    <div class="form-group">
      <label>Açıklama</label>
      <textarea id="productDesc" rows="3" placeholder="Ürün detaylı açıklaması...">${product?.description || ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fiyat (₺)</label>
        <input type="text" id="productPrice" value="${product?.price || ''}" placeholder="18.500">
      </div>
      <div class="form-group">
        <label>Rozet (opsiyonel)</label>
        <input type="text" id="productBadge" value="${product?.badge || ''}" placeholder="Örn: En Çok Satan">
      </div>
    </div>
    <div class="form-group">
      <label>Özellikler (virgülle ayırın)</label>
      <input type="text" id="productFeatures" value="${(product?.features || []).join(', ')}" placeholder="Temperli Cam, 8-10mm, Kolay Temizlik">
    </div>
    <div class="form-group">
      <label>Fotoğraf</label>
      <div class="file-upload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <p>Fotoğraf yüklemek için tıklayın<small style="display:block;color:var(--text-muted);margin-top:0.2rem">Büyük fotoğraflar otomatik küçültülür</small></p>
        <span class="file-name" id="productFileName"></span>
        <input type="file" id="productFile" accept="image/*" onchange="handleProductFile(this)">
      </div>
      ${product?.image ? `<img src="${product.image}" class="file-preview" id="productPreview">` : '<img class="file-preview" id="productPreview" style="display:none">'}
    </div>
    <div class="modal-actions">
      <button class="btn-add" onclick="saveProduct()">
        ${product ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  `;

  openModalOverlay();
}

// [DÜZELTME] Ürün fotoğrafı da canvas ile küçültülüyor
function handleProductFile(input) {
  const file = input.files[0];
  if (!file) return;

  document.getElementById('productFileName').textContent = file.name;

  resizeImageIfNeeded(file).then(dataUrl => {
    const preview = document.getElementById('productPreview');
    preview.src = dataUrl;
    preview.style.display = 'block';
  }).catch(() => {
    showToast('Fotoğraf yüklenemedi', 'error');
  });

  input.value = '';
}

function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  if (!name) { showToast('Ürün adı gerekli', 'error'); return; }

  const products = DB.get('products');
  const preview = document.getElementById('productPreview');
  const imageData = preview && preview.style.display !== 'none' ? preview.src : '';
  const featuresRaw = document.getElementById('productFeatures').value;
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];

  const data = {
    id: editingProductId || Date.now(),
    name,
    description: document.getElementById('productDesc').value.trim(),
    price: document.getElementById('productPrice').value.trim(),
    badge: document.getElementById('productBadge').value.trim(),
    features,
    image: imageData
  };

  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx !== -1) products[idx] = data;
    showToast('Ürün güncellendi', 'success');
  } else {
    products.push(data);
    showToast('Ürün eklendi', 'success');
  }

  DB.set('products', products);
  renderProducts();
  closeModal();
}

function editProduct(id) {
  const product = DB.get('products').find(p => p.id === id);
  if (product) openProductModal(product);
}

function deleteProduct(id) {
  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
  const products = DB.get('products').filter(p => p.id !== id);
  DB.set('products', products);
  renderProducts();
  showToast('Ürün silindi', 'info');
}


// ═══════════════════════════════════════════════
// İŞ ORTAKLARI CRUD
// ═══════════════════════════════════════════════
let editingPartnerId = null;

function renderPartners() {
  const grid = document.getElementById('partnersGrid');
  const partners = DB.get('partners');

  if (partners.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p>Henüz iş ortağı eklenmemiş. "Yeni Firma Ekle" butonuna tıklayarak başlayın.</p>
      </div>`;
    return;
  }

  grid.innerHTML = partners.map(p => `
    <div class="data-card">
      <div class="data-card-body">
        <h4>${p.name}</h4>
        <p>${p.description || ''}</p>
        <div class="data-card-meta">
          ${p.since ? `<span class="data-card-tag">${p.since}'den beri</span>` : ''}
          ${p.sector ? `<span class="data-card-tag">${p.sector}</span>` : ''}
        </div>
        <div class="data-card-actions">
          <button class="btn-sm" onclick="editPartner(${p.id})">Düzenle</button>
          <button class="btn-sm danger" onclick="deletePartner(${p.id})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openPartnerModal(partner = null) {
  editingPartnerId = partner ? partner.id : null;
  document.getElementById('modalTitle').textContent = partner ? 'Firmayı Düzenle' : 'Yeni Firma Ekle';

  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Firma Adı</label>
      <input type="text" id="partnerName" value="${partner?.name || ''}" placeholder="Örn: Eczacıbaşı / VitrA">
    </div>
    <div class="form-group">
      <label>Açıklama</label>
      <textarea id="partnerDesc" rows="2" placeholder="İş birliği detayı...">${partner?.description || ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Başlangıç Yılı</label>
        <input type="text" id="partnerSince" value="${partner?.since || ''}" placeholder="2018">
      </div>
      <div class="form-group">
        <label>Sektör</label>
        <input type="text" id="partnerSector" value="${partner?.sector || ''}" placeholder="Örn: İnşaat">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-add" onclick="savePartner()">
        ${partner ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  `;

  openModalOverlay();
}

function savePartner() {
  const name = document.getElementById('partnerName').value.trim();
  if (!name) { showToast('Firma adı gerekli', 'error'); return; }

  const partners = DB.get('partners');
  const data = {
    id: editingPartnerId || Date.now(),
    name,
    description: document.getElementById('partnerDesc').value.trim(),
    since: document.getElementById('partnerSince').value.trim(),
    sector: document.getElementById('partnerSector').value.trim()
  };

  if (editingPartnerId) {
    const idx = partners.findIndex(p => p.id === editingPartnerId);
    if (idx !== -1) partners[idx] = data;
    showToast('Firma güncellendi', 'success');
  } else {
    partners.push(data);
    showToast('Firma eklendi', 'success');
  }

  DB.set('partners', partners);
  renderPartners();
  closeModal();
}

function editPartner(id) {
  const partner = DB.get('partners').find(p => p.id === id);
  if (partner) openPartnerModal(partner);
}

function deletePartner(id) {
  if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
  const partners = DB.get('partners').filter(p => p.id !== id);
  DB.set('partners', partners);
  renderPartners();
  showToast('Firma silindi', 'info');
}


// ═══════════════════════════════════════════════
// MESAJLAR YÖNETİMİ
// ═══════════════════════════════════════════════
function renderMessages() {
  const list = document.getElementById('messagesList');
  const messages = DB.get('messages');
  updateMessageBadge();

  if (messages.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <p>Henüz mesaj yok. Sitedeki formdan gelen mesajlar burada görünecek.</p>
      </div>`;
    return;
  }

  const sorted = [...messages].sort((a, b) => b.id - a.id);

  list.innerHTML = sorted.map(m => `
    <div class="message-item ${m.read ? '' : 'unread'}" onclick="viewMessage(${m.id})">
      <span class="message-dot"></span>
      <div class="message-content">
        <h4>${m.fullName || 'İsimsiz'}</h4>
        <p>${m.message || 'Mesaj yok'}</p>
      </div>
      <div class="message-meta">
        <span class="date">${formatDate(m.date)}</span>
        <span class="type">${getProjectTypeLabel(m.projectType)}</span>
      </div>
      <button class="message-delete" onclick="event.stopPropagation(); deleteMessage(${m.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');
}

function viewMessage(id) {
  const messages = DB.get('messages');
  const msg = messages.find(m => m.id === id);
  if (!msg) return;

  msg.read = true;
  DB.set('messages', messages);
  renderMessages();

  // [DÜZELTME] WhatsApp numarası: önce 90'ları temizle, sonra 90 ekle
  const rawPhone = (msg.phone || '').replace(/\D/g, '').replace(/^90/, '');
  const waNumber = '90' + rawPhone;

  document.getElementById('messageModalBody').innerHTML = `
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem">
        <h3 style="font-size:1.1rem">${msg.fullName || 'İsimsiz'}</h3>
        <span style="font-size:0.75rem;color:var(--text-muted)">${formatDate(msg.date)}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1rem">
        <div>
          <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Telefon</span>
          <p style="font-size:0.9rem;margin-top:0.2rem">${msg.phone || '-'}</p>
        </div>
        <div>
          <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">E-Posta</span>
          <p style="font-size:0.9rem;margin-top:0.2rem">${msg.email || '-'}</p>
        </div>
        <div>
          <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Proje Tipi</span>
          <p style="font-size:0.9rem;margin-top:0.2rem">${getProjectTypeLabel(msg.projectType)}</p>
        </div>
      </div>
      <div>
        <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Mesaj</span>
        <p style="font-size:0.9rem;margin-top:0.3rem;line-height:1.7;color:var(--text-secondary)">${msg.message || '-'}</p>
      </div>
    </div>
    <div style="display:flex;gap:0.5rem;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">
      <a href="tel:${msg.phone}" class="btn-add" style="text-decoration:none;font-size:0.78rem;padding:0.6rem 1rem">Ara</a>
      <a href="mailto:${msg.email}" class="btn-sm" style="text-decoration:none;padding:0.6rem 1rem">E-Posta</a>
      <a href="https://wa.me/${waNumber}" target="_blank" class="btn-sm" style="text-decoration:none;padding:0.6rem 1rem;color:#25D366;border-color:#25D366">WhatsApp</a>
    </div>
  `;

  document.getElementById('messageModalOverlay').classList.add('active');
}

function deleteMessage(id) {
  if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
  const messages = DB.get('messages').filter(m => m.id !== id);
  DB.set('messages', messages);
  renderMessages();
  showToast('Mesaj silindi', 'info');
}

function markAllRead() {
  const messages = DB.get('messages').map(m => ({ ...m, read: true }));
  DB.set('messages', messages);
  renderMessages();
  showToast('Tüm mesajlar okundu olarak işaretlendi', 'success');
}

function closeMessageModal() {
  document.getElementById('messageModalOverlay').classList.remove('active');
}

function updateMessageBadge() {
  const messages = DB.get('messages');
  const unread = messages.filter(m => !m.read).length;
  const badge = document.getElementById('messageBadge');
  badge.textContent = unread;
  badge.style.display = unread > 0 ? '' : 'none';
}


// ═══════════════════════════════════════════════
// SİTE AYARLARI
// ═══════════════════════════════════════════════
function loadSettings() {
  const s = DB.getObj('settings');
  document.getElementById('settingCompanyName').value = s.companyName || '';
  document.getElementById('settingSlogan').value = s.slogan || '';
  document.getElementById('settingPhone').value = s.phone || '';
  document.getElementById('settingEmail').value = s.email || '';
  document.getElementById('settingAddress').value = s.address || 'Çırçır, Burkulan Sk. No:1\nEyüpsultan / İstanbul';
  document.getElementById('settingInstagram').value = s.instagram || '';
  document.getElementById('settingFacebook').value = s.facebook || '';
  document.getElementById('settingYoutube').value = s.youtube || '';
  document.getElementById('settingLinkedin').value = s.linkedin || '';
  document.getElementById('settingEmailjsPublicKey').value = s.emailjsPublicKey || '';
  document.getElementById('settingEmailjsServiceId').value = s.emailjsServiceId || '';
  document.getElementById('settingEmailjsTemplateId').value = s.emailjsTemplateId || '';
  document.getElementById('settingNotificationEmail').value = s.notificationEmail || '';
}

function saveSettings() {
  const data = {
    companyName: document.getElementById('settingCompanyName').value.trim(),
    slogan: document.getElementById('settingSlogan').value.trim(),
    phone: document.getElementById('settingPhone').value.trim(),
    email: document.getElementById('settingEmail').value.trim(),
    address: document.getElementById('settingAddress').value.trim(),
    instagram: document.getElementById('settingInstagram').value.trim(),
    facebook: document.getElementById('settingFacebook').value.trim(),
    youtube: document.getElementById('settingYoutube').value.trim(),
    linkedin: document.getElementById('settingLinkedin').value.trim(),
    emailjsPublicKey: document.getElementById('settingEmailjsPublicKey').value.trim(),
    emailjsServiceId: document.getElementById('settingEmailjsServiceId').value.trim(),
    emailjsTemplateId: document.getElementById('settingEmailjsTemplateId').value.trim(),
    notificationEmail: document.getElementById('settingNotificationEmail').value.trim()
  };

  DB.setObj('settings', data);
  showToast('Ayarlar kaydedildi', 'success');
}


// ═══════════════════════════════════════════════
// WHATSAPP AYARLARI
// ═══════════════════════════════════════════════
function loadWhatsApp() {
  const wa = DB.getObj('whatsapp');
  document.getElementById('whatsappNumber').value = wa.number || '';
  document.getElementById('whatsappMessage').value = wa.message || '';
  document.getElementById('whatsappEnabled').checked = wa.enabled !== false;
}

function saveWhatsApp() {
  const data = {
    number: document.getElementById('whatsappNumber').value.trim(),
    message: document.getElementById('whatsappMessage').value.trim(),
    enabled: document.getElementById('whatsappEnabled').checked
  };

  DB.setObj('whatsapp', data);
  showToast('WhatsApp ayarları kaydedildi', 'success');
}


// ═══════════════════════════════════════════════
// [YENİ] VERİ EXPORT / IMPORT
// ═══════════════════════════════════════════════
function exportData() {
  const backup = {
    version: 1,
    date: new Date().toISOString(),
    projects: DB.get('projects'),
    products: DB.get('products'),
    partners: DB.get('partners'),
    messages: DB.get('messages'),
    settings: DB.getObj('settings'),
    whatsapp: DB.getObj('whatsapp')
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oskardus-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Veriler dışa aktarıldı', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.version) throw new Error('Geçersiz yedek dosyası');

      if (!confirm(`${data.date ? new Date(data.date).toLocaleDateString('tr-TR') : 'Bilinmiyor'} tarihli yedek içe aktarılacak. Mevcut veriler silinecek. Devam edilsin mi?`)) return;

      if (data.projects) DB.set('projects', data.projects);
      if (data.products) DB.set('products', data.products);
      if (data.partners) DB.set('partners', data.partners);
      if (data.messages) DB.set('messages', data.messages);
      if (data.settings) DB.setObj('settings', data.settings);
      if (data.whatsapp) DB.setObj('whatsapp', data.whatsapp);

      renderProjects();
      renderProducts();
      renderPartners();
      renderMessages();
      loadSettings();
      loadWhatsApp();

      showToast('Veriler başarıyla içe aktarıldı', 'success');
    } catch (err) {
      showToast('Geçersiz yedek dosyası', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// [YENİ] Şifre değiştirme
function changeAdminPassword() {
  const newPw = prompt('Yeni admin şifresi girin (en az 6 karakter):');
  if (!newPw) return;
  if (newPw.length < 6) { showToast('Şifre en az 6 karakter olmalı', 'error'); return; }
  localStorage.setItem('cc_admin_password', newPw);
  showToast('Şifre güncellendi. Bir sonraki girişte geçerli olacak.', 'success');
}


// ═══════════════════════════════════════════════
// MODAL YÖNETİMİ
// ═══════════════════════════════════════════════
function openModal(type) {
  if (type === 'project') openProjectModal();
  else if (type === 'product') openProductModal();
  else if (type === 'partner') openPartnerModal();
}

function openModalOverlay() {
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  editingProjectId = null;
  editingProductId = null;
  editingPartnerId = null;
  tempProjectImages = [];
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMessageModal();
  }
});

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('messageModalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMessageModal();
});


// ═══════════════════════════════════════════════
// DOSYA YÜKLEMESİ (Eski uyumluluk — tekli)
// ═══════════════════════════════════════════════
function handleFileSelect(input, fileNameId, previewId) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById(fileNameId).textContent = file.name;

  resizeImageIfNeeded(file).then(dataUrl => {
    const preview = document.getElementById(previewId);
    preview.src = dataUrl;
    preview.style.display = 'block';
  });
}


// ═══════════════════════════════════════════════
// TOAST BİLDİRİMLER
// ═══════════════════════════════════════════════
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ═══════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getProjectTypeLabel(type) {
  const labels = {
    'bireysel': 'Konut — Bireysel',
    'toplu': 'Konut — Toplu Proje',
    'otel': 'Otel / Spa',
    'ticari': 'Ticari Alan',
    'diger': 'Diğer'
  };
  return labels[type] || type || '-';
}


// ═══════════════════════════════════════════════
// ESKİ MESAJLARI MİGRASYON
// ═══════════════════════════════════════════════
function migrateOldMessages() {
  const oldMessages = JSON.parse(localStorage.getItem('crystalcabin_messages') || '[]');
  if (oldMessages.length > 0) {
    const existing = DB.get('messages');
    const existingIds = new Set(existing.map(m => m.id));
    const newMessages = oldMessages.filter(m => !existingIds.has(m.id));
    if (newMessages.length > 0) {
      DB.set('messages', [...existing, ...newMessages]);
    }
  }
}


// ═══════════════════════════════════════════════
// BAŞLATMA
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  migrateOldMessages();
  renderProjects();
  renderProducts();
  renderPartners();
  renderMessages();
  loadSettings();
  loadWhatsApp();
  updateMessageBadge();
});