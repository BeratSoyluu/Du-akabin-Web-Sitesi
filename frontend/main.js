/* ═══════════════════════════════════════════════
   Oskar Duş — Premium Duşakabin Web Sitesi
   main.js — Etkileşimler & Animasyonlar
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// ADMIN PANELİNDEN VERİ ÇEKME FONKSİYONLARI
// ═══════════════════════════════════════════════

// [DÜZELTME] Hem images dizisini hem de eski tek image formatını destekle
function getProjectCoverImage(project) {
  if (project.images && project.images.length > 0) return project.images[0];
  if (project.image) return project.image;
  return '';
}

// Proje kartı oluştur (tekrar kullanılabilir)
function createProjectCard(project, isLarge) {
  const card = document.createElement('div');
  card.className = `gallery-item ${isLarge ? 'gallery-item--large' : ''} reveal visible`;

  const imgDiv = document.createElement('div');
  imgDiv.className = 'gallery-item-img';

  // [DÜZELTME] p.images dizisini kontrol et, eski formata da bak
  const coverImg = getProjectCoverImage(project);
  if (coverImg) {
    imgDiv.style.backgroundImage = `url('${coverImg}')`;
    imgDiv.style.backgroundSize = 'cover';
    imgDiv.style.backgroundPosition = 'center';
  } else {
    imgDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    `;
  }

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
  return card;
}

// Projeleri yükle (maks 6 göster)
function loadProjects() {
  const projects = JSON.parse(localStorage.getItem('cc_projects') || '[]');
  const container = document.querySelector('.gallery-grid');

  if (!container || projects.length === 0) return;

  container.innerHTML = '';

  const maxVisible = 6;
  const visibleProjects = projects.slice(0, maxVisible);

  visibleProjects.forEach((project, index) => {
    const isLarge = index === 0 && visibleProjects.length >= 3;
    container.appendChild(createProjectCard(project, isLarge));
  });

  // "Tümünü Gör" butonu — 6'dan fazla proje varsa göster
  if (projects.length > maxVisible) {
    const btnWrapper = document.createElement('div');
    btnWrapper.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 1.5rem;';
    btnWrapper.innerHTML = `
      <a href="projeler.html" style="
        display: inline-block;
        padding: 0.9rem 2.5rem;
        background: transparent;
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.8rem;
        font-weight: 400;
        letter-spacing: 2px;
        text-transform: uppercase;
        border: 1px solid var(--border-light);
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
      ">Tüm Projeleri Gör (${projects.length})</a>
    `;
    container.appendChild(btnWrapper);
  }
}

// Ürünleri yükle
function loadProducts() {
  const products = JSON.parse(localStorage.getItem('cc_products') || '[]');
  const container = document.querySelector('.catalog-grid');

  if (!container || products.length === 0) return;

  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'catalog-card reveal visible';

    const visualDiv = document.createElement('div');
    visualDiv.className = 'catalog-card-visual';

    if (product.image) {
      visualDiv.style.backgroundImage = `url('${product.image}')`;
      visualDiv.style.backgroundSize = 'cover';
      visualDiv.style.backgroundPosition = 'center';
    } else {
      const iconDiv = document.createElement('div');
      iconDiv.className = 'product-icon';
      iconDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18"/>
        </svg>
      `;
      visualDiv.appendChild(iconDiv);
    }

    if (product.badge) {
      const badge = document.createElement('span');
      badge.className = 'catalog-card-badge';
      badge.textContent = product.badge;
      visualDiv.appendChild(badge);
    }

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'catalog-card-body';

    let featuresHTML = '';
    if (product.features && product.features.length > 0) {
      featuresHTML = `
        <div class="catalog-features">
          ${product.features.map(f => `<span class="catalog-feature">${f}</span>`).join('')}
        </div>
      `;
    }

    let priceHTML = '';
    if (product.price) {
      priceHTML = `
        <div class="catalog-price">
          <span class="from">Başlayan fiyat:</span>
          <span class="amount">₺${product.price}</span>
        </div>
      `;
    }

    bodyDiv.innerHTML = `
      <h3>${product.name || ''}</h3>
      <p>${product.description || ''}</p>
      ${featuresHTML}
      ${priceHTML}
    `;

    card.appendChild(visualDiv);
    card.appendChild(bodyDiv);
    container.appendChild(card);
  });
}

// İş ortaklarını yükle
function loadPartners() {
  const partners = JSON.parse(localStorage.getItem('cc_partners') || '[]');
  const scrollContainer = document.getElementById('partnersScroll');
  const detailContainer = document.querySelector('.partners-detail-grid');

  if (!scrollContainer || partners.length === 0) return;

  let scrollHTML = '';
  partners.forEach(p => {
    scrollHTML += `<div class="partner-item"><span>${p.name}</span></div>`;
  });
  scrollContainer.innerHTML = scrollHTML + scrollHTML;

  if (detailContainer) {
    detailContainer.innerHTML = '';
    partners.slice(0, 4).forEach(p => {
      detailContainer.innerHTML += `
        <div class="partner-detail reveal visible">
          <h4>${p.name}</h4>
          <p>${p.description || ''}</p>
          ${p.since ? `<span class="partner-year">${p.since}'den beri</span>` : ''}
        </div>
      `;
    });
  }
}

// Site ayarlarını yükle
function loadSiteSettings() {
  const s = JSON.parse(localStorage.getItem('cc_settings') || '{}');
  if (Object.keys(s).length === 0) return;

  if (s.phone) {
    document.querySelectorAll('.contact-detail-text').forEach(el => {
      const label = el.querySelector('span');
      if (label && label.textContent === 'Telefon') {
        el.querySelector('p').textContent = s.phone;
      }
    });
  }

  if (s.email) {
    document.querySelectorAll('.contact-detail-text').forEach(el => {
      const label = el.querySelector('span');
      if (label && label.textContent === 'E-Posta') {
        el.querySelector('p').textContent = s.email;
      }
    });
  }

  if (s.address) {
    document.querySelectorAll('.contact-detail-text').forEach(el => {
      const label = el.querySelector('span');
      if (label && label.textContent === 'Showroom') {
        el.querySelector('p').innerHTML = s.address.replace(/\n/g, '<br>');
      }
    });
  }

  const socialLinks = document.querySelectorAll('.footer-social a');
  const socialMap = [
    { key: 'instagram' },
    { key: 'facebook' },
    { key: 'youtube' },
    { key: 'linkedin' }
  ];
  socialLinks.forEach((link, i) => {
    if (socialMap[i] && s[socialMap[i].key]) {
      link.href = s[socialMap[i].key];
      link.target = '_blank';
      link.rel = 'noopener';
    }
  });
}

// WhatsApp butonunu yükle
function initWhatsApp() {
  const wa = JSON.parse(localStorage.getItem('cc_whatsapp') || '{}');
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
}


// ═══════════════════════════════════════════════
// ANA UYGULAMA
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ─── ADMİN PANELİNDEN VERİLERİ YÜKLE ───
  // [DÜZELTME] bridge.js kaldırıldı, tüm veri yükleme burada
  loadProjects();
  loadProducts();
  loadPartners();
  loadSiteSettings();
  initWhatsApp();


  // ─── 1. NAVİGASYON — Scroll Efekti ───
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });


  // ─── 2. MOBİL MENÜ ───
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileCloseBtn.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });


  // ─── 3. SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });


  // ─── 4. SCROLL REVEAL ANİMASYONLARI ───
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        const index = Array.from(siblings).indexOf(entry.target);
        const delay = index * 100;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ─── 5. İSTATİSTİK SAYAÇ ANİMASYONU ───
  function animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * eased);
      element.textContent = current.toLocaleString('tr-TR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.hero-stats');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        const statNumbers = document.querySelectorAll('.hero-stat-number');
        statNumbers.forEach(stat => {
          const text = stat.textContent;
          const number = parseInt(text.replace(/[^0-9]/g, ''));
          const suffix = text.includes('+') ? '+' : '';
          animateCounter(stat, number, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }


  // ─── 6. İLETİŞİM FORMU + EMAILJS + BİLDİRİM ───
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const projectType = document.getElementById('projectType').value;
      const message = document.getElementById('message').value.trim();

      // [DÜZELTME] Geliştirilmiş form doğrulama
      if (!fullName) {
        showFormMessage('Lütfen adınızı ve soyadınızı girin.', 'error');
        return;
      }
      if (!phone) {
        showFormMessage('Lütfen telefon numaranızı girin.', 'error');
        return;
      }
      // [DÜZELTME] E-posta format kontrolü (dolu ise)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage('Lütfen geçerli bir e-posta adresi girin.', 'error');
        return;
      }

      const formData = { fullName, phone, email, projectType, message, date: new Date().toISOString() };

      saveMessage(formData);
      await sendEmailNotification(formData);
      sendBrowserNotification(formData);

      showFormMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
      contactForm.reset();
    });
  }

  function saveMessage(data) {
    data.id = Date.now();
    data.read = false;
    let messages = JSON.parse(localStorage.getItem('cc_messages') || '[]');
    messages.push(data);
    localStorage.setItem('cc_messages', JSON.stringify(messages));
  }

  async function sendEmailNotification(formData) {
    const settings = JSON.parse(localStorage.getItem('cc_settings') || '{}');
    const { emailjsPublicKey, emailjsServiceId, emailjsTemplateId } = settings;

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.log('EmailJS yapılandırılmamış, e-posta gönderilmedi.');
      return;
    }

    if (!window.emailjs) {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
        emailjs.init(emailjsPublicKey);
      } catch (err) {
        console.error('EmailJS yüklenemedi:', err);
        return;
      }
    }

    try {
      await emailjs.send(emailjsServiceId, emailjsTemplateId, {
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        project_type: formData.projectType,
        message: formData.message,
        to_email: settings.notificationEmail || settings.email
      });
      console.log('E-posta gönderildi');
    } catch (err) {
      console.error('E-posta gönderilemedi:', err);
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function sendBrowserNotification(formData) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('Oskar Duş — Yeni Mesaj', {
        body: `${formData.fullName} — ${formData.phone}\n${formData.message?.substring(0, 80) || 'Yeni teklif talebi'}`,
        // [DÜZELTME] marka adı ve ikon güncellendi
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🚿</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 5000);
  }

  function showFormMessage(text, type) {
    const existing = contactForm.querySelector('.form-message');
    if (existing) existing.remove();

    const messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    messageEl.textContent = text;
    messageEl.style.cssText = `
      padding: 1rem;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      border: 1px solid ${type === 'success' ? 'var(--gold)' : '#e74c3c'};
      color: ${type === 'success' ? 'var(--gold)' : '#e74c3c'};
      background: ${type === 'success' ? 'rgba(201, 169, 110, 0.08)' : 'rgba(231, 76, 60, 0.08)'};
    `;
    contactForm.appendChild(messageEl);
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transition = 'opacity 0.3s';
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }


  // ─── 7. PARTNER KAYDIRMA — Hover'da Duraklat ───
  const partnersScroll = document.getElementById('partnersScroll');

  if (partnersScroll) {
    partnersScroll.addEventListener('mouseenter', () => {
      partnersScroll.style.animationPlayState = 'paused';
    });
    partnersScroll.addEventListener('mouseleave', () => {
      partnersScroll.style.animationPlayState = 'running';
    });
  }


  // ─── 8. ACTIVE NAV LINK — Scroll Pozisyonuna Göre ───
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function updateActiveNav() {
    const scrollPos = window.scrollY + nav.offsetHeight + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--gold)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

});
