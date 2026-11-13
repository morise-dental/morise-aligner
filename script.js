/**
 * 森瀬歯科医院 LP - スクリプト
 */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');

  // ==========================================
  // 1. スクロールによる要素表示（Reveal）
  // ==========================================
  const revealElements = document.querySelectorAll('.js-reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-in'));
  }

  // ==========================================
  // 2. 数字のカウントアップアニメーション
  // ==========================================
  const countElements = document.querySelectorAll('.js-count');
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetNum = parseInt(el.dataset.to, 10);
          const isComma = el.dataset.format === 'comma';
          const duration = 1200;
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // イージング（easeOutQuart）
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentNum = Math.floor(easeProgress * targetNum);

            el.textContent = isComma ? currentNum.toLocaleString('ja-JP') : currentNum;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = isComma ? targetNum.toLocaleString('ja-JP') : targetNum;
            }
          };

          requestAnimationFrame(updateCount);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    countElements.forEach(el => countObserver.observe(el));
  }

  // ==========================================
  // 3. TOPへ戻るボタン
  // ==========================================
  const toTopBtn = document.getElementById('toTop');
  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        toTopBtn.classList.add('is-show');
      } else {
        toTopBtn.classList.remove('is-show');
      }
    }, { passive: true });
  }

  // ==========================================
  // 4. 画像ライトボックス（症例拡大）
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.js-lightbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const src = btn.dataset.src;
        if (src) {
          lightboxImg.src = src;
          lightbox.hidden = false;
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  // ==========================================
  // 5. CTA クリックイベント計測（アナリティクス連携用）
  // ==========================================
  document.querySelectorAll('.js-cta').forEach(link => {
    link.addEventListener('click', () => {
      const ctaType = link.dataset.cta || 'unknown';
      const loc = link.dataset.loc || 'general';
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          event_category: 'CTA',
          event_label: `${ctaType}_${loc}`
        });
      }
    });
  });
});
