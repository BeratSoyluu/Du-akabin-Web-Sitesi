/* ═══════════════════════════════════════════════
   CrystalCabin — Admin Paneli JS
   admin.js — CRUD, EmailJS, Bildirimler
   ═══════════════════════════════════════════════ */

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

    // Mobilde sidebar kapat
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobil menü
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Sidebar dışına tıklayınca kapat
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});


// ═══════════════════════════════════════════════
// PROJELER CRUD
// ═══════════════════════════════════════════════
let editingProjectId = null;

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

  grid.innerHTML = projects.map(p => `
    <div class="data-card">
      ${p.image
        ? `<img src="${p.image}" class="data-card-img" alt="${p.title}">`
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
  `).join('');
}

function openProjectModal(project = null) {
  editingProjectId = project ? project.id : null;
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
      <label>Fotoğraf</label>
      <div class="file-upload" id="projectFileUpload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <p>Fotoğraf yüklemek için tıklayın veya sürükleyin</p>
        <span class="file-name" id="projectFileName"></span>
        <input type="file" id="projectFile" accept="image/*" onchange="handleFileSelect(this, 'projectFileName', 'projectPreview')">
      </div>
      ${project?.image ? `<img src="${project.image}" class="file-preview" id="projectPreview">` : '<img class="file-preview" id="projectPreview" style="display:none">'}
    </div>
    <div class="modal-actions">
      <button class="btn-add" onclick="saveProject()">
        ${project ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  `;

  openModalOverlay();
}

function saveProject() {
  const title = document.getElementById('projectTitle').value.trim();
  if (!title) { showToast('Proje adı gerekli', 'error'); return; }

  const projects = DB.get('projects');
  const preview = document.getElementById('projectPreview');
  const imageData = preview && preview.style.display !== 'none' ? preview.src : '';

  const data = {
    id: editingProjectId || Date.now(),
    title,
    description: document.getElementById('projectDesc').value.trim(),
    tag: document.getElementById('projectTag').value.trim(),
    details: document.getElementById('projectDetails').value.trim(),
    image: imageData
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
        <p>Fotoğraf yüklemek için tıklayın</p>
        <span class="file-name" id="productFileName"></span>
        <input type="file" id="productFile" accept="image/*" onchange="handleFileSelect(this, 'productFileName', 'productPreview')">
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

  // En yeniden eskiye sırala
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

  // Okundu olarak işaretle
  msg.read = true;
  DB.set('messages', messages);
  renderMessages();

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
      <a href="mailto:${msg.email}" class="btn-sm" style="text-decoration:none;padding:0.6rem 1rem">E-Posta Gönder</a>
      <a href="https://wa.me/90${(msg.phone || '').replace(/\D/g,'')}" target="_blank" class="btn-sm" style="text-decoration:none;padding:0.6rem 1rem;color:#25D366;border-color:#25D366">WhatsApp</a>
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
  document.getElementById('settingAddress').value = s.address || '';
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
}

// ESC ile modal kapat
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMessageModal();
  }
});

// Overlay tıklamayla kapat
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('messageModalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMessageModal();
});


// ═══════════════════════════════════════════════
// DOSYA YÜKLEMESİ
// ═══════════════════════════════════════════════
function handleFileSelect(input, fileNameId, previewId) {
  const file = input.files[0];
  if (!file) return;

  // Dosya boyutu kontrolü (2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast('Dosya boyutu 2MB\'dan küçük olmalı', 'error');
    input.value = '';
    return;
  }

  document.getElementById(fileNameId).textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById(previewId);
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
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
// ESKİ MESAJLARI MİGRASYON (main.js uyumluluğu)
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
  migrateOldMessages();
  renderProjects();
  renderProducts();
  renderPartners();
  renderMessages();
  loadSettings();
  loadWhatsApp();
  updateMessageBadge();
});
