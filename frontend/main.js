/* ═══════════════════════════════════════════════
   CrystalCabin — Premium Duşakabin Web Sitesi
   main.js — Etkileşimler & Animasyonlar
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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

  // Menüyü aç
  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Menüyü kapat
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileCloseBtn.addEventListener('click', closeMobileMenu);

  // Link tıklanınca menüyü kapat
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });


  // ─── 3. SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  // ─── 4. SCROLL REVEAL ANİMASYONLARI ───
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Kademeli animasyon (her eleman sırayla görünür)
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        const index = Array.from(siblings).indexOf(entry.target);
        const delay = index * 100; // Her eleman 100ms arayla

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

      // Easing: easeOutExpo
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * eased);

      element.textContent = current.toLocaleString('tr-TR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Sayaçları bir kez çalıştır
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

      const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        projectType: document.getElementById('projectType').value,
        message: document.getElementById('message').value,
        date: new Date().toISOString()
      };

      if (!formData.fullName || !formData.phone) {
        showFormMessage('Lütfen ad soyad ve telefon alanlarını doldurun.', 'error');
        return;
      }

      // localStorage'a kaydet (Admin paneli)
      saveMessage(formData);

      // EmailJS ile e-posta gönder
      await sendEmailNotification(formData);

      // Tarayıcı bildirimi gönder
      sendBrowserNotification(formData);

      showFormMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
      contactForm.reset();
    });
  }

  // Mesajı localStorage'a kaydet (hem eski hem yeni format)
  function saveMessage(data) {
    // Eski format (uyumluluk)
    let oldMessages = JSON.parse(localStorage.getItem('crystalcabin_messages') || '[]');
    data.id = Date.now();
    data.read = false;
    oldMessages.push(data);
    localStorage.setItem('crystalcabin_messages', JSON.stringify(oldMessages));

    // Yeni format (admin paneli)
    let messages = JSON.parse(localStorage.getItem('cc_messages') || '[]');
    messages.push(data);
    localStorage.setItem('cc_messages', JSON.stringify(messages));
  }

  // EmailJS ile e-posta gönderimi
  async function sendEmailNotification(formData) {
    const settings = JSON.parse(localStorage.getItem('cc_settings') || '{}');
    const { emailjsPublicKey, emailjsServiceId, emailjsTemplateId } = settings;

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.log('EmailJS yapılandırılmamış, e-posta gönderilmedi.');
      return;
    }

    // EmailJS SDK'yı dinamik yükle
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

  // Script dinamik yükleme
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Tarayıcı bildirimi
  function sendBrowserNotification(formData) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('CrystalCabin — Yeni Mesaj', {
        body: `${formData.fullName} — ${formData.phone}\n${formData.message?.substring(0, 80) || 'Yeni teklif talebi'}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">💎</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  // Sayfa yüklendiğinde bildirim izni iste
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 5000);
  }

  // Form mesajı göster
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

  // ─── 10. WHATSAPP BUTONU ───
  function initWhatsApp() {
    const wa = JSON.parse(localStorage.getItem('cc_whatsapp') || '{}');
    if (!wa.enabled || !wa.number) return;

    const btn = document.createElement('a');
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

  initWhatsApp();


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


  // ─── 8. GALERİ — Lightbox Efekti ───
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const overlay = item.querySelector('.gallery-overlay');
      const title = overlay?.querySelector('h4')?.textContent || '';
      const desc = overlay?.querySelector('p')?.textContent || '';

      // Basit bir bilgi gösterimi (ileride gerçek fotoğraflarla lightbox olacak)
      console.log(`Proje: ${title} — ${desc}`);
    });
  });


  // ─── 9. ACTIVE NAV LINK — Scroll Pozisyonuna Göre ───
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
