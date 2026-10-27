/* ============================================================
   مركز إطلالة — منطق المنظومة
   كل الخوارزميات تعمل داخل المتصفح بلا خادم:
   - البوصلة الذكية: ترتيب الخدمات بالأوزان
   - المساعد: فهم النص العربي بمطابقة الكلمات المفتاحية مع سياق المحادثة
   - فحص الجاهزية: تحديد المحطة المقترحة للبدء
   - الحجز: رسالة واتساب جاهزة من اختياراتك
   ============================================================ */
(function () {
  'use strict';

  /* ---------- أدوات ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const byId = id => SERVICES.find(s => s.id === id);
  const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const ar = n => String(n).replace(/\d/g, d => AR_DIGITS[d]);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* التخزين غير متاح */ } }
  };
  const norm = s => String(s).toLowerCase()
    .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  const ICONS = {
    paper: 'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 16h5',
    shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
    chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
    flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M8 15h8',
    language: 'M4 5h9 M8 3v2 M6 5c1 4 3 6 6 8 M12 5c-1 4-3 6-7 8 M14 21l4-10 4 10 M15.5 18h5',
    scroll: 'M7 4h10a2 2 0 0 1 2 2v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z M9 9h6 M9 13h6',
    cap: 'M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5 M22 9v6',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 5v16 M9 7h6',
    globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
    brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 2V4a3 3 0 0 0-2 0z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5 2V4a3 3 0 0 1 2 0z',
    rocket: 'M12 3c4 2 6 6 5 11l-5 4-5-4c-1-5 1-9 5-11z M12 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M7 15l-3 3 M17 15l3 3 M10 21h4',
    bot: 'M6 8h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M12 4v4 M9 13h.01 M15 13h.01 M9 17h6',
    target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    dashboard: 'M4 4h7v7H4z M13 4h7v4h-7z M13 10h7v10h-7z M4 13h7v7H4z',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z M12 12l8-4.5 M12 12v9 M12 12L4 7.5',
    palette: 'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2-.5-1.2 0-2.5 1.5-2.5H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z M7.5 11h.01 M10 7.5h.01 M14.5 7.5h.01',
    stage: 'M3 9l9-5 9 5 M5 9v10 M19 9v10 M3 19h18 M9 19v-5h6v5',
    heart: 'M12 20s-7-4.5-9-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9 3.5C19 15.5 12 20 12 20z',
    arrow: 'M19 12H5 M11 6l-6 6 6 6',
    back: 'M5 12h14 M13 6l6 6-6 6',
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M15.5 8.5l-2 5-5 2 2-5z',
    chat: 'M4 5h16v11H9l-5 4z',
    send: 'M4 12l16-8-6 16-3-7z',
    close: 'M6 6l12 12 M18 6L6 18',
    menu: 'M4 7h16 M4 12h16 M4 17h16',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',
    moon: 'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z',
    mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
    lock: 'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
    exit: 'M10 4H5v16h5 M15 8l4 4-4 4 M9 12h10',
    wa: 'M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8z M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    window: 'M5 21V11a7 7 0 0 1 14 0v10z M12 4v17 M5 14h14',
    flag: 'M5 21V4 M5 5h12l-2 4 2 4H5',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3 3-5 6-5s6 2 6 5 M17 11a3 3 0 0 0 0-6 M21 19c0-2-1.5-3.5-4-4.2',
    facebook: 'M14 21v-8h3l.5-3.5H14V7.7c0-1 .5-1.7 1.7-1.7h1.8V3.1A21 21 0 0 0 15 3c-2.7 0-4.5 1.6-4.5 4.5v2H7.5V13h3v8z',
    linkedin: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8 10v7 M8 7h.01 M12 10v7 M12 13a3 3 0 0 1 6 0v4',
    tiktok: 'M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5 M14 3c.3 2.6 2 4.2 5 4.4',
    x: 'M4 4l6.5 8.5L4 20h2l5.3-6.1L15.5 20H20l-6.8-9L19.5 4h-2l-4.8 5.5L9 4z'
  };
  /* أيقونات زجاجية: طبقة خلفية متدرجة (بنفسجي ← ذهبي) + طبقة أمامية شفافة بحافة لامعة */
  const NOFILL = new Set(['arrow', 'back', 'close', 'menu', 'exit', 'sun', 'check']);
  const glass = n => { const d = ICONS[n] || ICONS.paper; return `<g class="gb" transform="translate(1.1 1.4)"><path d="${d}"/></g><path class="gf" d="${d}"/>`; };
  const ico = (n, cls = '') => `<svg class="ico ${NOFILL.has(n) ? 'nofill ' : ''}${cls}" viewBox="0 0 24 24" aria-hidden="true">${glass(n)}</svg>`;
  const view = $('#view');

  /* ---------- الحالة ---------- */
  const state = {
    filter: 'all',
    compass: { step: 0, persona: null, goals: new Set(), urgency: null },
    lead: { ids: [], note: '' }
  };
  const visited = {
    list() { return store.get('etl.visited', []).filter(id => byId(id) && !byId(id).care); },
    add(id) {
      const s = byId(id); if (!s || s.care) return; // لا نسجل زيارات صفحة الاستشارات حفاظًا على الخصوصية
      const l = this.list().filter(x => x !== id); l.unshift(id); store.set('etl.visited', l.slice(0, 8));
    }
  };
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }
  function copyText(text, okMsg) {
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove(); toast(ok ? okMsg : 'حدّد النص وانسخه يدويًا');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(okMsg), fallback);
    else fallback();
  }

  /* ---------- مكونات مشتركة ---------- */
  function destCard(s) {
    return `<a class="dest cat-${s.cat}" href="#s-${s.id}">
      ${s.isNew ? '<span class="chip chip-new">جديد</span>' : ''}
      <span class="arch-tile">${ico(s.icon)}</span>
      <span><h3>${s.title}</h3><p>${s.hook}</p><span class="go">ادخل الرحلة ${ico('arrow')}</span></span>
    </a>`;
  }
  function miniCard(s) {
    return `<button class="mini cat-${s.cat}" data-go="s-${s.id}"><span class="arch-tile">${ico(s.icon)}</span><span><b>${s.title}</b><small>${s.hook}</small></span></button>`;
  }
  function destSection(filter) {
    const tabs = [['all', 'كل الوجهات']].concat(Object.entries(CATS).map(([k, v]) => [k, v.n]));
    const list = filter === 'all' ? SERVICES : SERVICES.filter(s => s.cat === filter);
    const sorted = list.slice().sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return `<div class="tabs" role="group" aria-label="تصفية الوجهات">${tabs.map(([k, n]) =>
      `<button data-filter="${k}" aria-pressed="${filter === k}">${k !== 'all' ? `<span class="dot-c cat-${k}"></span>` : ''}${n}</button>`).join('')}</div>
      <div class="dest-grid">${sorted.map(destCard).join('')}</div>`;
  }
  function bindDest(root) {
    $$('[data-filter]', root).forEach(b => b.addEventListener('click', () => {
      state.filter = b.dataset.filter;
      const host = b.closest('.dest-host'); host.innerHTML = destSection(state.filter); bindDest(host);
    }));
  }
  function setLead(ids, note) { state.lead = { ids: ids.slice(), note: note || '' }; }


  /* ---------- رسوم قسم «حكاية إطلالة» ---------- */
  const stopC = (o, v, op) => `<stop offset="${o}" style="stop-color:${v}"${op != null ? ` stop-opacity="${op}"` : ''}/>`;
  function artWindow() {
    const stars = [[110, 86, 2], [250, 70, 1.6], [210, 122, 1.4], [140, 134, 1.6], [290, 152, 1.8], [72, 160, 1.4], [180, 62, 2.2], [235, 100, 1.2]]
      .map(s => `<circle cx="${s[0]}" cy="${s[1]}" r="${s[2]}"/>`).join('');
    return `<svg class="art" viewBox="0 0 360 420" role="img" aria-label="نافذة على شكل قوس تطلّ على أفق ذهبي وطريق يصعد نحوه">
      <defs>
        <linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1">${stopC(0, 'var(--art-sky1)')}${stopC(.6, 'var(--art-sky2)')}${stopC(1, 'var(--art-sky3)')}</linearGradient>
        <radialGradient id="w-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#f5c242"/><stop offset="1" stop-color="#f5c242" stop-opacity="0"/></radialGradient>
        <linearGradient id="w-edge" x1="0" y1="0" x2="1" y2="1">${stopC(0, 'var(--art-f1)')}${stopC(1, 'var(--art-f2)')}</linearGradient>
        <linearGradient id="w-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <clipPath id="w-clip"><path d="M40 400V170a140 140 0 0 1 280 0V400z"/></clipPath>
      </defs>
      <path d="M26 414V170a154 154 0 0 1 308 0V414z" fill="none" stroke="url(#w-edge)" stroke-opacity=".55" stroke-width="2"/>
      <g clip-path="url(#w-clip)">
        <rect width="360" height="420" fill="url(#w-sky)"/>
        <g fill="#fff8dc" style="opacity:var(--art-star)">${stars}</g>
        <circle cx="180" cy="262" r="88" fill="url(#w-sun)"/>
        <circle cx="180" cy="262" r="30" fill="#fbe08a"/>
        <path d="M0 300C70 268 130 292 190 280S310 262 360 288V420H0z" style="fill:var(--art-h1)" opacity=".9"/>
        <path d="M0 340C80 304 150 332 220 314S320 304 360 322V420H0z" style="fill:var(--art-h2)"/>
        <path d="M0 384C90 354 170 376 250 360S330 354 360 370V420H0z" style="fill:var(--art-h3)"/>
        <path d="M150 420C110 384 250 366 205 338S160 318 180 294" fill="none" stroke="#fbe08a" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>
        <path d="M58 120L150 30H208L58 275z" fill="url(#w-sheen)" style="opacity:var(--art-glass)"/>
      </g>
      <path d="M180 30V400M40 170H320" stroke="url(#w-edge)" stroke-opacity=".3" stroke-width="1.5"/>
      <path d="M40 400V170a140 140 0 0 1 280 0V400z" fill="none" stroke="url(#w-edge)" stroke-width="3"/>
    </svg>`;
  }
  function artVision() {
    const xs = [262, 186, 110, 34], hs = [70, 140, 210, 280], base = 310;
    const steps = xs.map((x, i) => `<path d="M${x} ${base}V${base - hs[i] + 31}a31 31 0 0 1 62 0V${base}z" fill="url(#v-step)" stroke="url(#v-edge)" stroke-width="1.8"/>
      <path d="M${x + 9} ${base - 6}V${base - hs[i] + 34}" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round" fill="none"/>`).join('');
    return `<svg class="art" viewBox="0 -56 360 396" role="img" aria-label="أربع درجات على شكل أقواس تصعد نحو نجمة ذهبية">
      <defs>
        <linearGradient id="v-step" x1="0" y1="0" x2="0" y2="1">${stopC(0, 'var(--gb1)', .8)}${stopC(1, 'var(--gb1)', .12)}</linearGradient>
        <linearGradient id="v-edge" x1="0" y1="0" x2="1" y2="1">${stopC(0, 'var(--art-f1)')}${stopC(1, 'var(--art-f2)')}</linearGradient>
        <radialGradient id="v-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f5c242" stop-opacity=".75"/><stop offset="1" stop-color="#f5c242" stop-opacity="0"/></radialGradient>
        <linearGradient id="v-star" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#e9b033"/></linearGradient>
      </defs>
      <path d="M18 ${base}H342" stroke="url(#v-edge)" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      ${steps}
      <path d="M293 232L217 162L141 92L77 34" fill="none" stroke="url(#v-edge)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 9"/>
      <circle cx="65" cy="2" r="50" fill="url(#v-glow)"/>
      <polygon transform="translate(65 2) scale(1.25)" points="0,-16 4.7,-6.5 15.2,-4.9 7.6,2.5 9.4,12.9 0,8 -9.4,12.9 -7.6,2.5 -15.2,-4.9 -4.7,-6.5" fill="url(#v-star)" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
    </svg>`;
  }
  function artMission() {
    const items = [['research', 'paper', 'بحث'], ['learning', 'cap', 'تعلّم'], ['ai', 'bot', 'ذكاء'], ['business', 'chart', 'أعمال'], ['creative', 'palette', 'إبداع'], ['care', 'heart', 'أسرة']];
    const cx = 180, cy = 190, R = 118;
    const nodes = items.map((it, i) => {
      const a = (-90 + i * 60) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="url(#m-edge)" stroke-opacity=".5" stroke-width="1.5"/>
        <g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="27" fill="url(#m-node)" stroke="url(#m-edge)" stroke-width="1.6"/>
        <g transform="translate(${(x - 12).toFixed(1)} ${(y - 12).toFixed(1)})">${glass(it[1])}</g>
        <text x="${x.toFixed(1)}" y="${(y + 46).toFixed(1)}">${it[2]}</text></g>`;
    }).join('');
    return `<svg class="art" viewBox="0 0 360 390" role="img" aria-label="ستة مسارات تلتف حول بوصلة في المركز">
      <defs>
        <linearGradient id="m-edge" x1="0" y1="0" x2="1" y2="1">${stopC(0, 'var(--art-f1)')}${stopC(1, 'var(--art-f2)')}</linearGradient>
        <linearGradient id="m-node" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/>${stopC(1, 'var(--gb1)', .32)}</linearGradient>
        <radialGradient id="m-core" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset="1" stop-color="#e9b033" stop-opacity=".75"/></radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="url(#m-edge)" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="2 8" stroke-linecap="round"/>
      ${nodes}
      <circle cx="${cx}" cy="${cy}" r="44" fill="url(#m-core)" stroke="url(#m-edge)" stroke-width="2"/>
      <g class="cg" transform="translate(${cx - 24} ${cy - 24}) scale(2)">${glass('compass')}</g>
    </svg>`;
  }
  const chapHead = (icon, title) => `<div class="chap-title"><span class="chap-ico">${ico(icon)}</span><h3>${title}</h3></div>`;
  function aboutSection(asPage) {
    const nStages = SERVICES.reduce((a, s) => a + (s.stages ? s.stages.length : 0), 0);
    const vals = [
      ['shield', 'الأمانة العلمية', 'نلتزم بمعايير النشر والتحكيم، ونحافظ على أصالة كل عمل نقدّمه.'],
      ['target', 'الدقة', 'أدوات محكّمة، وتحليل مدروس، ونتائج يمكنك الدفاع عنها.'],
      ['lock', 'الخصوصية', 'ملفاتك وبياناتك وقضاياك الأسرية بين يديك وفريقنا المختص فقط.'],
      ['rocket', 'الابتكار', 'نستعين بالذكاء الاصطناعي والتصميم لنقدّم عملًا أوضح وأسرع.']
    ];
    const H = asPage ? 'h1' : 'h2';
    return `<section class="blk about" id="about" aria-labelledby="abH">
      <div class="sec-head"><${H} id="abH"${asPage ? ' style="font-size:clamp(1.9rem,4vw,3rem)"' : ''}>حكاية إطلالة</${H}><p>من نحن، وإلى أين نتجه، وكيف نرافقك في الطريق.</p></div>

      <article class="chap">
        <div class="chap-art">${artWindow()}</div>
        <div class="chap-txt">
          ${chapHead('window', 'مقدمة')}
          <p class="statement">الإطلالة أن ترى الطريق كاملًا قبل أن تخطو فيه.</p>
          <p>من هذه الفكرة جاء اسم مركز إطلالة للدراسات والبحوث. نجمع في مكان واحد خدمات البحث العلمي والنشر الدولي، والتدقيق اللغوي والترجمة، والتحليل الإحصائي، والتعلّم الرقمي والذكاء الاصطناعي، والدراسات الاقتصادية، والتصميم والتسويق، إلى جانب الإرشاد الأسري والنفسي.</p>
          <p>تديره المديرة التنفيذية ${CENTER.director}، ويعمل فيه متخصصون يرافقونك من أول فكرة حتى النتيجة.</p>
        </div>
      </article>

      <article class="chap rev">
        <div class="chap-art">${artVision()}</div>
        <div class="chap-txt">
          ${chapHead('eye', 'رؤيتنا')}
          <p class="statement">أن نكون الوجهة التي يثق بها الباحث والطالب والمؤسسة والأسرة ليجدوا طريقهم من الفكرة إلى الأثر.</p>
          <p>نطمح إلى منظومة عربية تجمع الأمانة العلمية والتقنية الحديثة والبعد الإنساني، وتسهم في بناء المعرفة ودعم التحول الرقمي ومواكبة رؤى التنمية في المنطقة.</p>
        </div>
      </article>

      <article class="chap">
        <div class="chap-art">${artMission()}</div>
        <div class="chap-txt">
          ${chapHead('flag', 'رسالتنا')}
          <p class="statement">نرافقك في رحلة كاملة: نفهم حاجتك، ونرسم لك المسار الأنسب، وننفّذ بدقة وأمانة، ثم نبني قدرتك لتواصل بنفسك.</p>
          <ul class="pledges">
            <li>${ico('check')}<span>نبدأ من حاجتك أنت، لا من خدمة جاهزة.</span></li>
            <li>${ico('check')}<span>نلتزم بالأمانة العلمية وبمعايير النشر والتحكيم.</span></li>
            <li>${ico('check')}<span>نحمي خصوصيتك، خاصةً في الاستشارات الأسرية والنفسية.</span></li>
          </ul>
        </div>
      </article>

      <div class="vals">${vals.map(v => `<div class="val"><span class="chap-ico">${ico(v[0])}</span><h3>${v[1]}</h3><p>${v[2]}</p></div>`).join('')}</div>

      <div class="stats" aria-label="إطلالة بالأرقام">
        <div class="stat"><b>${ar(SERVICES.length)}</b><span>وجهة خدمية</span></div>
        <div class="stat"><b>${ar(Object.keys(CATS).length)}</b><span>مسارات رئيسية</span></div>
        <div class="stat"><b>${ar(nStages)}</b><span>محطة في رحلات الخدمات</span></div>
      </div>
    </section>`;
  }
  function renderAbout() {
    view.innerHTML = `<div class="wrap">${aboutSection(true)}
      <section class="blk" style="padding-top:0"><div class="cta-band"><h2>جاهز لتبدأ رحلتك؟</h2><p>اختر وجهتك أو دع البوصلة تقترح عليك المسار الأنسب.</p><div class="hero-cta" style="justify-content:center;margin:0"><a class="btn btn-gold" href="#compass">${ico('compass')} ابدأ البوصلة</a><a class="btn btn-line" href="#services">تصفّح الوجهات</a></div></div></section></div>`;
  }

  /* ---------- تواصل معنا (آخر كل صفحة) ---------- */
  function renderContact() {
    $('#contact').innerHTML = `<div class="contact-card">
      <span class="chap-ico">${ico('chat')}</span>
      <h2 id="ctH">تواصل معنا</h2>
      <p>اختر الطريقة الأنسب لك: رسالة على واتساب، أو مكالمة، أو تابعنا على منصاتنا لتعرف جديد المركز.</p>
      <div class="ct-main">
        <a class="btn btn-gold" href="https://wa.me/${CENTER.phoneWa}" target="_blank" rel="noopener noreferrer">${ico('wa')} راسلنا على واتساب</a>
        <a class="btn btn-line" href="tel:+${CENTER.phoneWa}">${ico('phone')} <span class="ltr">${CENTER.phoneDisplay}</span></a>
        <a class="btn btn-line" href="mailto:${CENTER.email}">${ico('mail')} <span class="ltr">${CENTER.email}</span></a>
      </div>
      <ul class="soc">${CENTER.social.map(s => `<li><a class="soc-a" href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.n}: ${s.h}"><span class="chap-ico">${ico(s.id)}</span><span><b>${s.n}</b><small dir="auto">${s.h}</small></span></a></li>`).join('')}</ul>
    </div>`;
  }

  /* ---------- الرئيسية ---------- */
  function renderHome() {
    const vis = visited.list();
    let cont = '';
    if (vis.length) {
      const last = byId(vis[0]);
      const suggest = (last.next || []).filter(id => !vis.includes(id)).slice(0, 2).map(byId);
      cont = `<div class="cont"><b>تابع رحلتك:</b>${vis.slice(0, 3).map(id => `<a class="chip" href="#s-${id}">${byId(id).title}</a>`).join('')}
        ${suggest.length ? `<span class="hint">وبعدها قد تحتاج:</span>${suggest.map(s => `<a class="chip" href="#s-${s.id}">${s.title}</a>`).join('')}` : ''}</div>`;
    }
    const care = byId('counseling');
    view.innerHTML = `<div class="wrap">
      <section class="hero">
        <div>
          <h1>اختر وجهتك،<br>ونحن نرسم الطريق إليها.</h1>
          <p class="lead">${CENTER.name}: ${ar(SERVICES.length)} وجهات في البحث والتعلّم والذكاء الاصطناعي والأعمال والتصميم، وخدمة جديدة للاستشارات الأسرية والنفسية. أجب عن أسئلة قصيرة ونرشّح لك المسار الأنسب.</p>
          <div class="hero-cta">
            <a class="btn btn-gold" href="#compass">${ico('compass')} ابدأ مع البوصلة الذكية</a>
            <a class="btn btn-line" href="#services">تصفّح الوجهات</a>
          </div>
          <div class="who"><h2>من أنت؟ اختر لنبدأ من حيث أنت.</h2>
            <div class="who-row">${PERSONAS.map(p => `<button data-persona="${p.id}">${p.n}</button>`).join('')}</div></div>
          ${cont}
        </div>
        <div class="window" aria-hidden="true"><div class="a1"></div><div class="a2"></div><div class="a3"><img src="logo-full.png" alt=""></div><div class="orbit"><i></i><i></i><i></i></div></div>
      </section>

      ${aboutSection(false)}

      <section class="blk" id="dest"><div class="sec-head"><h2>الوجهات</h2><p>لكل وجهة صفحة مفصلة برحلتها ومراحلها وما ستحصل عليه، ويمكنك أن تحدد من أي محطة تبدأ.</p></div>
        <div class="dest-host">${destSection(state.filter)}</div></section>

      <section class="blk"><div class="sec-head"><h2>كيف تسير رحلتك معنا</h2><p>أربع خطوات، وأنت تقرر متى تتوقف.</p></div>
        <div class="steps">
          <div class="step"><h3>تحدّث إلى البوصلة</h3><p>اختر من أنت وما تريده. لا حاجة لمعرفة اسم الخدمة.</p></div>
          <div class="step"><h3>نرشّح لك مسارًا</h3><p>تظهر لك الخدمات الأنسب مرتبةً بحسب ما اخترت، مع سبب كل ترشيح.</p></div>
          <div class="step"><h3>تحجز برسالة جاهزة</h3><p>تُبنى رسالة واتساب من اختياراتك، فلا تبدأ من الصفر.</p></div>
          <div class="step"><h3>يبدأ المتخصص عمله</h3><p>يتواصل معك فريق المركز ويحدد معك التفاصيل والمواعيد.</p></div>
        </div></section>

      <section class="blk">
        <div class="spot cat-care">
          <div>
            <span class="chip chip-new">خدمة جديدة</span>
            <h2>${care.title}</h2>
            <p>${care.intro}</p>
            <div class="tags">${care.modules.slice(0, 5).map(m => `<span class="chip">${m[0]}</span>`).join('')}</div>
            <div class="hero-cta"><a class="btn btn-gold" href="#s-counseling">اعرف كيف تسير الجلسات</a></div>
          </div>
          <div class="spot-note"><b>خصوصية أولًا.</b> يمكنك أن تكتب في رسالتك الأولى نوع الموضوع فقط. لا حاجة لذكر تفاصيل حساسة قبل أن تتحدث مع المختص. وهذه الخدمة لا تغني عن الطوارئ عند وجود خطر فوري.</div>
        </div>
        <div class="pair">
          ${['ai-academy', 'kids-ai'].map(id => { const s = byId(id); return `<div class="panel cat-${s.cat}"><span class="arch-tile">${ico(s.icon)}</span><h3>${s.title}</h3><p>${s.hook}</p><div><a class="btn btn-line btn-sm" href="#s-${s.id}">استكشف ${ico('arrow')}</a></div></div>`; }).join('')}
        </div>
      </section>

      <section class="blk"><div class="cta-band"><h2>لا تعرف من أين تبدأ؟</h2><p>ثلاثة أسئلة قصيرة تكفي لنرشّح لك الخدمات ونرتّبها في رحلة واحدة.</p><a class="btn btn-gold" href="#compass">${ico('compass')} ابدأ البوصلة</a></div></section>
    </div>`;
    bindDest(view);
    $$('[data-persona]', view).forEach(b => b.addEventListener('click', () => {
      state.compass = { step: 1, persona: b.dataset.persona, goals: new Set(), urgency: null };
      location.hash = '#compass';
    }));
  }

  function renderServices() {
    view.innerHTML = `<div class="wrap"><section class="blk"><div class="sec-head"><h1 style="font-size:clamp(1.9rem,4vw,3rem)">كل الوجهات</h1><p>اختر الوجهة لتفتح رحلتها. أو دع البوصلة تختار معك.</p></div>
      <div class="dest-host">${destSection(state.filter)}</div>
      <div style="margin-top:34px"><a class="btn btn-line" href="#compass">${ico('compass')} ساعدني في الاختيار</a></div></section></div>`;
    bindDest(view);
  }

  /* ---------- صفحة الخدمة ---------- */
  function renderService(id) {
    const s = byId(id); if (!s) { location.hash = '#home'; return; }
    visited.add(id);
    const checks = s.check ? s.check.map(() => false) : null;
    const startIdx = () => { if (!checks) return 0; const i = checks.indexOf(false); return i === -1 ? s.stages.length - 1 : Math.min(i, s.stages.length - 1); };
    const next = (s.next || []).map(byId).filter(Boolean);
    view.innerHTML = `<div class="wrap cat-${s.cat}">
      <button class="back" data-route="home">${ico('back')} كل الوجهات</button>
      <section class="s-hero">
        <div>
          <span class="chip"><span class="dot-c"></span>${CATS[s.cat].n}</span> ${s.isNew ? '<span class="chip chip-new">جديد</span>' : ''}
          <h1>${s.title}</h1>
          <p class="hook">${s.hook}</p>
          <p class="intro">${s.intro}</p>
          <div class="who-list">${s.who.map(w => `<span class="chip">${w}</span>`).join('')}</div>
          <div class="acts">
            <button class="btn btn-gold" id="bookTop">${s.care ? 'احجز جلسة' : 'احجز استشارة'} ${ico('arrow')}</button>
            ${checks ? '<a class="btn btn-line" href="#journey-start" id="toCheck">من أين أبدأ؟</a>' : ''}
          </div>
        </div>
        <div class="s-arch" aria-hidden="true"><div>${ico(s.icon)}</div></div>
      </section>

      ${s.care ? `<section class="blk" style="padding-top:0"><div class="safety">${s.safety.map(x => `<div class="safe"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div></section>` : ''}

      <section class="blk" id="journey-start" style="padding-top:${s.care ? 24 : 12}px"><div class="sec-head"><h2>رحلتك داخل هذه الخدمة</h2><p>${ar(s.stages.length)} محطات. اضغط على أي محطة لتقرأ ما يحدث فيها${checks ? '، وعلّم ما لديك لنقترح عليك نقطة البداية' : ''}.</p></div>
        <div class="journey">
          <ol class="tl" id="tl">${s.stages.map((st, i) => `<li class="st" data-i="${i}" data-open="${i === 0}">
            <span class="node">${ar(i + 1)}</span>
            <button class="st-btn" aria-expanded="${i === 0}"><h3>${st[0]} <span class="here" hidden>ابدأ من هنا</span></h3><span class="body">${st[1]}</span></button></li>`).join('')}</ol>
          ${checks ? `<aside class="check" aria-labelledby="ckh"><h3 id="ckh">فحص الجاهزية</h3><p class="sub">علّم ما أنجزته من قبل.</p>
            ${s.check.map((c, i) => `<label class="ck"><input type="checkbox" data-ck="${i}" id="ck-${i}"><span>${c}</span></label>`).join('')}
            <div class="res" id="ckres" aria-live="polite"></div>
            <button class="btn btn-gold btn-sm" id="ckBook">احجز بدءًا من هذه المحطة</button></aside>` : ''}
        </div></section>

      <section class="blk" style="padding-top:12px"><div class="sec-head"><h2>${s.care ? 'ما الذي يشغلك؟' : 'ما الذي تجده هنا'}</h2><p>${s.care ? 'اختر المسار الأقرب لحالتك، ويمكن للمختص أن يوجّهك لغيره بعد الجلسة الأولى.' : 'تفاصيل ما تشمله الخدمة.'}</p></div>
        <div class="mods">${s.modules.map(m => `<div class="mod"><h3>${m[0]}</h3><p>${m[1]}</p></div>`).join('')}</div></section>

      <section class="blk" style="padding-top:12px"><div class="two">
        <div class="panel"><h3>ما الذي تحصل عليه</h3><ul class="list">${s.outputs.map(o => `<li>${o}</li>`).join('')}</ul></div>
        ${s.tools && s.tools.length ? `<div class="panel"><h3>الأدوات والمعايير</h3><div class="tools">${s.tools.map(t => `<span class="tool">${t}</span>`).join('')}</div></div>`
          : `<div class="panel"><h3>لمن هذه الخدمة</h3><ul class="list">${s.who.map(w => `<li>${w}</li>`).join('')}</ul></div>`}
      </div></section>

      <section class="blk" style="padding-top:12px"><div class="sec-head"><h2>أسئلة شائعة</h2></div>
        ${s.faq.map(f => `<details class="q-a"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</section>

      ${next.length ? `<section class="blk" style="padding-top:12px"><div class="sec-head"><h2>وجهات قد تحتاجها بعد ذلك</h2></div><div class="next-grid">${next.map(destCard).join('')}</div></section>` : ''}

      <section class="blk"><div class="cta-band"><h2>${s.care ? 'ابدأ بخطوة صغيرة' : 'جاهز لتبدأ هذه الرحلة؟'}</h2><p>${s.care ? 'أرسل لنا نوع الموضوع فقط، وسنرتّب معك موعدًا مع المختص المناسب.' : 'نجهّز لك رسالة واتساب باسم الخدمة، وتضيف عليها ما تريد.'}</p><button class="btn btn-gold" id="bookEnd">${s.care ? 'احجز جلسة' : 'احجز استشارة'}</button></div></section>
    </div>`;

    const tl = $('#tl');
    const openStage = i => $$('.st', tl).forEach(el => {
      const o = +el.dataset.i === i; el.dataset.open = o; $('.st-btn', el).setAttribute('aria-expanded', o);
    });
    $$('.st-btn', tl).forEach(b => b.addEventListener('click', () => openStage(+b.closest('.st').dataset.i)));
    const update = () => {
      if (!checks) return;
      const i = startIdx();
      $$('.here', tl).forEach((h, k) => { h.hidden = !(checks.some(Boolean) && k === i); });
      if (checks.some(Boolean)) openStage(i);
      $('#ckres').innerHTML = checks.some(Boolean)
        ? `نقترح أن تبدأ من <b>المحطة ${ar(i + 1)}: ${s.stages[i][0]}</b>.`
        : 'علّم ما لديك وسنحدد لك المحطة المناسبة للبداية.';
    };
    $$('[data-ck]', view).forEach(c => c.addEventListener('change', () => { checks[+c.dataset.ck] = c.checked; update(); }));
    update();
    const go = () => {
      const i = startIdx();
      const note = checks && checks.some(Boolean) ? `أرغب في البدء من مرحلة «${s.stages[i][0]}».` : '';
      setLead([id], note); location.hash = '#book';
    };
    $('#bookTop').addEventListener('click', go); $('#bookEnd').addEventListener('click', go);
    const ckBook = $('#ckBook'); if (ckBook) ckBook.addEventListener('click', go);
    const tc = $('#toCheck'); if (tc) tc.addEventListener('click', e => { e.preventDefault(); $('#journey-start').scrollIntoView({ behavior: 'smooth' }); });
  }

  /* ---------- البوصلة الذكية ---------- */
  function rankServices(persona, goals) {
    const out = [];
    SERVICES.forEach(s => {
      const hit = s.goals.filter(g => goals.has(g));
      if (!hit.length) return;
      out.push({ s, hit, score: hit.length * 3 + (s.personas.includes(persona) ? 1.5 : 0) });
    });
    out.sort((a, b) => b.score - a.score || a.s.order - b.s.order);
    return out;
  }
  function renderCompass() {
    const c = state.compass;
    const prog = `<div class="prog" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i <= c.step ? 'on' : ''}"></i>`).join('')}</div>`;
    let body = '';
    if (c.step === 0) {
      body = `<div class="q"><h1>من أنت؟</h1><p class="sub">نبدأ من موقعك لنعرض لك الأقرب إليك أولًا.</p>
        <div class="opts">${PERSONAS.map(p => `<button class="opt" data-pick="${p.id}" aria-pressed="${c.persona === p.id}"><strong>${p.n}</strong><small>${p.s}</small></button>`).join('')}</div></div>`;
    } else if (c.step === 1) {
      const rel = GOALS.filter(g => g.p.includes(c.persona)), oth = GOALS.filter(g => !g.p.includes(c.persona));
      const opt = (g, dim) => `<button class="opt${dim ? ' dim' : ''}" data-goal="${g.id}" aria-pressed="${c.goals.has(g.id)}"><strong>${g.n}</strong></button>`;
      body = `<div class="q"><h2>ما الذي تريده؟</h2><p class="sub">اختر واحدًا أو أكثر.</p>
        <div class="opts">${rel.map(g => opt(g, false)).join('')}</div>
        <p class="sub" style="margin-top:26px">أمور أخرى قد تهمك</p>
        <div class="opts">${oth.map(g => opt(g, true)).join('')}</div>
        <div class="q-actions"><button class="btn btn-line" data-back>رجوع</button><button class="btn btn-gold" data-next ${c.goals.size ? '' : 'disabled'}>التالي ${ico('arrow')}</button></div></div>`;
    } else if (c.step === 2) {
      const U = [['explore', 'أستكشف فقط', 'أريد أن أفهم الخيارات'], ['ready', 'لدي مسودة أو بيانات', 'أريد أن أتقدم في عمل بدأته'], ['urgent', 'لدي موعد قريب', 'تسليم أو امتحان أو إطلاق']];
      body = `<div class="q"><h2>أين أنت من الرحلة؟</h2><p class="sub">لنعرف كم من الوقت لديك.</p>
        <div class="opts">${U.map(u => `<button class="opt" data-urg="${u[0]}" aria-pressed="${c.urgency === u[0]}"><strong>${u[1]}</strong><small>${u[2]}</small></button>`).join('')}</div>
        <div class="q-actions"><button class="btn btn-line" data-back>رجوع</button></div></div>`;
    } else {
      const ranked = rankServices(c.persona, c.goals);
      const top = ranked.slice(0, 4), max = top.length ? top[0].score : 1;
      const gname = id => GOALS.find(g => g.id === id).n;
      const hasCare = top.some(r => r.s.care);
      const path = top.map(r => r.s).sort((a, b) => a.order - b.order);
      const persona = PERSONAS.find(p => p.id === c.persona);
      const ctxNote = `أنا: ${persona.n}. ما أبحث عنه: ${Array.from(c.goals).map(g => gname(g)).join('، ')}.` + (c.urgency === 'urgent' ? ' لدي موعد قريب.' : '');
      body = `<div class="q"><h2>رحلتك المقترحة</h2><p class="sub">رتّبنا الخدمات بحسب ما اخترت. الترتيب مبني على عدد اختياراتك التي تغطيها كل خدمة وقربها من حالتك.</p>
        <div class="rank">${top.map((r, i) => `<div class="rank-item cat-${r.s.cat}${i === 0 ? ' first' : ''}">
          <span class="arch-tile">${ico(r.s.icon)}</span>
          <div><span class="fit">${i === 0 ? 'الأنسب لك' : (r.score >= max * 0.7 ? 'مناسب جدًا' : 'قد يفيدك')}</span><h3>${r.s.title}</h3>
          <p class="why">لأنك اخترت: ${r.hit.map(gname).join(' و')}</p></div>
          <a class="btn btn-line btn-sm" href="#s-${r.s.id}">افتح الرحلة</a></div>`).join('')}</div>
        ${path.length > 1 ? `<div class="path"><h3>الترتيب المقترح لتنفيذها</h3><ol>${path.map(s => `<li>${s.title}</li>`).join('')}</ol></div>` : ''}
        ${c.urgency === 'urgent' ? '<div class="note">لديك موعد قريب: اذكر التاريخ في رسالة الحجز لنعطيه الأولوية في الجدولة.</div>' : ''}
        ${hasCare ? '<div class="note">اختياراتك تتعلق بالصحة النفسية أو الأسرية. لن نحفظ هذه الإجابات في أي مكان خارج هذه الصفحة. وإن كنت في خطر فوري فتواصل الآن مع خدمات الطوارئ في بلدك.</div>' : ''}
        <div class="q-actions"><button class="btn btn-gold" id="cBook">احجز بهذه الاختيارات ${ico('arrow')}</button><button class="btn btn-line" data-restart>ابدأ من جديد</button></div></div>`;
      view.dataset.ctx = ctxNote; view.dataset.ids = top.map(r => r.s.id).join(',');
    }
    view.innerHTML = `<div class="compass wrap">${prog}${body}</div>`;
    $$('[data-pick]', view).forEach(b => b.addEventListener('click', () => { c.persona = b.dataset.pick; c.step = 1; renderCompass(); window.scrollTo({ top: 0 }); }));
    $$('[data-goal]', view).forEach(b => b.addEventListener('click', () => {
      const g = b.dataset.goal; c.goals.has(g) ? c.goals.delete(g) : c.goals.add(g);
      b.setAttribute('aria-pressed', c.goals.has(g)); $('[data-next]', view).disabled = !c.goals.size;
    }));
    const nx = $('[data-next]', view); if (nx) nx.addEventListener('click', () => { c.step = 2; renderCompass(); window.scrollTo({ top: 0 }); });
    $$('[data-urg]', view).forEach(b => b.addEventListener('click', () => { c.urgency = b.dataset.urg; c.step = 3; renderCompass(); window.scrollTo({ top: 0 }); }));
    const bk = $('[data-back]', view); if (bk) bk.addEventListener('click', () => { c.step = Math.max(0, c.step - 1); renderCompass(); });
    const rs = $('[data-restart]', view); if (rs) rs.addEventListener('click', () => { state.compass = { step: 0, persona: null, goals: new Set(), urgency: null }; renderCompass(); window.scrollTo({ top: 0 }); });
    const cb = $('#cBook'); if (cb) cb.addEventListener('click', () => { setLead(view.dataset.ids.split(','), view.dataset.ctx); location.hash = '#book'; });
  }

  /* ---------- الحجز ---------- */
  function renderBook() {
    const ids = state.lead.ids.slice();
    view.innerHTML = `<div class="wrap book">
      <div>
        <h1>احجز استشارتك</h1>
        <p class="hint" style="font-size:1rem;color:var(--fg-2)">املأ الحقول وسنجهّز لك رسالة واتساب. لا يصل إلينا شيء حتى تضغط إرسال داخل واتساب.</p>
        <form class="form" id="bf" novalidate>
          <div class="fld"><label for="bName">الاسم</label><input class="inp" id="bName" autocomplete="name" placeholder="اسمك الكريم"><div class="err" id="bErr"></div></div>
          <div class="fld"><label for="bAdd">الخدمات المطلوبة</label>
            <div class="sel-chips" id="bChips" aria-live="polite"></div>
            <select class="inp" id="bAdd"><option value="">أضف خدمة…</option>${Object.entries(CATS).map(([k, v]) => `<optgroup label="${v.n}">${SERVICES.filter(s => s.cat === k).map(s => `<option value="${s.id}">${s.title}</option>`).join('')}</optgroup>`).join('')}</select>
            <div class="hint" id="bHint"></div></div>
          <div class="fld"><label for="bTime">وقت التواصل المناسب</label><select class="inp" id="bTime"><option>في أي وقت</option><option>صباحًا</option><option>مساءً</option></select></div>
          <div class="fld"><label class="ck" for="bUrg" style="padding:0;font-weight:500"><input type="checkbox" id="bUrg" style="--c:var(--accent)"><span>الأمر عاجل ولدي موعد قريب</span></label></div>
          <div class="fld"><label for="bMsg">ما الذي تريد أن نعرفه؟</label><textarea class="inp" id="bMsg" placeholder="اكتب بإيجاز ما تحتاجه">${state.lead.note ? state.lead.note + '\n' : ''}</textarea></div>
          <div class="fld"><label>الرسالة التي سيفتحها واتساب</label><div class="mini ltr-off" id="bPrev" style="display:block;white-space:pre-wrap;line-height:1.9;padding:14px 16px;border-radius:14px"></div></div>
          <div class="hero-cta" style="margin:0"><a class="btn btn-gold" id="bWa" target="_blank" rel="noopener" href="#book">${ico('wa')} افتح واتساب بالرسالة</a><button type="button" class="btn btn-line" id="bCopy">انسخ الرسالة</button></div>
          <p class="hint">إن لم يفتح واتساب على جهازك، انسخ الرسالة وأرسلها إلى الرقم المعروض بجانب النموذج.</p>
        </form>
      </div>
      <aside class="card-info"><h2>تواصل مباشر</h2>
        <div class="ci">${ico('user')}<div><small>${CENTER.role}</small><strong>${CENTER.director}</strong></div></div>
        <div class="ci">${ico('phone')}<div><small>واتساب / هاتف</small><strong class="ltr">${CENTER.phoneDisplay}</strong></div><button class="copy" data-cp="${CENTER.phoneDisplay}">نسخ</button></div>
        <div class="ci">${ico('mail')}<div><small>البريد الإلكتروني</small><strong class="ltr">${CENTER.email}</strong></div><button class="copy" data-cp="${CENTER.email}">نسخ</button></div>
        <div class="ci">${ico('chat')}<div><small>فيسبوك</small><strong>${CENTER.facebook}</strong></div></div>
      </aside></div>`;
    const chips = $('#bChips'), prev = $('#bPrev'), wa = $('#bWa');
    const msgText = () => {
      const name = $('#bName').value.trim();
      const titles = ids.map(i => byId(i).title);
      const lines = [`السلام عليكم، أنا ${name || '[اكتب اسمك]'}.`, `أرغب في الاستفسار عن: ${titles.length ? titles.join('، ') : '[اختر الخدمة]'}.`];
      const m = $('#bMsg').value.trim(); if (m) lines.push(m);
      if ($('#bUrg').checked) lines.push('الأمر عاجل ولدي موعد قريب.');
      lines.push(`وقت التواصل المناسب: ${$('#bTime').value}.`);
      return lines.join('\n');
    };
    const draw = () => {
      chips.innerHTML = ids.length ? ids.map(i => `<span class="chip cat-${byId(i).cat}"><span class="dot-c"></span>${byId(i).title}<button type="button" data-rm="${i}" aria-label="إزالة ${byId(i).title}">×</button></span>`).join('') : '<span class="hint">لم تختر خدمة بعد.</span>';
      $$('[data-rm]', chips).forEach(b => b.addEventListener('click', () => { ids.splice(ids.indexOf(b.dataset.rm), 1); state.lead.ids = ids.slice(); draw(); }));
      $('#bHint').textContent = ids.includes('counseling') ? 'للاستشارات الأسرية والنفسية: يكفي أن تذكر نوع الموضوع، ولا تكتب تفاصيل حساسة في الرسالة الأولى.' : '';
      const t = msgText(); prev.textContent = t;
      wa.href = `https://wa.me/${CENTER.phoneWa}?text=${encodeURIComponent(t)}`;
    };
    $('#bAdd').addEventListener('change', e => { const v = e.target.value; if (v && !ids.includes(v)) ids.push(v); state.lead.ids = ids.slice(); e.target.value = ''; draw(); });
    ['bName', 'bMsg', 'bUrg', 'bTime'].forEach(i => $('#' + i).addEventListener('input', draw));
    wa.addEventListener('click', e => {
      if (!$('#bName').value.trim()) { e.preventDefault(); $('#bErr').textContent = 'اكتب اسمك قبل فتح واتساب.'; $('#bName').focus(); }
      else $('#bErr').textContent = '';
    });
    $('#bCopy').addEventListener('click', () => copyText(msgText(), 'تم نسخ الرسالة'));
    $$('[data-cp]', view).forEach(b => b.addEventListener('click', () => copyText(b.dataset.cp, 'تم النسخ')));
    draw();
  }

  /* ---------- المسار والتنقل ---------- */
  function route() {
    const h = (location.hash || '#home').slice(1);
    const exit = $('#exitBtn'); exit.classList.remove('on');
    $$('.nav [data-route]').forEach(b => b.removeAttribute('aria-current'));
    $('#nav').classList.remove('open');
    if (h === 'home') renderHome();
    else if (h === 'about') renderAbout();
    else if (h === 'contact') { if (!view.firstChild) renderHome(); setTimeout(() => $('#contact').scrollIntoView({ behavior: 'smooth' }), 40); }
    else if (h === 'services') renderServices();
    else if (h === 'compass') renderCompass();
    else if (h === 'book') renderBook();
    else if (h.startsWith('s-')) { renderService(h.slice(2)); if (h === 's-counseling') exit.classList.add('on'); }
    else renderHome();
    const key = h.startsWith('s-') ? 'services' : (h === 'home' ? 'home' : h);
    const cur = $(`.nav [data-route="${key}"]`); if (cur) cur.setAttribute('aria-current', 'page');
    if (h === 'contact') return;
    if (!window.__first) window.__first = true; else window.scrollTo({ top: 0, behavior: 'auto' });
  }
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-route]');
    if (r) { e.preventDefault(); location.hash = '#' + r.dataset.route; }
  });
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-scroll]');
    if (s) { e.preventDefault(); $('#nav').classList.remove('open'); $('#' + s.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); }
  });
  window.addEventListener('hashchange', route);

  /* ---------- المساعد (محرك فهم عربي مبسّط) ---------- */
  const chat = { last: null, started: false };
  const panel = $('#chatPanel'), fab = $('#chatFab'), cb = $('#chatBody'), cq = $('#chatQr'), ci = $('#chatIn');
  const SV = SERVICES.map(s => ({ s, kw: s.kw.map(norm).filter(Boolean) }));
  const CRISIS = ['انتحار', 'اقتل نفسي', 'اوذي نفسي', 'ايذاء نفسي', 'لا اريد العيش', 'لا اريد ان اعيش', 'اتمني الموت', 'انهي حياتي', 'يضربني', 'اضرب', 'عنف', 'اعتداء', 'تحرش'].map(norm);

  function matchServices(text) {
    const toks = text.split(' ');
    return SV.map(({ s, kw }) => {
      let sc = 0;
      kw.forEach(k => {
        const short = k.length <= 3 && /^[a-z0-9]+$/.test(k);
        const hit = short ? toks.includes(k) : text.includes(k);
        if (hit) sc += k.length >= 5 ? 2 : 1;
      });
      return { s, sc };
    }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc);
  }
  const cards = list => `<div class="cards">${list.map(miniCard).join('')}</div>`;
  const DEFAULT_QR = ['أريد نشر بحث', 'تحليل إحصائي', 'الذكاء الاصطناعي', 'استشارة أسرية ونفسية', 'ابدأ البوصلة'];

  function reply(raw) {
    const t = norm(raw);
    if (CRISIS.some(k => t.includes(k))) {
      return { html: `أنا آسف لأنك تمر بهذا، وما تشعر به مهم. إن كنت أنت أو أحد غيرك في خطر الآن، فتواصل فورًا مع خدمات الطوارئ في بلدك أو توجّه إلى أقرب مستشفى، وكلّم شخصًا قريبًا منك ليكون معك.<br><br>وإذا أردت أن تتحدث مع مختص من فريقنا فهذه صفحة الخدمة وطريق التواصل:${cards([byId('counseling')])}`, qr: ['كيف أتواصل معكم؟'] };
    }
    if (/(^| )(سلام|مرحبا|اهلا|هلا|صباح|مساء)/.test(t) && t.split(' ').length <= 4) return { html: 'أهلًا بك في مركز إطلالة. قل لي ما الذي تبحث عنه، أو اختر من الأسفل.', qr: DEFAULT_QR };
    if (/(تواصل|رقم|واتساب|ايميل|بريد|هاتف|عنوان|اتصل)/.test(t)) return { html: `يمكنك التواصل مع ${CENTER.director} (${CENTER.role}):<br><b class="ltr">${CENTER.phoneDisplay}</b> (هاتف / واتساب)<br><b class="ltr">${CENTER.email}</b><br>وعلى منصاتنا: ${CENTER.social.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">${s.n}</a>`).join('، ')}`, qr: ['احجز استشارة'] };
    if (/(سعر|اسعار|تكلف|كم يكلف|كم السعر|رسوم|بكام)/.test(t)) return { html: 'الأسعار تختلف بحسب نطاق العمل وموعد التسليم، فلا نذكر رقمًا عامًا. اكتب لنا الخدمة التي تريدها وموعدك، ويرسل لك فريق المركز عرضًا واضحًا.', qr: ['احجز استشارة'], act: 'book' };
    if (/(احجز|حجز|موعد|اريد ان ابدا|ابدا)/.test(t)) return { html: 'جاهز. أفتح لك صفحة الحجز برسالة واتساب مبنية من اختياراتك.', qr: [], act: 'book' };
    if (/(بوصله|ساعدني|لا اعرف|مش عارف|احتار|محتار|من اين ابدا)/.test(t)) return { html: 'ثلاثة أسئلة قصيرة وأرشّح لك الرحلة المناسبة.', qr: [], act: 'compass' };
    if (/(من انتم|عن المركز|ما هو المركز|ما هي اطلاله|مركز اطلاله)/.test(t) && !matchServices(t).length) return { html: `${CENTER.name} يقدّم خدمات في البحث العلمي والتعلّم والذكاء الاصطناعي والأعمال والتصميم، وخدمة جديدة للاستشارات الأسرية والنفسية. تديره ${CENTER.director}.`, qr: DEFAULT_QR };
    const lastS = chat.last && byId(chat.last);
    if (lastS && /(مراحل|خطوات|كيف تتم|كيف تسير|الرحله|كيف تعملون)/.test(t)) return { html: `رحلة «${lastS.title}»:<br>${lastS.stages.map((x, i) => `${ar(i + 1)}. ${x[0]}`).join('<br>')}${cards([lastS])}`, qr: ['ماذا أستلم؟', 'احجز استشارة'] };
    if (lastS && /(ماذا استلم|مخرجات|ماذا احصل|ماذا اتسلم|ماذا يشمل)/.test(t)) return { html: `في «${lastS.title}» تحصل على:<br>${lastS.outputs.map(o => '• ' + o).join('<br>')}`, qr: ['ما المراحل؟', 'احجز استشارة'] };
    const m = matchServices(t);
    if (m.length) {
      const top = m[0], extra = m.slice(1, 3).filter(x => x.sc >= top.sc * 0.6);
      chat.last = top.s.id;
      const mods = top.s.modules.slice(0, 3).map(x => '• ' + x[0]).join('<br>');
      return { html: `يبدو أنك تسأل عن <b>${top.s.title}</b>. ${top.s.hook}<br><br>من أبرز ما تشمله:<br>${mods}${cards([top.s].concat(extra.map(x => x.s)))}`, qr: ['ما المراحل؟', 'ماذا أستلم؟', 'احجز استشارة'] };
    }
    return { html: 'لم أفهم طلبك تمامًا. اكتب ما تحتاجه بكلمات بسيطة، مثل «أريد نشر بحثي» أو «أحتاج ترجمة»، أو اترك الأمر للبوصلة وهي ترشدك.', qr: DEFAULT_QR };
  }
  function addMsg(html, who, isText) {
    const d = document.createElement('div'); d.className = 'msg ' + who;
    if (isText) d.textContent = html; else d.innerHTML = html;
    cb.appendChild(d); cb.scrollTop = cb.scrollHeight; return d;
  }
  function setQr(list) {
    cq.innerHTML = (list || []).map(q => `<button type="button">${q}</button>`).join('');
    $$('button', cq).forEach(b => b.addEventListener('click', () => send(b.textContent)));
  }
  function send(text) {
    text = text.trim(); if (!text) return;
    addMsg(text, 'me', true); ci.value = ''; setQr([]);
    if (norm(text) === norm('ابدأ البوصلة')) { closeChat(); location.hash = '#compass'; return; }
    const typing = addMsg('<span class="typing"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(() => {
      typing.remove();
      const r = reply(text);
      const d = addMsg(r.html, 'bot');
      if (r.act) {
        const b = document.createElement('button'); b.className = 'btn btn-gold btn-sm'; b.style.marginTop = '10px';
        b.textContent = r.act === 'book' ? 'افتح صفحة الحجز' : 'افتح البوصلة';
        b.addEventListener('click', () => { if (r.act === 'book') setLead(chat.last ? [chat.last] : [], ''); closeChat(); location.hash = '#' + (r.act === 'book' ? 'book' : 'compass'); });
        d.appendChild(b);
      }
      setQr(r.qr);
    }, 550 + Math.random() * 350);
  }
  function openChat() {
    panel.dataset.open = 'true'; fab.hidden = true; fab.setAttribute('aria-expanded', 'true');
    if (!chat.started) {
      chat.started = true;
      addMsg('مرحبًا بك في مركز إطلالة. أنا مساعد آلي أجيب من دليل خدمات المركز. ما الذي تبحث عنه؟', 'bot');
      setQr(DEFAULT_QR);
    }
    setTimeout(() => ci.focus(), 50);
  }
  function closeChat() { panel.dataset.open = 'false'; fab.hidden = false; fab.setAttribute('aria-expanded', 'false'); }
  fab.addEventListener('click', openChat);
  $('#chatClose').addEventListener('click', closeChat);
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); send(ci.value); });
  cb.addEventListener('click', e => {
    const m = e.target.closest('[data-go]'); if (m) { if (innerWidth < 700) closeChat(); location.hash = '#' + m.dataset.go; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.dataset.open === 'true') closeChat(); });

  /* ---------- المظهر والواجهة ---------- */
  const root = document.documentElement;
  const effective = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function syncThemeBtn() { $('#themeBtn').innerHTML = ico(effective() === 'dark' ? 'sun' : 'moon'); $('#themeBtn').setAttribute('aria-label', effective() === 'dark' ? 'المظهر الفاتح' : 'المظهر الداكن'); }
  const saved = store.get('etl.theme', null); if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', () => { const n = effective() === 'dark' ? 'light' : 'dark'; root.dataset.theme = n; store.set('etl.theme', n); syncThemeBtn(); });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', syncThemeBtn);
  $('#menuBtn').addEventListener('click', () => { const n = $('#nav'); n.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', n.classList.contains('open')); });
  $('#menuBtn').innerHTML = ico('menu'); $('#chatClose').innerHTML = ico('close'); $('#chatFab').innerHTML = ico('chat'); $('#chatSend').innerHTML = ico('send');
  $('#exitBtn').innerHTML = ico('exit') + ' خروج سريع';
  $('#exitBtn').addEventListener('click', () => { location.replace('#home'); });
  $('#year').textContent = ar(new Date().getFullYear());
  $('#fCats').innerHTML = Object.entries(CATS).map(([k, v]) => `<li><button data-filterjump="${k}">${v.n}</button></li>`).join('');
  $('#fCats').addEventListener('click', e => { const b = e.target.closest('[data-filterjump]'); if (b) { state.filter = b.dataset.filterjump; if (location.hash === '#services') route(); else location.hash = '#services'; } });
  $('#fContact').innerHTML = `<li>${CENTER.director}</li><li class="ltr">${CENTER.phoneDisplay}</li><li class="ltr">${CENTER.email}</li>` + CENTER.social.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${ico(s.id)} ${s.n}</a></li>`).join('');
  renderContact();

  /* ---------- خلفية الشبكة (ذكاء اصطناعي هادئ) ---------- */
  (function atmos() {
    const cv = $('#atmos'), g = cv.getContext('2d');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let W, H, N = [], col = '233,176,51', raf;
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; N = Array.from({ length: innerWidth < 700 ? 26 : 52 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 })); };
    const tone = () => { col = effective() === 'dark' ? '233,176,51' : '138,95,0'; };
    const tick = () => {
      g.clearRect(0, 0, W, H);
      for (let i = 0; i < N.length; i++) {
        const a = N[i]; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
        g.fillStyle = `rgba(${col},.55)`; g.beginPath(); g.arc(a.x, a.y, 1.6, 0, 6.3); g.fill();
        for (let j = i + 1; j < N.length; j++) {
          const b = N[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) { g.strokeStyle = `rgba(${col},${.18 * (1 - d / 140)})`; g.lineWidth = .7; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    size(); tone(); tick();
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); });
    $('#themeBtn').addEventListener('click', tone); matchMedia('(prefers-color-scheme: light)').addEventListener('change', tone);
  })();

  syncThemeBtn();
  route();
})();
