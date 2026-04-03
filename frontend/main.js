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


  // ─── 6. İLETİŞİM FORMU ───
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form verilerini topla
      const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        projectType: document.getElementById('projectType').value,
        message: document.getElementById('message').value,
        date: new Date().toISOString()
      };

      // Basit validasyon
      if (!formData.fullName || !formData.phone) {
        showFormMessage('Lütfen ad soyad ve telefon alanlarını doldurun.', 'error');
        return;
      }

      // localStorage'a kaydet (Admin paneli için hazırlık)
      saveMessage(formData);

      // Başarı mesajı göster
      showFormMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');

      // Formu temizle
      contactForm.reset();
    });
  }

  // Mesajı localStorage'a kaydet
  function saveMessage(data) {
    let messages = JSON.parse(localStorage.getItem('crystalcabin_messages') || '[]');
    data.id = Date.now();
    data.read = false;
    messages.push(data);
    localStorage.setItem('crystalcabin_messages', JSON.stringify(messages));
  }

  // Form mesajı göster
  function showFormMessage(text, type) {
    // Varsa eski mesajı kaldır
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

    // 5 saniye sonra kaldır
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
