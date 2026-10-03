/* ==========================================================================
   BALIREDDY'S WEDDING INVITATION - LOGIC & ANIMATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Element References
  const posterImg = document.getElementById('doorPoster');
  const video = document.getElementById('doorVideo');
  const videoSource = document.getElementById('videoSource');
  const staticCanvas = document.getElementById('staticFrameCanvas');
  const canvasCtx = staticCanvas ? staticCanvas.getContext('2d') : null;
  
  const tapOverlay = document.getElementById('tapOverlay');
  const invitationOverlay = document.getElementById('invitationOverlay');
  
  // Controls
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIconOn = document.getElementById('audioIconOn');
  const audioIconOff = document.getElementById('audioIconOff');
  const replayBtn = document.getElementById('replayBtn');
  
  // Modals & Actions
  const mapModal = document.getElementById('mapModal');
  const openMapBtn = document.getElementById('openMapBtn');
  const closeMapModal = document.getElementById('closeMapModal');
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');

  // Application State
  let isAudioMuted = false;
  let isPlaying = false;
  let hasOpened = false;
  let audioCtx = null;

  // --- Audio Context Helper ---
  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // --- 3D Depth Floating Sky Lanterns Engine ---
  function initFloatingLanterns() {
    const container = document.getElementById('lanternsContainer');
    if (!container) return;

    container.innerHTML = '';
    const lanternCount = 22;
    const depthTiers = ['depth-far', 'depth-far', 'depth-mid', 'depth-mid', 'depth-near'];

    for (let i = 0; i < lanternCount; i++) {
      const lantern = document.createElement('div');
      const depthClass = depthTiers[Math.floor(Math.random() * depthTiers.length)];
      lantern.className = `lantern-item ${depthClass}`;

      const leftPos = (Math.random() * 92 + 4).toFixed(1);
      const duration = (Math.random() * 14 + 14).toFixed(1);
      const delay = (Math.random() * 20).toFixed(1);
      const swayX = (Math.random() * 24 + 10).toFixed(0);
      const rotDeg = (Math.random() * 6 - 3).toFixed(1);

      lantern.style.left = `${leftPos}%`;
      lantern.style.animationDuration = `${duration}s`;
      lantern.style.animationDelay = `${delay}s`;
      lantern.style.setProperty('--sway-x', `${swayX}px`);
      lantern.style.setProperty('--rot-deg', `${rotDeg}deg`);

      lantern.innerHTML = `
        <div class="lantern-paper">
          <div class="lantern-core-flame"></div>
        </div>
        <div class="lantern-tassel"></div>
      `;

      container.appendChild(lantern);
    }
  }

  // Initialize floating sky lanterns
  initFloatingLanterns();

  // --- Capture Final Video Frame onto Canvas for 100% Static Hold ---
  function freezeFinalFrame() {
    if (video && video.videoWidth && video.videoHeight && staticCanvas && canvasCtx) {
      staticCanvas.width = video.videoWidth;
      staticCanvas.height = video.videoHeight;
      canvasCtx.drawImage(video, 0, 0, staticCanvas.width, staticCanvas.height);
      
      staticCanvas.classList.add('active');
      video.pause();
    }
  }

  // --- Helper: Reveal Invitation Content ---
  function revealInvitationContent() {
    freezeFinalFrame();
    hasOpened = true;
    isPlaying = false;

    // Reveal invitation text overlay smoothly over static final door frame
    if (invitationOverlay) {
      invitationOverlay.classList.remove('hidden');
      void invitationOverlay.offsetWidth;
      invitationOverlay.classList.add('revealed');
    }

    // Initialize HTML5 Scratch Canvas once overlay is visible
    setTimeout(() => {
      initScratchCanvas();
    }, 150);
  }

  // --- HTML5 Scratch Card Engine ---
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchHint = document.getElementById('scratchHint');
  const quickRevealBtn = document.getElementById('quickRevealBtn');
  let scratchCtx = null;
  let isScratching = false;
  let hasScratchedCleared = false;
  let dragCount = 0;

  function initScratchCanvas() {
    if (!scratchCanvas) return;
    scratchCtx = scratchCanvas.getContext('2d');
    
    const container = document.getElementById('scratchContainer');
    if (!container) return;
    
    scratchCanvas.width = container.offsetWidth || 320;
    scratchCanvas.height = container.offsetHeight || 120;
    
    // Render Metallic Gold Foil Gradient
    const grad = scratchCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, '#E5C158');
    grad.addColorStop(0.35, '#FFF4D0');
    grad.addColorStop(0.7, '#D4A338');
    grad.addColorStop(1, '#A67C1E');

    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Subtle noise pattern & border trim on foil
    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < scratchCanvas.width; i += 8) {
      scratchCtx.fillRect(i, 0, 2, scratchCanvas.height);
    }

    // Scratch Card Callout text on the foil
    scratchCtx.font = '600 12px Montserrat, sans-serif';
    scratchCtx.fillStyle = '#4A3500';
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';
    scratchCtx.letterSpacing = '2px';
    scratchCtx.fillText('★ SCRATCH FOIL TO REVEAL DATE ★', scratchCanvas.width / 2, scratchCanvas.height / 2);

    scratchCanvas.addEventListener('mousedown', startScratch);
    scratchCanvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', endScratch);

    scratchCanvas.addEventListener('touchstart', startScratch, { passive: false });
    scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', endScratch);
  }

  function startScratch(e) {
    isScratching = true;
    if (scratchHint) scratchHint.style.opacity = '0';
    scratch(e);
  }

  function endScratch() {
    isScratching = false;
  }

  function scratch(e) {
    if (!isScratching || !scratchCtx) return;
    e.preventDefault();

    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (scratchCanvas.width / rect.width);
    const y = (clientY - rect.top) * (scratchCanvas.height / rect.height);

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 24, 0, Math.PI * 2, false);
    scratchCtx.fill();

    dragCount++;
    if (dragCount % 12 === 0) {
      checkScratchPercentage();
    }
  }

  function checkScratchPercentage() {
    if (hasScratchedCleared || !scratchCtx) return;
    
    try {
      const imgData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
      let transparentPixels = 0;
      const totalPixels = imgData.data.length / 4;

      // Sample every 16th pixel for high-performance mobile evaluation
      for (let i = 3; i < imgData.data.length; i += 16 * 4) {
        if (imgData.data[i] === 0) {
          transparentPixels += 16;
        }
      }

      const percent = (transparentPixels / totalPixels) * 100;
      if (percent > 40) {
        revealDateFully();
      }
    } catch (e) {
      // Fallback
    }
  }

  function revealDateFully() {
    if (hasScratchedCleared) return;
    hasScratchedCleared = true;

    if (scratchCanvas) scratchCanvas.classList.add('fade-out');
    if (scratchHint) scratchHint.classList.add('hidden');
    if (quickRevealBtn) quickRevealBtn.classList.add('hidden');

    // Trigger golden celebratory confetti burst
    triggerConfetti();
  }

  if (quickRevealBtn) {
    quickRevealBtn.addEventListener('click', revealDateFully);
  }

  // --- Gold Confetti Particle Celebration Engine ---
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimationId = null;

  function triggerConfetti() {
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
    
    const container = document.getElementById('invitationOverlay');
    confettiCanvas.width = container ? container.offsetWidth : window.innerWidth;
    confettiCanvas.height = container ? container.offsetHeight : window.innerHeight;
    
    const colors = ['#FFF4D0', '#E5C158', '#D4A338', '#FFFFFF', '#F5D77F'];
    confettiParticles = [];
    
    for (let i = 0; i < 70; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() * 60 - 30),
        y: confettiCanvas.height * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() * -10) - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }
    
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    let activeParticles = 0;
    
    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;
      
      if (p.opacity > 0) {
        activeParticles++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
      }
    });
    
    if (activeParticles > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // --- Live Countdown Timer Engine (Target: Oct 11, 2026 23:32:00) ---
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');
  
  const targetWeddingDate = new Date('October 11, 2026 23:32:00').getTime();

  function updateCountdown() {
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;
    
    const now = new Date().getTime();
    const distance = targetWeddingDate - now;
    
    if (distance < 0) {
      cdDays.innerText = '00';
      cdHours.innerText = '00';
      cdMins.innerText = '00';
      cdSecs.innerText = '00';
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    cdDays.innerText = days < 10 ? '0' + days : days;
    cdHours.innerText = hours < 10 ? '0' + hours : hours;
    cdMins.innerText = minutes < 10 ? '0' + minutes : minutes;
    cdSecs.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- Door Opening Handler ---
  function openDoorInvitation() {
    if (isPlaying || hasOpened) return;
    
    isPlaying = true;
    initAudioContext();

    // 1. Hide tap callout overlay
    if (tapOverlay) tapOverlay.classList.add('fade-out');
    
    // 2. Hide poster image & clear static canvas
    if (posterImg) posterImg.classList.add('fade-out');
    if (staticCanvas) staticCanvas.classList.remove('active');
    
    // 3. Reset video playback to 0 and play continuous single-motion video
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Video playing smoothly to the end
        }).catch(err => {
          console.warn('Video auto-play fallback:', err);
          revealInvitationContent();
        });
      }
    }
  }

  // Forward desktop wheel scrolling to content-scrollable container once revealed
  const contentScrollable = document.getElementById('contentScrollable');
  window.addEventListener('wheel', (e) => {
    if (hasOpened && contentScrollable) {
      contentScrollable.scrollTop += e.deltaY;
    }
  }, { passive: true });

  // --- Video Event Listeners ---
  if (video) {
    video.addEventListener('timeupdate', () => {
      // Reveal floating sky lanterns at 6th second of video playback
      if (video.currentTime >= 6.0) {
        const lanternsContainer = document.getElementById('lanternsContainer');
        if (lanternsContainer) lanternsContainer.classList.add('revealed');
      }

      // Trigger fade-in reveal starting from 6th second of video playback
      if (!hasOpened && (video.currentTime >= 6.0 || video.ended)) {
        revealInvitationContent();
      }
    });

    video.addEventListener('ended', () => {
      freezeFinalFrame();
      if (!hasOpened) {
        revealInvitationContent();
      }
    });
  }

  // --- Reset & Replay ---
  function resetDoorState() {
    isPlaying = false;
    hasOpened = false;
    
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    
    if (staticCanvas) staticCanvas.classList.remove('active');
    if (invitationOverlay) invitationOverlay.classList.remove('revealed');
    
    const lanternsContainer = document.getElementById('lanternsContainer');
    if (lanternsContainer) lanternsContainer.classList.remove('revealed');

    setTimeout(() => {
      if (invitationOverlay) invitationOverlay.classList.add('hidden');
      if (posterImg) posterImg.classList.remove('fade-out');
      if (tapOverlay) tapOverlay.classList.remove('fade-out');
    }, 400);
  }

  // Event Listener for Tap Overlay & Replay
  if (tapOverlay) tapOverlay.addEventListener('click', openDoorInvitation);
  if (replayBtn) replayBtn.addEventListener('click', resetDoorState);

  // --- Audio Mute Toggle ---
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      isAudioMuted = !isAudioMuted;
      if (video) video.muted = isAudioMuted;

      if (isAudioMuted) {
        if (audioIconOn) audioIconOn.classList.add('hidden');
        if (audioIconOff) audioIconOff.classList.remove('hidden');
      } else {
        if (audioIconOn) audioIconOn.classList.remove('hidden');
        if (audioIconOff) audioIconOff.classList.add('hidden');
        initAudioContext();
      }
    });
  }

  // --- Map Modal Controls ---
  if (openMapBtn && mapModal) {
    openMapBtn.addEventListener('click', () => mapModal.classList.remove('hidden'));
  }
  if (closeMapModal && mapModal) {
    closeMapModal.addEventListener('click', () => mapModal.classList.add('hidden'));
  }
  if (mapModal) {
    mapModal.addEventListener('click', (e) => {
      if (e.target === mapModal) {
        mapModal.classList.add('hidden');
      }
    });
  }

  // --- Add to Google Calendar ---
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      const title = encodeURIComponent("Wedding of Venkata Mohan (Venky) & Priyanka");
      const details = encodeURIComponent("Balireddy's Wedding Invitation: Solicit your gracious presence at the wedding of our elder son Chy. Venkata Mohan (Venky) with Chy. La. Sow. Priyanka. Dinner from 7:00 PM onwards, Sumuhurtham at 11:32 PM.");
      const loc = encodeURIComponent("Star Homes, Near Pedaboddepalli to Kota Uratla Road, Dharma Sagaram (Narsipatnam)");

      // Sunday, 11th Oct 2026: Dinner from 7:00 PM (13:30 UTC) to late night (19:30 UTC)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=20261011T133000Z/20261011T193000Z`;

      window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Register Service Worker for fast caching
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker skipped:', err);
      });
    });
  }
});
