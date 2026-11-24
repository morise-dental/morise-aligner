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
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.01
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-in'));
  }

  // ==========================================
  // 2. TOPへ戻るボタン
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
  // 5. 1週間予約カレンダー（日本時間基準で自動更新）
  // ==========================================
  const RESERVE_URL = 'https://pgawebportal.yoyaku.media/?SecInfo=D5205E151039853368F676DCFFBDC21F';
  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

  const getJstToday = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date()).split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } catch {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  };

  const isBaseJpHoliday = (y, m, d, dow) => {
    const fixed = ['1-1', '2-11', '2-23', '4-29', '5-3', '5-4', '5-5', '8-11', '11-3', '11-23'];
    if (fixed.includes(`${m}-${d}`)) return true;
    if (m === 1 && dow === 1 && d >= 8 && d <= 14) return true;   // 成人の日
    if (m === 7 && dow === 1 && d >= 15 && d <= 21) return true;  // 海の日
    if (m === 9 && dow === 1 && d >= 15 && d <= 21) return true;  // 敬老の日
    if (m === 10 && dow === 1 && d >= 8 && d <= 14) return true;  // スポーツの日
    const shunbun = Math.floor(20.69115 + 0.242194 * (y - 2000) - Math.floor((y - 2000) / 4));
    const shubun = Math.floor(23.09 + 0.242194 * (y - 2000) - Math.floor((y - 2000) / 4));
    if (m === 3 && d === shunbun) return true;
    if (m === 9 && d === shubun) return true;
    return false;
  };

  const isJpHoliday = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dow = date.getDay();
    if (isBaseJpHoliday(y, m, d, dow)) return true;
    // 振替休日（前日以前の日曜祝日）
    if (dow >= 1 && dow <= 3) {
      for (let back = 1; back <= dow; back++) {
        const prev = new Date(y, m - 1, d - back);
        if (!isBaseJpHoliday(prev.getFullYear(), prev.getMonth() + 1, prev.getDate(), prev.getDay())) {
          break;
        }
        if (prev.getDay() === 0) return true;
      }
    }
    return false;
  };

  const wcalWidgets = document.querySelectorAll('[data-wcal]');
  if (wcalWidgets.length) {
    const baseDate = getJstToday();
    wcalWidgets.forEach(widget => {
      const grid = widget.querySelector('.wcal__grid');
      const loc = widget.dataset.loc || 'wcal';
      if (!grid) return;

      const frag = document.createDocumentFragment();
      for (let offset = 0; offset < 7; offset++) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const dow = d.getDay();
        const holiday = isJpHoliday(d);
        const isClosedClinicDay = dow === 0 || dow === 1 || holiday; // 日・月・祝 休診
        const isToday = offset === 0;

        let col;
        if (!isClosedClinicDay && !isToday) {
          col = document.createElement('a');
          col.className = 'wcal__day is-open js-cta';
          col.href = RESERVE_URL;
          col.target = '_blank';
          col.rel = 'noopener';
          col.dataset.cta = 'reserve';
          col.dataset.loc = `${loc}-d${offset}`;
          col.setAttribute('aria-label', `${month}月${day}日（${WEEKDAYS[dow]}）の空き状況をWebで確認する`);
        } else {
          col = document.createElement('div');
          col.className = 'wcal__day is-closed';
          col.setAttribute(
            'aria-label',
            isClosedClinicDay
              ? `${month}月${day}日（${WEEKDAYS[dow]}）休診日`
              : `${month}月${day}日（${WEEKDAYS[dow]}）当日空きなし`
          );
        }

        const dateEl = document.createElement('span');
        dateEl.className = 'wcal__date';
        dateEl.textContent = `${month}/${day}`;

        const dowEl = document.createElement('span');
        dowEl.className = 'wcal__dow';
        if (dow === 6 && !holiday) dowEl.classList.add('is-sat');
        if (dow === 0 || holiday) dowEl.classList.add('is-sun');
        dowEl.textContent = WEEKDAYS[dow];

        const markEl = document.createElement('span');
        markEl.className = 'wcal__mark';
        markEl.textContent = isClosedClinicDay ? '休' : (isToday ? '×' : '○');

        col.append(dateEl, dowEl, markEl);
        frag.appendChild(col);
      }
      grid.innerHTML = '';
      grid.appendChild(frag);
    });
  }

  // ==========================================
  // 6. CTA クリックイベント計測（アナリティクス連携用）
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
