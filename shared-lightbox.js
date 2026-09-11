/**
 * Universal Image Lightbox & Zoom Viewer
 * Automatically enables high-res zoom & magnification for all educational images
 */
(function () {
  if (window.__imageLightboxInitialized) return;
  window.__imageLightboxInitialized = true;

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'universal-lightbox-styles';
  style.textContent = `
    /* Lightbox trigger cursor */
    img:not(.no-lightbox):not([src*="icon"]):not(.brand-logo img):not(.avatar-icon):not([width="1"]):not([width="2"]) {
      cursor: zoom-in !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }
    img:not(.no-lightbox):not([src*="icon"]):not(.brand-logo img):not(.avatar-icon):hover {
      filter: brightness(1.03);
    }
    
    /* Lightbox Modal Container */
    #universalLightboxModal {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      direction: rtl;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    #universalLightboxModal.active {
      display: flex;
      opacity: 1;
    }

    /* Modal Content Box */
    .lightbox-box {
      background: #ffffff;
      border-radius: 20px;
      max-width: 95vw;
      max-height: 94vh;
      width: 960px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
      transform: scale(0.92);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #universalLightboxModal.active .lightbox-box {
      transform: scale(1);
    }

    /* Modal Header */
    .lightbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #f8fafc;
      border-bottom: 1.5px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 10px;
    }
    .lightbox-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Cairo', sans-serif;
      max-width: 50%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lightbox-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      direction: ltr;
    }
    .lb-btn {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 10px;
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
      user-select: none;
    }
    .lb-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: translateY(-1px);
    }
    .lb-btn-close {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }
    .lb-btn-close:hover {
      background: #ef4444;
      color: white;
      border-color: #dc2626;
    }
    .lb-btn-download {
      background: #ecfdf5;
      color: #059669;
      border-color: #a7f3d0;
      text-decoration: none;
    }
    .lb-btn-download:hover {
      background: #10b981;
      color: white;
      border-color: #059669;
    }

    /* Modal Image Body */
    .lightbox-body {
      overflow: auto;
      max-height: 72vh;
      min-height: 250px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      position: relative;
      cursor: grab;
    }
    .lightbox-body:active {
      cursor: grabbing;
    }
    .lightbox-img {
      max-width: 100%;
      max-height: 68vh;
      object-fit: contain;
      border-radius: 10px;
      transition: transform 0.15s ease-out;
      transform-origin: center center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      background: white;
    }

    /* Modal Caption */
    .lightbox-caption {
      padding: 12px 20px;
      font-size: 13.5px;
      font-weight: 700;
      color: #334155;
      background: #ffffff;
      border-top: 1.5px solid #e2e8f0;
      line-height: 1.6;
      font-family: 'Cairo', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .lightbox-hint {
      margin-right: auto;
      font-size: 11.5px;
      color: #94a3b8;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .lightbox-header { padding: 10px 14px; }
      .lightbox-title { max-width: 100%; font-size: 13.5px; }
      .lb-btn { padding: 5px 8px; font-size: 11.5px; }
      .lightbox-caption { font-size: 12px; }
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal HTML
  const modal = document.createElement('div');
  modal.id = 'universalLightboxModal';
  modal.innerHTML = `
    <div class="lightbox-box" onclick="event.stopPropagation()">
      <div class="lightbox-header">
        <div class="lightbox-title">
          <span>🔍</span>
          <span id="lbTitleText">عرض وتكبير الصورة</span>
        </div>
        <div class="lightbox-controls">
          <button class="lb-btn" id="lbZoomIn" title="تكبير (+)">🔍 +</button>
          <button class="lb-btn" id="lbZoomOut" title="تصغير (-)">🔍 -</button>
          <button class="lb-btn" id="lbZoomReset" title="الحجم الطبيعي (100%)">↺ 100%</button>
          <a class="lb-btn lb-btn-download" id="lbDownload" href="#" download title="تحميل الصورة بالجودة الأصلية">⬇️ حفظ</a>
          <button class="lb-btn lb-btn-close" id="lbClose" title="إغلاق (Esc)">✕ إغلاق</button>
        </div>
      </div>
      <div class="lightbox-body" id="lbBody">
        <img class="lightbox-img" id="lbImage" src="" alt="Zoomed View">
      </div>
      <div class="lightbox-caption">
        <span>📸</span>
        <span id="lbCaptionText">التفاصيل التوضيحية للصورة</span>
        <span class="lightbox-hint">💡 يمكنك استخدام عجلة الفأرة للتكبير، واضغط في أي مكان للإغلاق</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // State
  let currentZoom = 1;
  const zoomStep = 0.25;
  const minZoom = 0.5;
  const maxZoom = 4.0;

  const lbImage = document.getElementById('lbImage');
  const lbTitleText = document.getElementById('lbTitleText');
  const lbCaptionText = document.getElementById('lbCaptionText');
  const lbDownload = document.getElementById('lbDownload');
  const lbBody = document.getElementById('lbBody');

  function updateTransform() {
    lbImage.style.transform = `scale(${currentZoom})`;
  }

  function zoomIn() {
    if (currentZoom < maxZoom) {
      currentZoom = Math.min(maxZoom, currentZoom + zoomStep);
      updateTransform();
    }
  }

  function zoomOut() {
    if (currentZoom > minZoom) {
      currentZoom = Math.max(minZoom, currentZoom - zoomStep);
      updateTransform();
    }
  }

  function zoomReset() {
    currentZoom = 1;
    updateTransform();
    lbBody.scrollTop = (lbBody.scrollHeight - lbBody.clientHeight) / 2;
    lbBody.scrollLeft = (lbBody.scrollWidth - lbBody.clientWidth) / 2;
  }

  function openLightbox(src, title, caption) {
    lbImage.src = src;
    lbTitleText.textContent = title || 'عرض وتكبير الصورة التعليمية';
    lbCaptionText.textContent = caption || title || 'رسم توضيحي عالي الدقة من المنهج المعتمد';
    lbDownload.href = src;
    lbDownload.setAttribute('download', src.split('/').pop() || 'educational-image.png');
    
    zoomReset();
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      lbImage.src = '';
      document.body.style.overflow = '';
    }, 250);
  }

  // Event Listeners
  document.getElementById('lbZoomIn').addEventListener('click', zoomIn);
  document.getElementById('lbZoomOut').addEventListener('click', zoomOut);
  document.getElementById('lbZoomReset').addEventListener('click', zoomReset);
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  modal.addEventListener('click', closeLightbox);

  // Keyboard shortcut Esc / + / -
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === '+' || e.key === '=') zoomIn();
    else if (e.key === '-' || e.key === '_') zoomOut();
    else if (e.key === '0') zoomReset();
  });

  // Mouse wheel zoom
  lbBody.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, { passive: false });

  // 3. Attach click listeners to all educational images on the page
  function attachToImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.id === 'lbImage') return;
      if (img.classList.contains('no-lightbox')) return;
      if (img.closest('.brand') || img.closest('.brand-logo') || img.closest('.avatar-wrap')) return;

      let caption = '';
      let title = img.getAttribute('title') || img.getAttribute('alt') || '';
      
      const wrap = img.closest('.edu-img-wrap') || img.closest('.gallery-card') || img.closest('figure');
      if (wrap) {
        const capEl = wrap.querySelector('.edu-img-caption') || wrap.querySelector('figcaption') || wrap.querySelector('.gallery-overlay');
        if (capEl) caption = capEl.textContent.replace('📸', '').replace('🔍', '').trim();
      }

      if (!caption && title) caption = title;
      if (!title && caption) title = caption;

      img.removeEventListener('click', img.__lbHandler);
      img.__lbHandler = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.currentSrc || img.src, title, caption);
      };
      img.addEventListener('click', img.__lbHandler);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToImages);
  } else {
    attachToImages();
  }

  window.openImageModal = function (src, title, caption) {
    openLightbox(src, title, caption);
  };
})();
