/* ═══════════════════════════════════════════════
   Oskar Duş — Entegrasyon Katmanı
   bridge.js

   Bu dosya admin panelindeki verileri alıp
   ana siteye (frontend) dinamik olarak yansıtır.

   KULLANIM:
   index.html'e SADECE main.js ekleyin.
   bridge.js artık ayrıca eklenmez — main.js
   tüm veri yükleme işlevlerini içermektedir.
   Bu dosya ileride harici entegrasyonlar için
   referans olarak saklanmaktadır.
   ═══════════════════════════════════════════════ */

const Bridge = {

  // ─── VERİ OKUMA ───
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(`cc_${key}`) || '[]');
    } catch { return []; }
  },

  getObj(key) {
    try {
      return JSON.parse(localStorage.getItem(`cc_${key}`) || '{}');
    } catch { return {}; }
  },


  // ═══════════════════════════════════════════════
  // 1. PROJELERİ YÜKLE → #projeler bölümü
  // ═══════════════════════════════════════════════
  loadProjects() {
    const projects = this.get('projects');
    const grid = document.querySelector('#projeler .gallery-grid');
    if (!grid || projects.length === 0) return;

    grid.innerHTML = projects.map((p, i) => {
      // [DÜZELTME] images dizisini de destekle
      const img = (p.images && p.images.length > 0) ? p.images[0] : (p.image || '');
      return `
      <div class="gallery-item ${i === 0 ? 'gallery-item--large' : ''} reveal">
        <div class="gallery-item-img" ${img ? `style="background-image:url('${img}');background-size:cover;background-position:center"` : ''}>
          ${!img ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>` : ''}
        </div>
        <div class="gallery-overlay">
          <h4>${p.title}</h4>
          <p>${p.description || ''}</p>
          ${p.tag ? `<span class="gallery-tag">${p.tag}</span>` : ''}
        </div>
      </div>
    `;
    }).join('');
  },


  // ═══════════════════════════════════════════════
  // 2. ÜRÜNLERİ YÜKLE → #urunler bölümü
  // ═══════════════════════════════════════════════
  loadProducts() {
    const products = this.get('products');
    const grid = document.querySelector('#urunler .catalog-grid');
    if (!grid || products.length === 0) return;

    grid.innerHTML = products.map(p => `
      <div class="catalog-card reveal">
        <div class="catalog-card-visual" ${p.image ? `style="background-image:url('${p.image}');background-size:cover;background-position:center"` : ''}>
          ${!p.image ? `<div class="product-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18"/>
              </svg>
            </div>` : ''}
          ${p.badge ? `<span class="catalog-card-badge">${p.badge}</span>` : ''}
        </div>
        <div class="catalog-card-body">
          <h3>${p.name}</h3>
          <p>${p.description || ''}</p>
          <div class="catalog-features">
            ${(p.features || []).map(f => `<span class="catalog-feature">${f}</span>`).join('')}
          </div>
          ${p.price ? `
            <div class="catalog-price">
              <span class="from">Başlayan fiyat:</span>
              <span class="amount">₺${p.price}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  },


  // ═══════════════════════════════════════════════
  // 3. İŞ ORTAKLARINI YÜKLE → #firmalar bölümü
  // ═══════════════════════════════════════════════
  loadPartners() {
    const partners = this.get('partners');

    const scrollContainer = document.getElementById('partnersScroll');
    if (scrollContainer && partners.length > 0) {
      const items = partners.map(p =>
        `<div class="partner-item"><span>${p.name}</span></div>`
      ).join('');
      scrollContainer.innerHTML = items + items;
    }

    const detailGrid = document.querySelector('.partners-detail-grid');
    if (detailGrid && partners.length > 0) {
      detailGrid.innerHTML = partners.map(p => `
        <div class="partner-detail reveal">
          <h4>${p.name}</h4>
          <p>${p.description || ''}</p>
          ${p.since ? `<span class="partner-year">${p.since}'den beri</span>` : ''}
        </div>
      `).join('');
    }
  },


  // ═══════════════════════════════════════════════
  // 4. SİTE AYARLARINI YÜKLE
  // ═══════════════════════════════════════════════
  loadSettings() {
    const s = this.getObj('settings');
    if (Object.keys(s).length === 0) return;

    if (s.phone) {
      document.querySelectorAll('.contact-detail-text').forEach(el => {
        const label = el.querySelector('span');
        if (label && label.textContent === 'Telefon') el.querySelector('p').textContent = s.phone;
      });
    }

    if (s.email) {
      document.querySelectorAll('.contact-detail-text').forEach(el => {
        const label = el.querySelector('span');
        if (label && label.textContent === 'E-Posta') el.querySelector('p').textContent = s.email;
      });
    }

    if (s.address) {
      document.querySelectorAll('.contact-detail-text').forEach(el => {
        const label = el.querySelector('span');
        if (label && label.textContent === 'Showroom') {
          el.querySelector('p').innerHTML = s.address
            ? s.address.replace(/\n/g, '<br>')
            : 'Çırçır, Burkulan Sk. No:1<br>Eyüpsultan / İstanbul';
        }
      });
    }

    const socialLinks = document.querySelectorAll('.footer-social a');
    const socialMap = [{ key: 'instagram' }, { key: 'facebook' }, { key: 'youtube' }, { key: 'linkedin' }];
    socialLinks.forEach((link, i) => {
      if (socialMap[i] && s[socialMap[i].key]) {
        link.href = s[socialMap[i].key];
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
  },


  // ═══════════════════════════════════════════════
  // 5. WHATSAPP BUTONUNU YÜKLE
  // ═══════════════════════════════════════════════
  loadWhatsApp() {
    const wa = this.getObj('whatsapp');
    if (!wa.enabled || !wa.number) return;
    if (document.getElementById('wa-float-btn')) return;

    const btn = document.createElement('a');
    btn.id = 'wa-float-btn';
    btn.href = `https://wa.me/${wa.number}?text=${encodeURIComponent(wa.message || 'Merhaba!')}`;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'WhatsApp ile iletişime geç');
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
      z-index: 999;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      text-decoration: none;
    `;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 6px 30px rgba(37, 211, 102, 0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
    });

    document.body.appendChild(btn);
  },


  // ═══════════════════════════════════════════════
  // 6. E-POSTA GÖNDERİMİ (EmailJS)
  // ═══════════════════════════════════════════════
  async sendEmail(formData) {
    const s = this.getObj('settings');
    const { emailjsPublicKey, emailjsServiceId, emailjsTemplateId } = s;

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.log('EmailJS yapılandırılmamış.');
      return false;
    }

    if (!window.emailjs) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        emailjs.init(emailjsPublicKey);
      } catch (err) {
        console.error('EmailJS yüklenemedi:', err);
        return false;
      }
    }

    try {
      await emailjs.send(emailjsServiceId, emailjsTemplateId, {
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        project_type: formData.projectType,
        message: formData.message,
        to_email: s.notificationEmail || s.email
      });
      return true;
    } catch (err) {
      console.error('E-posta gönderilemedi:', err);
      return false;
    }
  },


  // ═══════════════════════════════════════════════
  // 7. MESAJ KAYDET (Admin paneli için)
  // ═══════════════════════════════════════════════
  saveMessage(formData) {
    let messages = this.get('messages');
    const msg = {
      ...formData,
      id: Date.now(),
      read: false,
      date: new Date().toISOString()
    };
    messages.push(msg);
    localStorage.setItem('cc_messages', JSON.stringify(messages));
  },


  // ═══════════════════════════════════════════════
  // 8. TARAYICI BİLDİRİMİ — [DÜZELTME] Oskar Duş
  // ═══════════════════════════════════════════════
  sendNotification(formData) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('Oskar Duş — Yeni Mesaj', {
        body: `${formData.fullName} — ${formData.phone}\n${(formData.message || '').substring(0, 80)}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🚿</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 5000);
    }
  },


  // ═══════════════════════════════════════════════
  // 9. REVEAL ANİMASYONLARINI YENİDEN BAŞLAT
  // ═══════════════════════════════════════════════
  refreshRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal:not(.visible)');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  },


  // ═══════════════════════════════════════════════
  // ANA BAŞLATMA — [NOT] Bu dosya artık index.html'e
  // eklenmez. main.js tüm görevleri üstlendi.
  // ═══════════════════════════════════════════════
  init() {
    this.loadProjects();
    this.loadProducts();
    this.loadPartners();
    this.loadSettings();
    this.loadWhatsApp();
    this.requestNotificationPermission();
    setTimeout(() => this.refreshRevealAnimations(), 100);
    console.log('✓ Bridge entegrasyonu yüklendi');
  }
};