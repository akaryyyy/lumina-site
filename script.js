/**
 * LUMINA ECO SANCTUARY - INTERACTIVE CONTROLLER
 * Pure Vanilla JavaScript: Web Audio API, Responsive UI, Dynamic Booking, Filters
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Theme Management (Dark / Light)
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('lumina_theme') || 'dark';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumina_theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'light' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      themeToggle.setAttribute('title', theme === 'light' ? 'Mudar para Modo Noturno' : 'Mudar para Modo Claro');
    }
  }

  setTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      setTheme(active === 'light' ? 'dark' : 'light');
      showToast(active === 'light' ? 'Modo Noturno ativado 🌙' : 'Modo Claro ativado ☀️');
    });
  }

  // --------------------------------------------------------------------------
  // 2. Ambient Nature Sound Synthesizer (Web Audio API - 0 external files!)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let noiseNode = null;
  let filterNode = null;
  let gainNode = null;
  let isSoundPlaying = false;
  const soundBtn = document.getElementById('sound-toggle');

  function initAmbientAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Buffer for soft pink noise (forest wind)
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // Low pass filter to create a warm, distant breeze sound
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(380, audioCtx.currentTime);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noiseNode.start(0);
    } catch (e) {
      console.warn('Web Audio API not supported on this browser', e);
    }
  }

  function toggleAmbientSound() {
    initAmbientAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isSoundPlaying) {
      gainNode.gain.setTargetAtTime(0.35, audioCtx.currentTime, 1.2);
      isSoundPlaying = true;
      soundBtn.classList.add('playing');
      soundBtn.setAttribute('title', 'Pausar som ambiente de natureza');
      showToast('🌿 Som de brisa na floresta ativado');
    } else {
      gainNode.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.8);
      isSoundPlaying = false;
      soundBtn.classList.remove('playing');
      soundBtn.setAttribute('title', 'Ouvir som ambiente de natureza');
      showToast('🔇 Som ambiente pausado');
    }
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', toggleAmbientSound);
  }

  // --------------------------------------------------------------------------
  // 3. Header Scroll & Mobile Navigation
  // --------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Accommodations Data & Filtering
  // --------------------------------------------------------------------------
  const accommodationsData = [
    {
      id: 'domo-estelar',
      category: 'domo',
      title: 'Domo Geodésico Estelar',
      type: 'Glamping de Luxo',
      price: 890,
      rating: '4.98 (340)',
      badge: 'Mais Procurado',
      badgeClass: 'highlight',
      image: 'assets/images/hero.jpg',
      guests: '2 Hóspedes',
      beds: '1 Cama King',
      area: '55 m²',
      desc: 'Cúpula geodésica panorâmica com teto de vidro transparente sobre a cama, lareira ecológica suspensa, jacuzzi aquecida privativa no deck e vista infinita para a Via Láctea.',
      amenities: [
        'Teto de vidro para observação de estrelas',
        'Jacuzzi aquecida no deck externo privativo',
        'Lareira ecológica interna suspensa',
        'Café da manhã artesanal servido na cabana',
        'Cama Super King com lençóis 600 fios',
        'Wi-Fi Starlink de alta velocidade',
        'Adega de vinhos e máquina Nespresso',
        'Amenities orgânicos L’Occitane au Brésil'
      ]
    },
    {
      id: 'chale-aurora',
      category: 'chale',
      title: 'Chalé Aurora Escandinavo',
      type: 'Cabana A-Frame Nórdica',
      price: 1150,
      rating: '4.96 (210)',
      badge: 'Design Nórdico',
      badgeClass: '',
      image: 'assets/images/chale-aurora.jpg',
      guests: 'Até 4 Hóspedes',
      beds: '2 Camas Queen',
      area: '85 m²',
      desc: 'Arquitetura escandinava com fachada inteira em vidro duplo, mezanino aconchegante, lareira a lenha tradicional e deck de madeira suspenso imerso entre pinheiros centenários.',
      amenities: [
        'Fachada envidraçada do chão ao teto',
        'Lareira tradicional a lenha nórdica',
        'Cozinha gourmet completa com ilha',
        'Piso aquecido no banheiro',
        'Ducha dupla com vista para o bosque',
        'Churrasqueira em aço corten no deck',
        'Rede suspensa de descanso entre árvores',
        'Projetor de cinema 4K integrado'
      ]
    },
    {
      id: 'villa-infinity',
      category: 'villa',
      title: 'Villa Panorâmica Infinity',
      type: 'Residência Exclusiva',
      price: 2450,
      rating: '5.0 (180)',
      badge: 'Experiência VIP',
      badgeClass: 'highlight',
      image: 'assets/images/villa-infinity.jpg',
      guests: 'Até 6 Hóspedes',
      beds: '3 Suítes King',
      area: '210 m²',
      desc: 'Nossa acomodação mais espetacular: estrutura suspensa sobre o vale das montanhas com piscina privativa aquecida de borda infinita, adega climatizada e lareira ao ar livre.',
      amenities: [
        'Piscina privativa aquecida de borda infinita',
        'Fogo de chão (fire pit) panorâmico no deck',
        'Serviço de concierge e mordomo dedicado',
        '3 Suítes master com hidromassagem',
        'Adega privativa com seleção de rótulos',
        'Cozinha de chef com menu sob demanda',
        'Sauna seca privativa com vista panorâmica',
        'Estacionamento privativo coberto com recarga EV'
      ]
    },
    {
      id: 'cabana-lago',
      category: 'cabana',
      title: 'Cabana Bosque do Lago',
      type: 'Refúgio Lacustre',
      price: 980,
      rating: '4.95 (195)',
      badge: 'Beira d’água',
      badgeClass: '',
      image: 'assets/images/cabana-lago.jpg',
      guests: 'Até 3 Hóspedes',
      beds: '1 King + 1 Sofá-cama',
      area: '70 m²',
      desc: 'Cabana de madeira nobre localizada na orla do lago natural privativo, deck molhado com ofurô japonês em cedro vermelho e caiaques exclusivos inclusos na diária.',
      amenities: [
        'Ofurô externo de cedro com água termal',
        'Acesso privativo e direto ao lago',
        '2 Caiaques e pranchas de stand-up paddle',
        'Varanda gourmet com fogão a lenha',
        'Telescópio astronômico profissional',
        'Piquenique gourmet de boas-vindas',
        'Sistema de som ambiente Marshall',
        'Trilha privativa até a cachoeira'
      ]
    }
  ];

  const filterButtons = document.querySelectorAll('.filter-btn');
  const roomsContainer = document.getElementById('rooms-grid');

  function renderRooms(filter = 'all') {
    if (!roomsContainer) return;
    roomsContainer.innerHTML = '';

    const filtered = filter === 'all' 
      ? accommodationsData 
      : accommodationsData.filter(r => r.category === filter);

    filtered.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.innerHTML = `
        <div class="room-thumb-wrapper">
          <img src="${room.image}" alt="${room.title}" class="room-thumb" loading="lazy">
          <span class="room-badge ${room.badgeClass}">${room.badge}</span>
          <span class="room-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${room.rating}
          </span>
        </div>
        <div class="room-body">
          <div class="room-type">${room.type}</div>
          <h3 class="room-title">${room.title}</h3>
          <p class="room-desc">${room.desc}</p>
          <div class="room-specs">
            <div class="room-spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              ${room.guests}
            </div>
            <div class="room-spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 10h20"></path></svg>
              ${room.beds}
            </div>
            <div class="room-spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              ${room.area}
            </div>
          </div>
          <div class="room-footer">
            <div class="room-price-box">
              <span class="price-label">A partir de</span>
              <span class="price-value">R$ ${room.price} <span>/ noite</span></span>
            </div>
            <div class="room-actions">
              <button class="btn btn-secondary btn-sm" onclick="openRoomDetails('${room.id}')">Ver Detalhes</button>
              <button class="btn btn-primary btn-sm" onclick="startBooking('${room.id}')">Reservar</button>
            </div>
          </div>
        </div>
      `;
      roomsContainer.appendChild(card);
    });
  }

  // Filter click handler
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderRooms(cat);
    });
  });

  renderRooms('all');

  // --------------------------------------------------------------------------
  // 5. Hero Booking Search Bar Handler
  // --------------------------------------------------------------------------
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroCategory = document.getElementById('search-category');
  const heroCheckin = document.getElementById('search-checkin');
  const heroCheckout = document.getElementById('search-checkout');

  // Set default dates (tomorrow and 3 days later)
  const today = new Date();
  const dIn = new Date(today);
  dIn.setDate(today.getDate() + 1);
  const dOut = new Date(today);
  dOut.setDate(today.getDate() + 4);

  if (heroCheckin) heroCheckin.value = dIn.toISOString().split('T')[0];
  if (heroCheckout) heroCheckout.value = dOut.toISOString().split('T')[0];

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = heroCategory.value;
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
      if (targetBtn) {
        filterButtons.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
      }
      renderRooms(cat);

      // Sync calculator dates
      const calcIn = document.getElementById('calc-checkin');
      const calcOut = document.getElementById('calc-checkout');
      if (calcIn && heroCheckin) calcIn.value = heroCheckin.value;
      if (calcOut && heroCheckout) calcOut.value = heroCheckout.value;
      updateCalculator();

      document.getElementById('acomodacoes').scrollIntoView({ behavior: 'smooth' });
      showToast('Acomodações atualizadas para suas datas!');
    });
  }

  // --------------------------------------------------------------------------
  // 6. Interactive Stay & Price Calculator
  // --------------------------------------------------------------------------
  const calcRoomSelect = document.getElementById('calc-room');
  const calcCheckin = document.getElementById('calc-checkin');
  const calcCheckout = document.getElementById('calc-checkout');
  const calcGuests = document.getElementById('calc-guests');
  const couponInput = document.getElementById('coupon-code');
  const couponBtn = document.getElementById('apply-coupon-btn');

  let activeDiscountPercent = 0;

  if (calcCheckin) calcCheckin.value = dIn.toISOString().split('T')[0];
  if (calcCheckout) calcCheckout.value = dOut.toISOString().split('T')[0];

  function calculateNights() {
    if (!calcCheckin || !calcCheckout) return 3;
    const date1 = new Date(calcCheckin.value);
    const date2 = new Date(calcCheckout.value);
    const diffTime = date2 - date1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  function updateCalculator() {
    const selectedRoomId = calcRoomSelect ? calcRoomSelect.value : 'domo-estelar';
    const room = accommodationsData.find(r => r.id === selectedRoomId) || accommodationsData[0];
    const nights = calculateNights();

    const roomTotal = room.price * nights;

    // Check extras
    let extrasTotal = 0;
    document.querySelectorAll('.extra-checkbox:checked').forEach(cb => {
      extrasTotal += parseInt(cb.getAttribute('data-price') || '0', 10);
    });

    const subtotal = roomTotal + extrasTotal;
    const discountAmount = Math.round(subtotal * (activeDiscountPercent / 100));
    const total = subtotal - discountAmount;

    // Update DOM summary
    const summaryRoom = document.getElementById('summary-room-name');
    const summaryNights = document.getElementById('summary-nights');
    const summaryRoomCost = document.getElementById('summary-room-cost');
    const summaryExtrasCost = document.getElementById('summary-extras-cost');
    const summaryDiscountRow = document.getElementById('summary-discount-row');
    const summaryDiscountVal = document.getElementById('summary-discount-val');
    const summaryTotalVal = document.getElementById('summary-total-price');

    if (summaryRoom) summaryRoom.textContent = room.title;
    if (summaryNights) summaryNights.textContent = `${nights} ${nights === 1 ? 'noite' : 'noites'}`;
    if (summaryRoomCost) summaryRoomCost.textContent = `R$ ${roomTotal.toLocaleString('pt-BR')}`;
    if (summaryExtrasCost) summaryExtrasCost.textContent = `R$ ${extrasTotal.toLocaleString('pt-BR')}`;

    if (summaryDiscountRow && summaryDiscountVal) {
      if (activeDiscountPercent > 0) {
        summaryDiscountRow.style.display = 'flex';
        summaryDiscountVal.textContent = `- R$ ${discountAmount.toLocaleString('pt-BR')} (${activeDiscountPercent}%)`;
      } else {
        summaryDiscountRow.style.display = 'none';
      }
    }

    if (summaryTotalVal) {
      summaryTotalVal.textContent = `R$ ${total.toLocaleString('pt-BR')}`;
    }
  }

  if (calcRoomSelect) calcRoomSelect.addEventListener('change', updateCalculator);
  if (calcCheckin) calcCheckin.addEventListener('change', updateCalculator);
  if (calcCheckout) calcCheckout.addEventListener('change', updateCalculator);
  if (calcGuests) calcGuests.addEventListener('change', updateCalculator);

  document.querySelectorAll('.extra-checkbox').forEach(cb => {
    cb.addEventListener('change', updateCalculator);
  });

  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'LUMINA10' || code === 'DESCONTO10' || code === 'UC15') {
        activeDiscountPercent = 10;
        updateCalculator();
        showToast('Cupom de 10% de desconto aplicado com sucesso! 🎉');
      } else if (code === '') {
        showToast('Digite um código de cupom.', 'error');
      } else {
        showToast('Cupom inválido. Tente LUMINA10', 'error');
      }
    });
  }

  updateCalculator();

  // --------------------------------------------------------------------------
  // 7. Modals: Room Details & Booking Checkout
  // --------------------------------------------------------------------------
  const roomModal = document.getElementById('room-modal');
  const bookingModal = document.getElementById('booking-modal');

  window.openRoomDetails = function(roomId) {
    const room = accommodationsData.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('modal-room-img').src = room.image;
    document.getElementById('modal-room-title').textContent = room.title;
    document.getElementById('modal-room-type').textContent = room.type;
    document.getElementById('modal-room-desc').textContent = room.desc;
    document.getElementById('modal-room-price').textContent = `R$ ${room.price} / noite`;

    const amenitiesList = document.getElementById('modal-amenities');
    if (amenitiesList) {
      amenitiesList.innerHTML = room.amenities.map(am => `
        <div class="amenity-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${am}</span>
        </div>
      `).join('');
    }

    const modalReserveBtn = document.getElementById('modal-reserve-btn');
    if (modalReserveBtn) {
      modalReserveBtn.onclick = () => {
        closeAllModals();
        startBooking(roomId);
      };
    }

    roomModal.classList.add('active');
  };

  window.startBooking = function(roomId) {
    const room = accommodationsData.find(r => r.id === roomId) || accommodationsData[0];
    if (calcRoomSelect) {
      calcRoomSelect.value = room.id;
      updateCalculator();
    }

    const nights = calculateNights();
    const checkoutSummary = document.getElementById('checkout-room-summary');
    if (checkoutSummary) {
      checkoutSummary.textContent = `${room.title} • ${nights} ${nights === 1 ? 'noite' : 'noites'}`;
    }

    bookingModal.classList.add('active');
  };

  window.closeAllModals = function() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  };

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Handle Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guest-name').value;
      closeAllModals();
      showToast(`Reserva confirmada com sucesso para ${guestName}! Enviamos os detalhes por e-mail e WhatsApp. ✨`);
      checkoutForm.reset();
    });
  }

  // --------------------------------------------------------------------------
  // 8. Testimonials Carousel
  // --------------------------------------------------------------------------
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      resetSlideTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      resetSlideTimer();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      resetSlideTimer();
    });
  });

  function startSlideTimer() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
  }

  startSlideTimer();

  // --------------------------------------------------------------------------
  // 9. FAQ Accordion
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other accordions
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. Contact Form & Newsletter
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      showToast(`Obrigado, ${name}! Recebemos sua mensagem e responderemos em até 2 horas.`);
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Inscrição confirmada! Você receberá ofertas e convites exclusivos.');
      newsletterForm.reset();
    });
  }

  // --------------------------------------------------------------------------
  // 11. Toast System
  // --------------------------------------------------------------------------
  window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'error' ? '⚠️' : '✨'}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };
});
