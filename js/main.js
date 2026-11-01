/* ============================================================
   jū. Specialty Kōhī — Main JavaScript
   Japanese Minimalist Micro-Interactions, Bilingual Engine & Drawer
   ============================================================ */

let currentLang = 'ar';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initLanguageSwitcher();
  initNavbarScroll();
  initMobileDrawer();
  initMenuFilter();
  initStoreStatus();
  initWhatsAppOrder();
  initGalleryLightbox();
  initScrollReveal();
  initLazyVideos();
});

// Lazy load & auto-play reel videos only when scrolled into view
function initLazyVideos() {
  const reelVideos = document.querySelectorAll('.reel-card video');
  if (!reelVideos.length || !('IntersectionObserver' in window)) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target;
      if (entry.isIntersecting) {
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      } else {
        if (!vid.paused) {
          vid.pause();
        }
      }
    });
  }, { threshold: 0.2 });

  reelVideos.forEach(vid => {
    vid.preload = 'none';
    videoObserver.observe(vid);
  });
}

// 1. Splash Preloader — Centered Two-Line Luxury Reveal + Metallic Silver Shine
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const TOTAL_DURATION = 2800;

  let hidden = false;
  const hidePreloader = () => {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 450);
  };

  // Tap to skip on mobile
  preloader.addEventListener('click', hidePreloader, { once: true });
  preloader.addEventListener('touchstart', hidePreloader, { once: true, passive: true });

  setTimeout(hidePreloader, TOTAL_DURATION);
}

// 2. Bilingual Switcher (Arabic RTL <-> English LTR)
function applyLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';

  const htmlEl = document.documentElement;
  htmlEl.setAttribute('lang', currentLang);
  htmlEl.setAttribute('dir', currentLang === 'en' ? 'ltr' : 'rtl');

  document.title = currentLang === 'en'
    ? 'jū. Specialty Kōhī | Japanese Minimalist Specialty Coffee — Dhahran'
    : 'jū. Specialty Kōhī | مقهى جو للقهوة المختصة — الظهران';

  // Translate all elements carrying data-ar and data-en
  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    const val = el.getAttribute(currentLang === 'en' ? 'data-en' : 'data-ar');
    if (val === null) return;
    if (el.getAttribute('data-html') === 'true') {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  // Update toggle button labels (show target language to switch to)
  document.querySelectorAll('.lang-toggle-label').forEach(lbl => {
    lbl.textContent = currentLang === 'en' ? 'عربي' : 'EN';
  });

  // Persist choice safely (works on both http:// and file://)
  try {
    localStorage.setItem('ju_lang', currentLang);
  } catch (_) {
    // Ignore storage restrictions on local file://
  }

  // Refresh live opening hours badge in the active language
  initStoreStatus();
}

function initLanguageSwitcher() {
  let savedLang = 'ar';
  try {
    const stored = localStorage.getItem('ju_lang');
    if (stored === 'en' || stored === 'ar') {
      savedLang = stored;
    }
  } catch (_) {
    savedLang = 'ar';
  }

  if (savedLang !== 'ar') {
    applyLanguage(savedLang);
  }

  document.querySelectorAll('.js-lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  });
}

// 3. Navbar Sticky & Scroll Effects
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 4. Modern Slide-In Mobile Navigation Drawer
function initMobileDrawer() {
  const openBtn = document.getElementById('openDrawer');
  const closeBtn = document.getElementById('closeDrawer');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const links = document.querySelectorAll('.drawer-link');

  if (!openBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// 5. Menu Category Filtering with Smooth Transition
function initMenuFilter() {
  const tabBtns = document.querySelectorAll('.menu-tab-btn');
  const cards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.classList.remove('animate-fade-in');
          void card.offsetWidth; // Trigger reflow
          card.classList.add('animate-fade-in');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 6. Live Opening Hours Status Indicator (Bilingual AR / EN)
function initStoreStatus() {
  const statusEl = document.getElementById('storeLiveStatus');
  if (!statusEl) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let isOpen = false;
  let closeTimeAr = '';
  let closeTimeEn = '';

  // Hours:
  // Sun(0), Mon(1), Tue(2), Wed(3): 5:30 AM (330) to 11:00 PM (1380)
  // Thu(4): 5:30 AM (330) to 1:00 AM (next day, i.e., 60)
  // Fri(5): 12:30 PM (750) to 1:00 AM (next day, i.e., 60)
  // Sat(6): 9:00 AM (540) to 11:00 PM (1380)

  if (day >= 0 && day <= 3) {
    if (currentMinutes >= 330 && currentMinutes < 1380) {
      isOpen = true;
      closeTimeAr = '11:00 مساءً';
      closeTimeEn = '11:00 PM';
    }
  } else if (day === 4) { // Thu
    if (currentMinutes >= 330) {
      isOpen = true;
      closeTimeAr = '1:00 صباحاً';
      closeTimeEn = '1:00 AM';
    }
  } else if (day === 5) { // Fri
    if (currentMinutes < 60 || currentMinutes >= 750) {
      isOpen = true;
      closeTimeAr = '1:00 صباحاً';
      closeTimeEn = '1:00 AM';
    }
  } else if (day === 6) { // Sat
    if (currentMinutes < 60) {
      isOpen = true;
      closeTimeAr = '1:00 صباحاً';
      closeTimeEn = '1:00 AM';
    } else if (currentMinutes >= 540 && currentMinutes < 1380) {
      isOpen = true;
      closeTimeAr = '11:00 مساءً';
      closeTimeEn = '11:00 PM';
    }
  }

  const isEn = currentLang === 'en';

  if (isOpen) {
    const label = isEn
      ? `Open Now · Closes at ${closeTimeEn}`
      : `مفتوح الآن · يغلق عند الساعة ${closeTimeAr}`;
    statusEl.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #2E7D32; display: inline-block;"></span> <span>${label}</span>`;
    statusEl.style.backgroundColor = '#E8F5E9';
    statusEl.style.color = '#2E7D32';
  } else {
    const label = isEn
      ? 'Closed Now · Welcoming you during our next opening hours'
      : 'مغلق الآن · نرحب بكم في ساعات العمل القادمة';
    statusEl.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #C62828; display: inline-block;"></span> <span>${label}</span>`;
    statusEl.style.backgroundColor = '#FFEBEE';
    statusEl.style.color = '#C62828';
  }
}

// 7. WhatsApp Quick Order Dispatcher (Bilingual AR / EN)
function initWhatsAppOrder() {
  const WHATSAPP_PHONE = '966547586822';

  // Architectural Brew Board direct item order
  document.querySelectorAll('.board-item.js-menu-item').forEach(item => {
    const handleOrder = (e) => {
      e.preventDefault();
      const title = currentLang === 'en'
        ? (item.getAttribute('data-title-en') || item.getAttribute('data-title-ar'))
        : (item.getAttribute('data-title-ar') || item.getAttribute('data-title-en'));
      const price = item.getAttribute('data-price') || '';

      const message = currentLang === 'en'
        ? `Hello jū. Specialty Kōhī ☕\nI would like to order:\n- ${title} (${price})\n\nIs it available for pickup now? Thank you!`
        : `مرحباً كافيه jū (Specialty Kōhī) ☕\nأود طلب:\n- ${title} (${price})\n\nهل متاح للاستلام والتجهيز الآن؟ شكراً لكم!`;

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    };

    item.addEventListener('click', handleOrder);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleOrder(e);
      }
    });
  });

  // Item direct order buttons (legacy / fallback support)
  document.querySelectorAll('.btn-order-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.menu-card');
      const title = card ? card.querySelector('.menu-item-title').textContent.trim() : '';
      const price = card ? card.querySelector('.menu-item-price').textContent.trim() : '';

      const message = currentLang === 'en'
        ? `Hello jū. Specialty Kōhī ☕\nI would like to order:\n- ${title} (${price})\n\nIs it available for pickup now? Thank you!`
        : `مرحباً كافيه jū (Specialty Kōhī) ☕\nأود طلب:\n- ${title} (${price})\n\nهل متاح للاستلام الآن؟ شكراً لكم!`;

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  });

  // Catering package book buttons
  document.querySelectorAll('.btn-book-catering').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = currentLang === 'en'
        ? (btn.getAttribute('data-package-en') || 'Catering Package')
        : (btn.getAttribute('data-package') || 'باقة ضيافة');

      const message = currentLang === 'en'
        ? `Hello jū. Team ☕✨\nI would like to inquire and book:\n- ${title}\nfor our upcoming event. Could you please share availability and details? Thank you!`
        : `مرحباً فريق jū ☕✨\nأود الاستفسار وحجز:\n- ${title}\nلمناسبتنا القادمة. أرجو تزويدي بالتفاصيل المتاحة. شكراً لكم!`;

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  });


}

// 8. Fullscreen Editorial Gallery & Official Bean Cards Lightbox + Flip
function initGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const items = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lightboxImg) return;

  const showInLightbox = (src, alt, captionText) => {
    if (!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    if (lightboxCap) {
      lightboxCap.textContent = captionText || '';
    }
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const openLightbox = (item) => {
    const img = item.querySelector('img');
    const capSpan = item.querySelector('.gallery-caption span');
    if (!img) return;
    showInLightbox(
      img.getAttribute('src'),
      img.getAttribute('alt'),
      capSpan ? capSpan.textContent.trim() : ''
    );
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  // Two-sided Official Bean Cards Flip + Zoom on click
  document.querySelectorAll('.bean-flip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = btn.closest('.bean-art-wrap');
      if (!wrap) return;
      const flipped = wrap.classList.toggle('is-flipped');
      const lbl = btn.querySelector('span');
      if (lbl) {
        if (flipped) {
          lbl.setAttribute('data-ar', 'بطاقة الإيحاءات');
          lbl.setAttribute('data-en', 'Tasting Specs');
          lbl.textContent = currentLang === 'en' ? 'Tasting Specs' : 'بطاقة الإيحاءات';
        } else {
          lbl.setAttribute('data-ar', 'قصة المحصول');
          lbl.setAttribute('data-en', 'Story Side');
          lbl.textContent = currentLang === 'en' ? 'Story Side' : 'قصة المحصول';
        }
      }
    });
  });

  document.querySelectorAll('.bean-art-wrap').forEach(wrap => {
    wrap.addEventListener('click', (e) => {
      if (e.target.closest('.bean-flip-btn')) return;
      const isFlipped = wrap.classList.contains('is-flipped');
      const activeImg = isFlipped
        ? (wrap.querySelector('.bean-art-secondary') || wrap.querySelector('.bean-art-primary'))
        : wrap.querySelector('.bean-art-primary');
      const card = wrap.closest('.bean-card');
      const titleEl = card ? card.querySelector('.bean-name') : null;
      if (activeImg) {
        showInLightbox(
          activeImg.getAttribute('src'),
          activeImg.getAttribute('alt'),
          titleEl ? titleEl.textContent.trim() : ''
        );
      }
    });
  });

  const barPhoto = document.querySelector('.beans-bar-photo');
  if (barPhoto) {
    barPhoto.addEventListener('click', () => {
      const img = barPhoto.querySelector('img');
      if (img) {
        showInLightbox(
          img.getAttribute('src'),
          img.getAttribute('alt'),
          currentLang === 'en' ? 'jū. Pour-Over Tasting Cards Bar' : 'بطاقات المحاصيل على بار التقطير في مقهى jū'
        );
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// 9. Scroll Reveal with Calm Zen Timing
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(r => r.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(r => observer.observe(r));
}
