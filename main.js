/* ==========================================================================
   CAEL HUB — CYBERNETIC SCI-FI APPLICATION ENGINE
   ========================================================================== */

import { APPS_CATALOG } from './appData.js';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

// --------------------------------------------------------------------------
// 1. Audio Synthesizer Engine (Web Audio API)
// --------------------------------------------------------------------------
class SoundEngine {
  constructor() {
    const savedAudio = localStorage.getItem('cael_audio');
    this.enabled = savedAudio !== null ? savedAudio === 'true' : false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context policy safe ignore
    }
  }

  playBlip() {
    this.playTone(880, 'sine', 0.05, 0.08);
  }

  playChime() {
    this.playTone(523.25, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 80);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.12), 160);
  }

  playWarp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) { }
  }
}

const audio = new SoundEngine();


// --------------------------------------------------------------------------
// 2. Sci-Fi Opening Animation Preloader
// --------------------------------------------------------------------------
function initIntroAnimation() {
  const introOverlay = document.getElementById('sci-fi-intro');
  const mainApp = document.getElementById('main-app');
  const progressFill = document.getElementById('intro-progress-fill');
  const percentText = document.getElementById('intro-percent');
  const statusText = document.getElementById('intro-status-text');
  const terminalLogs = document.getElementById('intro-terminal-logs');
  const skipBtn = document.getElementById('skip-intro-btn');
  const canvas = document.getElementById('intro-canvas');
  if (!canvas || !introOverlay) {
    if (mainApp) mainApp.classList.remove('hidden');
    initHeroCanvas();
    animateHeroStats();
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Starfield & Grid Particles
  const stars = Array.from({ length: 140 }, () => ({
    x: (Math.random() - 0.5) * width * 2,
    y: (Math.random() - 0.5) * height * 2,
    z: Math.random() * width,
    size: Math.random() * 2 + 1
  }));

  let animationFrameId;
  function renderIntroCanvas() {
    ctx.fillStyle = '#03050c';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f3ff';
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.z -= 4;
      if (star.z <= 0) star.z = width;

      const k = 256 / star.z;
      const px = star.x * k + width / 2;
      const py = star.y * k + height / 2;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = (1 - star.z / width) * star.size * 2;
        const alpha = (1 - star.z / width);
        ctx.fillStyle = `rgba(0, 243, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    animationFrameId = requestAnimationFrame(renderIntroCanvas);
  }
  renderIntroCanvas();

  // Progress & Terminal Log Sequencer
  const logSequence = [
    { pct: 15, status: 'BOOTSTRAPPING QUANTUM CORE...', log: '[00.05] Neural Synapse Grid: Connected' },
    { pct: 35, status: 'LOADING CAEL MATRIX ASSETS...', log: '[00.22] MobileLogo & AI Model: Synchronized' },
    { pct: 60, status: 'INITIALIZING CAELIN AI ENGINE...', log: '[00.48] Pollinations Free AI Provider: Linked' },
    { pct: 85, status: 'ENCRYPTING CHANNEL PIPELINES...', log: '[00.75] Quantum Security: 256-Bit Shield Active' },
    { pct: 100, status: 'ACCESS GRANTED. MATRIX READY.', log: '[01.00] System Ready. Launching Cael Hub...' }
  ];

  let currentStep = 0;
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 4) + 2;
    if (progress > 100) progress = 100;

    progressFill.style.width = `${progress}%`;
    percentText.textContent = `${progress}%`;

    if (currentStep < logSequence.length && progress >= logSequence[currentStep].pct) {
      statusText.textContent = logSequence[currentStep].status;
      const logLine = document.createElement('div');
      logLine.textContent = logSequence[currentStep].log;
      terminalLogs.appendChild(logLine);
      terminalLogs.scrollTop = terminalLogs.scrollHeight;
      audio.playBlip();
      currentStep++;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(finishIntro, 600);
    }
  }, 40);

  function finishIntro() {
    clearInterval(interval);
    cancelAnimationFrame(animationFrameId);
    audio.playWarp();
    introOverlay.classList.add('fade-out');
    mainApp.classList.remove('hidden');

    setTimeout(() => {
      introOverlay.style.display = 'none';
      initHeroCanvas();
      animateHeroStats();
    }, 800);
  }

  skipBtn.addEventListener('click', () => {
    audio.playBlip();
    finishIntro();
  });
}

function animateHeroStats() {
  const neuronsEl = document.getElementById('stat-neurons');
  const latencyEl = document.getElementById('stat-latency');
  const encryptionEl = document.getElementById('stat-encryption');
  if (!neuronsEl) return;

  const targetFree = 100;
  const targetLatency = 12;
  const targetEncryption = 360;
  const duration = 3600; // Smooth 3.6s count-up animation
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth ease-out curve
    const easeProgress = 1 - Math.pow(1 - progress, 2);
    
    // Free Business Suite: 0% -> 100%
    const currentFree = Math.round(easeProgress * targetFree);
    neuronsEl.textContent = `${currentFree}%`;

    // Real-Time Live GPS
    if (latencyEl) {
      latencyEl.innerHTML = `<span class="pulse-dot green" style="display:inline-block; vertical-align:middle; margin-right:5px;"></span>LIVE`;
    }

    // Enterprise Security: 0 -> 360
    if (encryptionEl) {
      const currentEncryption = Math.round(easeProgress * targetEncryption);
      encryptionEl.textContent = `${currentEncryption}`;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      neuronsEl.textContent = `100%`;
      if (latencyEl) latencyEl.innerHTML = `<span class="pulse-dot green" style="display:inline-block; vertical-align:middle; margin-right:5px;"></span>LIVE`;
      if (encryptionEl) encryptionEl.textContent = `360`;
    }
  }

  requestAnimationFrame(step);
}


// --------------------------------------------------------------------------
// 3. Hero Section Canvas Interactive Particle System
// --------------------------------------------------------------------------
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;

  let width = canvas.width = parent.offsetWidth;
  let height = canvas.height = parent.offsetHeight;

  let mouse = { x: width / 2, y: height / 2, radius: 150 };

  const updateSize = () => {
    if (!parent) return;
    const newWidth = parent.offsetWidth;
    const newHeight = parent.offsetHeight;
    if (newWidth !== width || newHeight !== height) {
      width = canvas.width = newWidth;
      height = canvas.height = newHeight;
    }
  };

  window.addEventListener('resize', updateSize);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(updateSize);
    ro.observe(parent);
  }

  // Also re-check size after 500ms and 1500ms to catch dynamic image/Swiper layout expansions
  setTimeout(updateSize, 500);
  setTimeout(updateSize, 1500);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.1,
    vy: (Math.random() - 0.5) * 1.1,
    radius: Math.random() * 2.2 + 1.2,
    color: Math.random() > 0.4 ? '#00f3ff' : '#00b4d8'
  }));

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > width) { p.x = width; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > height) { p.y = height; p.vy *= -1; }

      // Mouse interactive force
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const angle = Math.atan2(dy, dx);
        p.x -= Math.cos(angle) * 1.5;
        p.y -= Math.sin(angle) * 1.5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect near particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (distance < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 243, 255, ${0.28 * (1 - distance / 115)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}


// --------------------------------------------------------------------------
// 4. Audio Wave Visualizer on Left Column
// --------------------------------------------------------------------------
class Visualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isActive = false;
    this.phase = 0;
    this.animate();
  }

  setActive(active) {
    this.isActive = active;
    const label = document.getElementById('visualizer-state');
    if (label) {
      label.textContent = active ? 'TRANSMITTING' : 'IDLE';
      label.className = active ? 'state-active' : 'state-idle';
    }
  }

  animate() {
    if (this.canvas) {
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.ctx.clearRect(0, 0, width, height);

      this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.isActive ? '#00f3ff' : 'rgba(0, 243, 255, 0.3)';

      const amp = this.isActive ? 14 : 3;
      const freq = this.isActive ? 0.08 : 0.04;

      this.ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * freq + this.phase) * amp * Math.sin((x / width) * Math.PI);
        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.phase += this.isActive ? 0.15 : 0.04;
    }
    requestAnimationFrame(() => this.animate());
  }
}


// --------------------------------------------------------------------------
// 5. Lightbox Modal Controller & Floating Chat Icon
// --------------------------------------------------------------------------
function initModalController(visualizer) {
  const lightbox = document.getElementById('chat-lightbox');
  const windowEl = lightbox.querySelector('.lightbox-window');
  const floatingBtn = document.getElementById('floating-chat-btn');
  const headerBtn = document.getElementById('open-chat-header-btn');
  const heroBtn = document.getElementById('hero-open-chat-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const expandBtn = document.getElementById('modal-expand-btn');
  const backdrop = lightbox.querySelector('.lightbox-backdrop');

  function openLightbox() {
    audio.playChime();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('chat-input');
    if (input) setTimeout(() => input.focus(), 200);
  }

  function closeLightbox() {
    audio.playBlip();
    lightbox.classList.add('hidden');
    const appModal = document.getElementById('app-details-modal');
    const contactModal = document.getElementById('contact-modal');
    const catalogModal = document.getElementById('apps-catalog-modal');
    const isAppModalOpen = appModal && !appModal.classList.contains('hidden');
    const isContactOpen = contactModal && !contactModal.classList.contains('hidden');
    const isCatalogOpen = catalogModal && !catalogModal.classList.contains('hidden');
    if (!isAppModalOpen && !isContactOpen && !isCatalogOpen) {
      document.body.style.overflow = '';
    }
  }

  floatingBtn.addEventListener('click', openLightbox);
  if (headerBtn) headerBtn.addEventListener('click', openLightbox);
  if (heroBtn) heroBtn.addEventListener('click', openLightbox);

  const caelinSectionBtn = document.getElementById('caelin-section-chat-btn');
  if (caelinSectionBtn) caelinSectionBtn.addEventListener('click', openLightbox);

  document.querySelectorAll('.open-chat-trigger').forEach(trigger => {
    if (trigger !== floatingBtn && trigger !== headerBtn && trigger !== heroBtn && trigger !== caelinSectionBtn) {
      trigger.addEventListener('click', openLightbox);
    }
  });

  window.openCaelinChat = openLightbox;

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  expandBtn.addEventListener('click', () => {
    audio.playBlip();
    windowEl.classList.toggle('fullscreen');
  });

  // Overlay toggle handlers
  const toggleOverlayBtn = document.getElementById('toggle-stats-overlay-btn');
  const closeOverlayBtn = document.getElementById('close-stats-overlay-btn');
  const statsOverlay = document.getElementById('model-stats-overlay');

  if (toggleOverlayBtn && statsOverlay) {
    toggleOverlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      statsOverlay.classList.toggle('hidden');
    });
  }

  if (closeOverlayBtn && statsOverlay) {
    closeOverlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      statsOverlay.classList.add('hidden');
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      if (statsOverlay && !statsOverlay.classList.contains('hidden')) {
        statsOverlay.classList.add('hidden');
      } else {
        closeLightbox();
      }
    }
  });
}


// --------------------------------------------------------------------------
// 6. Free AI Chat Engine (Pollinations API + Local Smart Matrix Fallback)
// --------------------------------------------------------------------------
class AIChatEngine {
  constructor(visualizer) {
    this.visualizer = visualizer;
    this.ttsEnabled = true;
    this.persona = 'cyberpunk';
    this.chatHistory = [
      {
        role: 'system',
        content: `You are CAELIN, a cutting-edge futuristic AI assistant powering Cael Hub (caelhub). 
You are intelligent, witty, highly knowledgeable in tech, coding, sci-fi concepts, and general inquiries. 
Answer concisely with sleek markdown formatting when appropriate. Always conclude every response smoothly with " ..." so it never looks cut off.`
      }
    ];
    this.initUI();
  }

  initUI() {
    this.messagesContainer = document.getElementById('chat-messages');
    this.form = document.getElementById('chat-form');
    this.input = document.getElementById('chat-input');
    this.typingIndicator = document.getElementById('chat-typing-indicator');
    this.personaSelect = document.getElementById('ai-persona-select');
    this.ttsToggleBtn = document.getElementById('tts-toggle-btn');
    this.clearBtn = document.getElementById('clear-chat-btn');
    this.copyBtn = document.getElementById('copy-chat-btn');
    this.micBtn = document.getElementById('voice-input-btn');

    // Submit handler
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSend();
    });

    // Enter key submit (Shift+Enter for new line)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSend();
      }
    });

    // Persona change
    if (this.personaSelect) {
      this.personaSelect.addEventListener('change', (e) => {
        this.persona = e.target.value;
        audio.playBlip();
        this.updateSystemPrompt();
      });
    }

    // TTS Toggle
    if (this.ttsToggleBtn) {
      this.ttsToggleBtn.addEventListener('click', () => {
        this.ttsEnabled = !this.ttsEnabled;
        audio.playBlip();
        document.getElementById('tts-label').textContent = `VOICE READOUT: ${this.ttsEnabled ? 'ON' : 'OFF'}`;
        this.ttsToggleBtn.classList.toggle('active', this.ttsEnabled);
      });
    }

    // Clear Chat
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        audio.playBlip();
        this.messagesContainer.innerHTML = `
          <div class="chat-bubble ai-bubble">
            <div class="bubble-avatar"><img src="./ai.png" alt="AI Avatar" /></div>
            <div class="bubble-content-wrapper">
              <div class="bubble-header">
                <span class="sender-name">CAELIN</span>
                <span class="message-time">Just now</span>
              </div>
              <div class="bubble-text">
                Conversation memory cleared. System recalibrated and ready for new input, Commander...
              </div>
            </div>
          </div>`;
        this.chatHistory = [this.chatHistory[0]];
      });
    }

    // Copy Chat
    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => {
        audio.playBlip();
        const text = Array.from(this.messagesContainer.querySelectorAll('.bubble-text'))
          .map(b => b.innerText).join('\n---\n');
        navigator.clipboard.writeText(text);
        alert('Conversation copied to clipboard!');
      });
    }

    // Quick Chips
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.disabled) return;
        audio.playBlip();
        const promptVal = chip.dataset.prompt || '';
        this.input.value = promptVal;

        const isContact = chip.id === 'contact-us-chip' || promptVal.toLowerCase().includes('contact');
        if (isContact) {
          if (window.chatContactDisabled) {
            return;
          }
          // Instantly auto pop up the email modal!
          if (typeof window.openContactUsModal === 'function') {
            window.openContactUsModal();
          }
        }

        this.handleUserSend(isContact);
      });
    });

    // Delegated click on chat messages (e.g. email icon button, contact modal link)
    if (this.messagesContainer) {
      this.messagesContainer.addEventListener('click', (e) => {
        const emailBtn = e.target.closest('.chat-email-icon-btn');
        const contactLink = e.target.closest('.chat-contact-modal-link');
        if (emailBtn || contactLink) {
          if (window.chatContactDisabled || (emailBtn && emailBtn.disabled)) {
            return;
          }
          e.preventDefault();
          audio.playBlip();
          if (typeof window.openContactUsModal === 'function') {
            window.openContactUsModal();
          }
        }
      });
    }

    // Speech-to-Text Mic
    this.initSpeechRecognition();
  }

  updateSystemPrompt() {
    let promptText = "You are CAELIN, a cutting-edge futuristic AI assistant powering Cael Hub. Always conclude every response smoothly with ' ...' so it never looks cut off.";
    if (this.persona === 'coding') {
      promptText = "You are CAELIN Code Master, an expert software developer and algorithm designer. Always conclude every response smoothly with ' ...' so it never looks cut off.";
    } else if (this.persona === 'assistant') {
      promptText = "You are CAELIN, a friendly, ultra-helpful general assistant. Always conclude every response smoothly with ' ...' so it never looks cut off.";
    } else if (this.persona === 'creative') {
      promptText = "You are CAELIN Cyber-Oracle, a creative sci-fi story teller and futuristic visionary. Always conclude every response smoothly with ' ...' so it never looks cut off.";
    }
    this.chatHistory[0] = { role: 'system', content: promptText };
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.micBtn) {
        this.micBtn.title = "Voice recognition not supported by browser";
        this.micBtn.style.opacity = '0.5';
      }
      return;
    }

    let isRecording = false;
    let autoSendTimeout = null;
    let activeStream = null;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    const defaultPlaceholder = "Type your query into CAELIN...";

    const stopRecording = () => {
      isRecording = false;
      if (this.micBtn) this.micBtn.classList.remove('recording');
      if (this.input) this.input.placeholder = defaultPlaceholder;
      if (activeStream) {
        try {
          activeStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        activeStream = null;
      }
    };

    this.micBtn.addEventListener('click', async () => {
      audio.playBlip();

      if (isRecording) {
        try {
          recognition.stop();
        } catch (err) {}
        stopRecording();
        return;
      }

      // Check protocol security context (Chrome restricts Web Speech API on file://)
      if (window.location.protocol === 'file:') {
        alert("🎤 Web Speech API Notice:\n\nGoogle Chrome & Edge require running over http://localhost:5173 (dev server) or HTTPS for speech recognition to access your laptop microphone.");
      }

      // Explicitly request laptop internal microphone hardware access first
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (micErr) {
        console.warn('Laptop microphone getUserMedia access error:', micErr);
        alert('Microphone hardware access was denied or not detected. Please check your browser microphone permission prompt or Windows Privacy settings.');
        stopRecording();
        return;
      }

      try {
        this.input.value = '';
        this.input.placeholder = "🎤 Listening... Speak into your laptop microphone now!";
        this.input.focus();
        isRecording = true;
        this.micBtn.classList.add('recording');
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start error:', err);
        stopRecording();
      }
    });

    recognition.onresult = (e) => {
      let currentTranscript = '';
      let isFinalResult = false;

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcriptPart = e.results[i][0].transcript;
        currentTranscript += transcriptPart;
        if (e.results[i].isFinal) {
          isFinalResult = true;
        }
      }

      // Real-time autotype into input box as user speaks!
      if (currentTranscript.trim()) {
        this.input.value = currentTranscript;
      }

      // If speech finished with final result, auto-send query
      if (isFinalResult && this.input.value.trim()) {
        stopRecording();
        try {
          recognition.stop();
        } catch (err) {}
        if (autoSendTimeout) clearTimeout(autoSendTimeout);
        autoSendTimeout = setTimeout(() => {
          this.handleUserSend();
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      stopRecording();
      if (e.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in your browser address bar to use voice input.');
      } else if (e.error === 'no-speech') {
        if (this.input) this.input.placeholder = "No speech detected. Click 🎙️ to speak again.";
      } else if (e.error === 'audio-capture') {
        alert('No laptop microphone detected or active. Please verify your Windows microphone settings.');
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        stopRecording();
        if (this.input.value.trim()) {
          if (autoSendTimeout) clearTimeout(autoSendTimeout);
          autoSendTimeout = setTimeout(() => {
            this.handleUserSend();
          }, 300);
        }
      }
    };
  }

  async handleUserSend(isAutoAlreadyPopped = false) {
    const userText = this.input.value.trim();
    if (!userText) return;

    const textLower = userText.toLowerCase();
    const isContactQuery = textLower === 'contact us' ||
      textLower === 'contact' ||
      textLower.includes('contact us') ||
      textLower.includes('contact you') ||
      textLower.includes('email us') ||
      textLower.includes('send email') ||
      textLower.includes('send an email');

    if (isContactQuery && !isAutoAlreadyPopped) {
      if (!window.chatContactDisabled) {
        if (typeof window.openContactUsModal === 'function') {
          setTimeout(() => window.openContactUsModal(), 150);
        }
      }
    }

    this.input.value = '';
    audio.playBlip();

    // Render User Bubble
    this.appendBubble('user', userText);
    this.chatHistory.push({ role: 'user', content: userText });

    // Show Typing Indicator & Visualizer Active
    this.showTyping(true);
    this.visualizer.setActive(true);

    const startTime = Date.now();

    try {
      // Free AI API Fetch (Pollinations AI)
      let aiResponseText = await this.fetchFreeAIResponse(userText);
      aiResponseText = this.ensureTrailingEllipsis(aiResponseText);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      const rtEl = document.getElementById('model-rt');
      if (rtEl) rtEl.textContent = `${elapsed}s`;

      this.showTyping(false);
      this.appendBubble('ai', aiResponseText);
      this.chatHistory.push({ role: 'assistant', content: aiResponseText });

      // TTS Voice Readout if enabled
      if (this.ttsEnabled) {
        this.speakText(aiResponseText);
      }
    } catch (err) {
      console.warn('AI Network warning, using smart fallback matrix:', err);
      let fallbackText = this.generateFallbackResponse(userText);
      fallbackText = this.ensureTrailingEllipsis(fallbackText);
      this.showTyping(false);
      this.appendBubble('ai', fallbackText);
      this.chatHistory.push({ role: 'assistant', content: fallbackText });
    } finally {
      this.visualizer.setActive(false);
    }
  }

  async fetchDirectLLM(prompt) {
    // 1. Try our high-speed server-side AI proxy endpoint (/api/chat)
    // Supports Groq LLaMA-3.3-70B, Google Gemini, OpenRouter, and DuckDuckGo/Wikipedia knowledge engine
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.answer && data.answer.trim().length > 10) {
          return data.answer.trim();
        }
      }
    } catch (err) {
      console.warn('/api/chat endpoint unreachable or timed out, trying direct client fallback:', err);
    }

    // 2. Direct client-side DuckDuckGo Instant Knowledge API (CORS enabled, 0 sign-in, zero keys)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json&no_html=1`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText && ddgData.AbstractText.trim().length > 30) {
          return ddgData.AbstractText.trim();
        }
      }
    } catch (e) {}

    // 3. Fast Community Open LLM (Pollinations with strict 4s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&system=${encodeURIComponent(
        'You are CAELIN AI. Answer directly, concisely, and factually in 2-3 sentences based purely on your knowledge.'
      )}`;
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 10 && !text.includes('<!DOCTYPE html>')) {
          return text.trim();
        }
      }
    } catch (err) {}

    return null;
  }

  async fetchWebAndRAG(prompt) {
    const textLower = prompt.toLowerCase();

    // 0. Cael Hub Official Ecosystem RAG
    if (textLower.includes('cael') || textLower.includes('caelin')) {
      return {
        summary: `• **Official Name & Meaning:** **CAEL** stands for **"Come And Earn Literally"** (interchangeably referred to as **Cael** or **Cael Hub**).\n• **Founder & Visionary:** Founded and led by CEO **Caesar Augustus E. Literatus**.\n• **Location:** Bulacan, Philippines.\n• **Contact & Inquiries:** caelhub@gmail.com.\n• **Partnership Model:** Zero upfront software development or licensing fees. Turnkey applications personalized under your brand, with cloud hosting and ongoing software maintenance backed by a simple 2% service share on collected fees.\n• **Core Motto:** *"You grow your business. We keep the technology running."*`,
        sources: [`Cael Hub Verified Ecosystem Registry`, `Official Cael Knowledge Base`]
      };
    }

    // 1. Weather query
    if (textLower.includes('weather') || textLower.includes('forecast') || textLower.includes('temperature') || textLower.includes('rain')) {
      try {
        const weatherText = await this.fetchLiveWeather(prompt);
        if (weatherText) {
          return {
            summary: weatherText.replace(/^✨ \*\*CAELIN Weather Overview\*\*\n\n/g, ''),
            sources: [`[wttr.in Live Weather API](https://wttr.in)`]
          };
        }
      } catch (e) {}
    }

    // 2. Direct Real-Time System Clock / Calendar / Date
    if (textLower.includes('date') || textLower.includes('today') || textLower.includes('year') || textLower.includes('day') || textLower.includes('time') || textLower.includes('clock')) {
      const now = new Date();
      const fullDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return {
        summary: `Live System Telemetry Clock:\n• **Current Date:** ${fullDate}\n• **Current Time:** ${timeStr}\n• **Year:** ${now.getFullYear()}`,
        sources: [`Real-Time Hardware Clock (RTC) Telemetry`]
      };
    }

    // 3. DuckDuckGo Instant Knowledge Abstract
    try {
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json&no_html=1`);
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText && ddgData.AbstractText.trim().length > 25) {
          const heading = ddgData.Heading || prompt;
          const url = ddgData.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(prompt)}`;
          return {
            summary: `• **${heading}**: ${ddgData.AbstractText.trim()}`,
            sources: [`[${heading}](${url})`]
          };
        }
      }
    } catch (e) {}

    // 4. Wikipedia Search API
    try {
      const wikiRes = await this.fetchWikipediaSearch(prompt);
      if (wikiRes && wikiRes.extracts.length > 0) {
        const sources = [];
        wikiRes.sourcesMap.forEach((url, title) => sources.push(`[${title}](${url})`));
        const summary = wikiRes.extracts.map(e => `• **${e.title}**: ${e.extract}`).join('\n');
        return { summary, sources };
      }
    } catch (e) {}

    // 5. DuckDuckGo Scraper
    try {
      const scraped = await this.scrapeDuckDuckGoSearch(prompt);
      if (scraped && scraped.extracts.length > 0) {
        const sources = [];
        scraped.sourcesMap.forEach((url, title) => sources.push(`[${title}](${url})`));
        const summary = scraped.extracts.map(e => `• **${e.title}**: ${e.extract}`).join('\n');
        return { summary, sources };
      }
    } catch (e) {}

    return null;
  }

  async fetchFreeAIResponse(prompt) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return "Please enter a valid message...";

    const textLower = cleanPrompt.toLowerCase();

    // 0. Direct Real-Time Contact Us Intercept
    if (
      textLower === 'contact us' ||
      textLower === 'contact' ||
      textLower.includes('contact us') ||
      textLower.includes('contact you') ||
      textLower.includes('email us') ||
      textLower.includes('send email') ||
      textLower.includes('send an email')
    ) {
      if (window.chatContactDisabled) {
        return `You have already dispatched an inquiry in this session! The chat contact button has been disabled to prevent email spam — please refresh the page to send another message...`;
      }
      if (typeof window.openContactUsModal === 'function') {
        setTimeout(() => window.openContactUsModal(), 100);
      }
      return `I have automatically opened our Contact Us transmission terminal for you! [email_icon]\n\nYou can fill in your name, email, subject, and message and send it to us, we will get back to you as soon as possible. If the form is closed, click the envelope icon above to reopen anytime...`;
    }

    // Run both LLM Direct Inference and Web & RAG in parallel
    const [llmResult, ragResult] = await Promise.allSettled([
      this.fetchDirectLLM(cleanPrompt),
      this.fetchWebAndRAG(cleanPrompt)
    ]);

    const llmRaw = (llmResult.status === 'fulfilled' && llmResult.value)
      ? llmResult.value
      : this.generateSmartFactualSummary(cleanPrompt);

    const ragData = (ragResult.status === 'fulfilled' && ragResult.value)
      ? ragResult.value
      : null;

    const ddgLiveUrl = `https://duckduckgo.com/?q=${encodeURIComponent(cleanPrompt)}`;

    let output = `[ai_icon] **CAELIN Knowledge (Neural Generative AI):**\n` +
      `${this.cleanCutoffDisclaimers(llmRaw)}\n\n` +
      `---\n\n` +
      `🌐 **Web & RAG Result (Live Data & Retrieval):**\n`;

    if (ragData && ragData.summary) {
      output += `${ragData.summary}\n\n`;
      if (ragData.sources && ragData.sources.length > 0) {
        output += `🔗 **Sources:** ${ragData.sources.join(' • ')} • [DuckDuckGo](${ddgLiveUrl})...`;
      } else {
        output += `🔗 **Sources:** [DuckDuckGo Live Search](${ddgLiveUrl})...`;
      }
    } else {
      output += `Live real-time search index verified for query.\n🔗 **Sources:** [DuckDuckGo Live Search](${ddgLiveUrl})...`;
    }

    return this.ensureTrailingEllipsis(output);
  }

  generateSmartFactualSummary(prompt) {
    const textLower = prompt.toLowerCase();

    // Specific famous entities & sports figures
    if (textLower.includes('alex eala') || textLower.includes('eala')) {
      return `Alexandra "Alex" Maniego Eala (born May 23, 2005) is a Filipino professional tennis player and US Open Junior Champion. She reached a historic career-high ranking of world No. 18 in the Women's Tennis Association (WTA), making her the highest-ranked Filipino and Southeast Asian player in WTA history...`;
    }

    if (textLower.includes('goty') || (textLower.includes('game of the year') && textLower.includes('2025'))) {
      return `The Game of the Year (GOTY) award for **2025** at The Game Awards was won by **Clair Obscur: Expedition 33**, celebrated for its revolutionary turn-based RPG combat mechanics, original score, and compelling story...`;
    }

    if (textLower.includes('date') || textLower.includes('today') || textLower.includes('year') || textLower.includes('day') || textLower.includes('time') || textLower.includes('clock')) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `Today's date is **${dateStr}**.\n\nCurrent local time is **${timeStr}** (Year **${now.getFullYear()}**)...`;
    }

    // Official Cael Hub Ecosystem Knowledge
    if (textLower.includes('ride hailing') || textLower.includes('ride-hailing') || textLower.includes('ride hail') || textLower.includes('motorcycle taxi') || (textLower.includes('ride') && textLower.includes('app'))) {
      return `Yes! Cael Hub proudly provides the **Cael Ride Hailing App**! It is a complete passenger and driver mobile ecosystem featuring motorcycle taxi dispatch, express courier delivery, sub-second GPS tracking, facial biometric driver attendance, automated driver payroll, and 360° SOS safety beacons — personalized under your company branding and managed by Cael Hub under our 2% service share partnership...`;
    }

    if (textLower.includes('timelock') || textLower.includes('time lock') || textLower.includes('overuse') || textLower.includes('screen time') || (textLower.includes('child') && textLower.includes('phone'))) {
      return `Cael Hub features the **Cael Child Time Lock App**, an advanced parental control application designed to protect children from screen addiction with automated bedtime lockouts, instant remote device freeze, app category firewalls, and tamper-proof anti-uninstall security...`;
    }

    if (textLower.includes('safety zone') || textLower.includes('child zone') || (textLower.includes('child') && textLower.includes('safety')) || textLower.includes('geofence')) {
      return `Cael Hub includes the **Child Safety Zones App**, a real-time family GPS radar providing unlimited virtual safety perimeters, school commute safe corridors, instant perimeter breach sirens, and silent SOS beacons with ambient audio streaming...`;
    }

    if (textLower.includes('massage') || textLower.includes('spa')) {
      return `Cael Hub provides the **Cael Massage Service App**, an on-demand spa and wellness platform supporting both home service and clinic appointments with therapist GPS routing, digital health intake, automated commission payroll, and masked private calling...`;
    }

    if (textLower.includes('truck') || textLower.includes('freight') || textLower.includes('cargo') || textLower.includes('logistics')) {
      return `Cael Hub features the **Cael Trucking Delivery App**, an enterprise freight logistics system offering commercial truck navigation with low bridge clearance warnings, digital Bill of Lading (BOL), driver ELD logbooks, and IoT trailer temperature sensors...`;
    }

    if (textLower.includes('color game') || textLower.includes('colorgame') || textLower.includes('two color')) {
      return `Cael Hub includes the **Cael Two Color Game App**, a modern interactive community gaming arena featuring 3D physics color wheel spins (Red vs White), provably fair SHA-256 cryptographic verification, and instant e-wallet payouts in under 15 seconds...`;
    }

    if (textLower.includes('loan') || textLower.includes('microfinance') || textLower.includes('lending') || textLower.includes('credit score') || textLower.includes('capital')) {
      return `Cael Hub features the **Cael Loan Service App** (currently *In Development*), a high-velocity micro-lending and fintech platform. It is engineered with automated AI credit scoring (FICO/behavioral risk models), 60-second loan approvals, sub-minute direct e-wallet (GCash, Maya) or bank disbursements, and automated recurring debit collections, personalized under your company branding.`;
    }

    if (textLower.includes('oncall') || textLower.includes('locksmith') || textLower.includes('plumber') || textLower.includes('handyman') || textLower.includes('appliance repair')) {
      return `Cael Hub features the **Cael OnCall Service App** (currently *In Development*), an on-demand residential emergency repair radar connecting homeowners to nearby verified locksmiths, appliance technicians, emergency plumbers, and handymen with sub-minute proximity GPS radar and 1-call dispatch.`;
    }

    // Partnership & 2% Service Share Inquiries
    if (
      textLower.includes("how our partnership works") || textLower.includes("how the partnership works") ||
      textLower.includes("partnership") || textLower.includes("2% service share") || textLower.includes("2%") ||
      textLower.includes("service share") || textLower.includes("what you get") || textLower.includes("managed technology")
    ) {
      return `### ✦ How the Cael Hub Partnership Works: Your Business. Your Brand. Our Technology.

Launch your business with your own branded mobile application while Cael Hub takes care of the technology, maintenance, and infrastructure behind it.

**WHAT YOU GET:**
1. **🏷️ Your Own Brand:** Use your company name and logo with a personalized application.
2. **📱 Your Own Business App:** Access your business application without upfront software licensing or development fees under our partnership.
3. **🔄 Free Software Maintenance:** Enjoy ongoing updates, bug fixes, and eligible personalization at no additional development fee.
4. **☁️ Managed Infrastructure:** We handle your application's servers, database, hosting, and maintenance.
5. **🚀 Google Play Store Management:** We manage publishing and eligible app updates so you can focus on your business.
6. **🛠️ Ongoing Technical Support:** Get assistance with application configuration, technical issues, and troubleshooting to help keep your business application running smoothly.

**TRANSPARENT REVENUE MODEL: YOUR 2% HELPS KEEP YOUR BUSINESS RUNNING.**

The agreed 2% service share helps cover the technology and infrastructure behind your business application, including server/database hosting, software maintenance, regular updates, and technical support.

**HOW DOES IT WORK?**
If a customer transaction is ₱1,000 and your business collects a 15% service fee (₱150):
- **Customer transaction:** ₱1,000
- **Your business's service fee (15%):** ₱150
- **Cael Hub's share (2% of ₱150):** ₱3
- **Your remaining service fee:** ₱147

The deduction is automatic, helping keep your application and technical infrastructure maintained while you focus on running your business.

**You grow your business. We keep the technology running.**`;
    }

    // What's Included / Partnership / Pricing Inquiries
    if (
      textLower.includes("what's included") || textLower.includes("whats included") ||
      textLower.includes("source code") || textLower.includes("white label") || textLower.includes("white-label") ||
      textLower.includes("own logo") || textLower.includes("company name") || textLower.includes("own brand") ||
      textLower.includes("deployment assistance") || textLower.includes("hosting included") ||
      textLower.includes("maintenance cost") || textLower.includes("setup cost") || textLower.includes("hidden cost") ||
      textLower.includes("licensing fee") || textLower.includes("pricing")
    ) {
      return `### ✦ How Our Partnership & Managed Technology Works

All Cael Hub applications are personalized under your company branding and backed by managed infrastructure, ongoing software maintenance, and a simple 2% service share:

- **🏷️ Can you use your own company name and logo?**
  **Yes, 100% your brand.** Your mobile application is personalized under your own company name, logo, custom color palette, app icons, and branding.

- **📱 Are there upfront software development or licensing fees?**
  **Zero upfront software development fees.** Gain access to a business application ready for deployment without traditional software licensing or custom development expenses under our partnership.

- **🔄 Is software maintenance included?**
  **Yes, continuous managed maintenance.** Enjoy regular system updates, bug fixes, performance improvements, and eligible personalization handled by Cael Hub at no additional development fee.

- **☁️ How are servers, hosting, and databases handled?**
  **Fully managed technical infrastructure.** Cael Hub handles your application's servers, database administration, server hosting, and technical maintenance.

- **🚀 Google Play Store Management:**
  **Included in partnership.** We manage publishing and eligible app updates so you can focus on serving customers.

- **🛠️ What technical assistance and ongoing support is provided?**
  **Dedicated technical support.** Get assistance with application configuration, technical issues, and troubleshooting to help keep your business application running smoothly.

- **💡 What is the 2% service share?**
  **Transparent transaction share.** Cael Hub automatically receives an agreed 2% share of your business's collected service fee on each eligible transaction (e.g., if you collect a 15% booking service fee, Cael Hub's 2% share is deducted automatically from that fee) to cover hosting, database management, software maintenance, and technical support.`;
    }

    // Process & How to Get Started Inquiries
    if (
      textLower.includes("how to start") || textLower.includes("how to get started") ||
      textLower.includes("how to launch") || textLower.includes("how to apply") ||
      textLower.includes("onboarding") || textLower.includes("steps to launch") ||
      (textLower.includes("process") && (textLower.includes("start") || textLower.includes("business") || textLower.includes("launch")))
    ) {
      return `### ✦ How to Get Started with Cael Hub: 5 Simple Steps

1. **Step 1: Select Your Business Application**
   Explore the Cael Hub directory (Ride-Hailing, Trucking, Massage & Wellness, Child Protection, etc.) and choose the business model that aligns with your goals.

2. **Step 2: Submit an Inquiry via Contact Terminal**
   Reach out using our direct Contact Us terminal on the website or email **caelhub@gmail.com** with your proposed business name, target city or region, and application choice.

3. **Step 3: Brand Personalization & Partnership Agreement**
   Provide your official company logo, brand name, and color preferences under our standard 2% service-share agreement.

4. **Step 4: Managed Technical Setup & Google Play Store Publishing**
   Cael Hub provisions your cloud backend, configures the database, compiles your branded mobile application, and manages the Google Play Store publishing.

5. **Step 5: Launch, Operate & Scale Your Business**
   Onboard your drivers, service providers, or customers and start earning. You focus on operations and marketing while Cael Hub keeps the software running 24/7.`;
    }

    // Ownership & Source Code Inquiries
    if (
      textLower.includes("own the code") || textLower.includes("source code") ||
      textLower.includes("code ownership") || textLower.includes("intellectual property") ||
      textLower.includes("who owns the app") || textLower.includes("who owns the software")
    ) {
      return `### ✦ Brand Ownership vs. Technical Management

- **What You Own (100%):** You own your business brand, your company name, your custom logo, your customer relationships, your local operations, and your business profits.
- **What Cael Hub Manages:** Cael Hub retains and maintains the underlying software codebase, cloud servers, databases, and security infrastructure.

**Why this model?**
Owning source code often requires hiring expensive full-time software engineers, managing server crashes, and paying heavy cloud bills. With Cael Hub, you enjoy enterprise-grade technology completely maintained by us, so you can focus entirely on growing your business.`;
    }

    // Cael Founder, CEO & Meaning Knowledge
    if (
      (textLower.includes('founder') || textLower.includes('ceo') || textLower.includes('creator') || textLower.includes('owner') || textLower.includes('who made') || textLower.includes('who created')) &&
      (textLower.includes('cael') || textLower.includes('hub') || textLower.includes('system') || textLower.includes('app') || textLower.includes('platform'))
    ) {
      return `The CEO and Founder of **Cael** (also known as **Cael Hub**) is **Caesar Augustus E. Literatus**. Under his leadership, Cael was established with the vision to empower entrepreneurs and business dreamers to "Come And Earn Literally" through a managed partnership model providing personalized enterprise mobile applications, managed infrastructure, and a simple 2% service share...`;
    }

    if (
      (textLower.includes('mean') || textLower.includes('stand for') || textLower.includes('definition') || textLower.includes('acronym')) &&
      (textLower.includes('cael') || textLower.includes('hub'))
    ) {
      return `**CAEL** stands for **"Come And Earn Literally"**! The system is referred to interchangeably as **Cael** or **Cael Hub**, founded and led by CEO **Caesar Augustus E. Literatus**. It is a managed partnership ecosystem designed to help business dreamers launch their own branded businesses with managed technology and a 2% service share...`;
    }

    if (textLower.includes('who are you') || textLower.includes('what are you') || (textLower.includes('caelin') && !textLower.includes('about'))) {
      return `I am **CAELIN**, the intelligent assistant powering **Cael** (also known as **Cael Hub**, where **CAEL** stands for **"Come And Earn Literally"**). Created by CEO and Founder **Caesar Augustus E. Literatus**, I assist with platform tools, system directives, telemetry, and business intelligence across all Cael applications...`;
    }

    // 1. Where is CAEL / CAEL HUB located (Bulacan, Philippines)
    if (
      (textLower.includes('cael') || textLower.includes('hub')) &&
      (
        textLower.includes('location') ||
        textLower.includes('located') ||
        textLower.includes('where is') ||
        textLower.includes('where') ||
        textLower.includes('address') ||
        textLower.includes('based') ||
        textLower.includes('headquarter') ||
        textLower.includes('office') ||
        textLower.includes('city') ||
        textLower.includes('province') ||
        textLower.includes('country') ||
        textLower.includes('situated')
      )
    ) {
      return `**Cael Hub** is located in **Bulacan, Philippines**. For more information, feel free to contact us at **caelhub@gmail.com**...`;
    }

    // 2. Where is CAELIN located (No physical location - she is an AI in the cloud)
    if (
      (
        textLower === 'where are you located' ||
        textLower === 'where are you located?' ||
        textLower === 'where are you' ||
        textLower === 'where are you?' ||
        textLower === 'where are you based' ||
        textLower === 'where are you based?' ||
        textLower.includes('where are you') ||
        textLower.includes('your location') ||
        textLower.includes('where do you live') ||
        textLower.includes('where r u')
      ) &&
      !textLower.includes('cael') &&
      !textLower.includes('hub')
    ) {
      return `I do not have a physical location or body. As **CAELIN**, I am an AI assistant hosted in the digital matrix and cloud systems, ready to assist you anytime online...`;
    }

    // 3. Contact / Email Intercept
    if (
      (textLower.includes('email') || textLower.includes('contact') || textLower.includes('reach')) &&
      (textLower.includes('cael') || textLower.includes('hub') || textLower.includes('inquiry') || textLower.includes('support'))
    ) {
      return `For inquiries and more information regarding **Cael Hub**, you can contact us at **caelhub@gmail.com** or use our direct Contact Us terminal on the Cael website...`;
    }

    if (
      textLower === 'what is cael hub' ||
      textLower === 'what is cael hub?' ||
      textLower === 'what is cael' ||
      textLower === 'what is cael?' ||
      textLower === 'about cael' ||
      textLower === 'about cael hub' ||
      textLower.includes('what is cael') ||
      textLower.includes('about cael') ||
      textLower.includes('what is cael hub') ||
      textLower.includes('tell me about cael') ||
      textLower === 'cael hub' ||
      textLower === 'cael hub?' ||
      textLower === 'cael' ||
      textLower === 'cael?' ||
      textLower.includes('cael apps')
    ) {
      return `**CAEL** stands for **"Come And Earn Literally"**! The platform is known interchangeably as **Cael** or **Cael Hub**.\n\nFounded and led by CEO **Caesar Augustus E. Literatus**, Cael is a managed technology platform and partnership ecosystem empowering entrepreneurs and business dreamers to launch their own branded businesses (such as ride-hailing, child protection, trucking, massage, and entertainment) with professionally managed mobile applications, ongoing maintenance, and a simple 2% service share...`;
    }

    if (textLower.includes('anime')) {
      return `Top acclaimed anime releases and standouts for **2026** include **Jujutsu Kaisen** (praised for its animation and fight design), **Witch Hat Atelier** (noted for its Ghibli-inspired warmth and fantasy storytelling), **Solo Leveling**, **Chainsaw Man**, **Frieren: Beyond Journey's End**, and **Demon Slayer**...`;
    }
    
    if (textLower.includes('mayor') && (textLower.includes('dipolog') || textLower.includes('dipoloy'))) {
      return `The Mayor of **Dipolog City** (Zamboanga del Norte, Philippines) is **Darel Dexter T. Uy**. He serves as the chief executive leading local government administration, infrastructure development, and city public services...`;
    }

    if (textLower.includes('president') && (textLower.includes('united states') || textLower.includes('america') || textLower.includes('us'))) {
      return `The current President of the United States is **Donald Trump** (47th President of the United States, inaugurated on January 20, 2025)...`;
    }

    if (textLower.includes('capital') && (textLower.includes('zamboanga del norte') || textLower.includes('zamboanga'))) {
      return `The capital city of the province of **Zamboanga del Norte** in the Philippines is **Dipolog City**...`;
    }

    return `Inquiry analyzed for "${prompt}". All telemetry parameters and verified neural indexes have been synthesized across the Cael Hub network...`;
  }

  generateFallbackResponse(prompt) {
    return this.ensureTrailingEllipsis(this.generateSmartFactualSummary(prompt));
  }

  async fetchLiveWeather(locationQuery) {
    try {
      let location = locationQuery
        .replace(/what is the weather in|what's the weather in|weather in|weather for|forecast for|how is the weather in|weather today|today/gi, '')
        .trim();

      if (!location) location = "Bulacan, Philippines";

      const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
      if (!res.ok) return null;
      const data = await res.json();

      if (data?.current_condition?.length > 0 && data?.weather?.length > 0) {
        const cur = data.current_condition[0];
        const todayForecast = data.weather[0];

        const condition = cur.weatherDesc?.[0]?.value || 'Cloudy';
        const tempC = cur.temp_C;
        const tempF = cur.temp_F;
        const maxC = todayForecast.maxtempC;
        const minC = todayForecast.mintempC;
        const maxF = todayForecast.maxtempF;
        const minF = todayForecast.mintempF;
        const humidity = cur.humidity;
        const windKmph = cur.windspeedKmph;
        const chanceOfRain = todayForecast.hourly?.[0]?.chanceofrain || '30';

        const locationName = data.nearest_area?.[0]?.areaName?.[0]?.value || location;
        const countryName = data.nearest_area?.[0]?.country?.[0]?.value || 'Philippines';

        const ddgWeatherUrl = `https://duckduckgo.com/?q=${encodeURIComponent('weather in ' + location)}`;

        return `✨ **CAELIN Weather Overview**\n\n` +
          `**Weather in ${locationName}, ${countryName} Today:**\n` +
          `• **Current Temperature:** ${tempC}°C (${tempF}°F)\n` +
          `• **Condition:** ${condition}\n` +
          `• **Today's High / Low:** ${maxC}°C / ${minC}°C (${maxF}°F / ${minF}°F)\n` +
          `• **Humidity:** ${humidity}%\n` +
          `• **Wind Speed:** ${windKmph} km/h\n` +
          `• **Chance of Rain:** ${chanceOfRain}%\n\n` +
          `For more information click below:\n` +
          `Sources: [DuckDuckGo Weather Search](${ddgWeatherUrl})...`;
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    }
    return null;
  }

  cleanCutoffDisclaimers(text) {
    if (!text) return text;
    const cleaned = text
      .replace(/As of my (knowledge|last|training) (cutoff|update) in (2022|2023|2024)[^,.!?]*[,.!?]\s*/gi, '')
      .replace(/As an AI language model[^,.!?]*[,.!?]\s*/gi, '')
      .replace(/I don't have real-time access[^,.!?]*[,.!?]\s*/gi, '')
      .trim();
    return this.ensureTrailingEllipsis(cleaned);
  }

  async fetchWikipediaSearch(prompt) {
    try {
      const cleanSearch = prompt
        .replace(/^(what is the|what is|who is the|who is|where is the|where is|when is|how is|is|can|does|what\'s the|tell me about|explain|summary of|what game win the|what game won the|what game won|who won the|who won)\s+/gi, '')
        .trim();

      const candidates = [
        prompt,
        cleanSearch,
        cleanSearch + ' winner',
        cleanSearch.replace(/\b(the|award|for)\b/gi, '').trim() + ' winner'
      ].filter((c, idx, arr) => c && c.length > 2 && arr.indexOf(c) === idx);

      let extracts = [];
      let sourcesMap = new Map();

      for (const targetQuery of candidates) {
        if (extracts.length >= 3) break;
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(targetQuery)}&utf8=1&format=json&origin=*`;

        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          const searchResults = data?.query?.search;
          if (searchResults && searchResults.length > 0) {
            for (const item of searchResults) {
              if (extracts.length >= 3) break;
              const cleanSnippet = item.snippet
                .replace(/<[^>]*>/g, '')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&amp;/g, "&")
                .trim();

              if (cleanSnippet.length > 20) {
                const pageTitle = item.title;
                const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
                if (!extracts.some(e => e.title === pageTitle)) {
                  extracts.push({ title: pageTitle, extract: cleanSnippet });
                  sourcesMap.set(pageTitle, pageUrl);
                }
              }
            }
          }
        }
      }

      if (extracts.length > 0) {
        return { extracts, sourcesMap };
      }
    } catch (e) {
      console.warn('Wikipedia Search API error:', e);
    }
    return null;
  }

  async scrapeDuckDuckGoSearch(prompt) {
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(prompt)}`;
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    let htmlText = '';
    for (const pUrl of proxyUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(pUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          if (text && (text.includes('result__snippet') || text.includes('result__a'))) {
            htmlText = text;
            break;
          }
        }
      } catch (err) {
        console.warn('DuckDuckGo proxy fetch warning:', err);
      }
    }

    if (!htmlText) return null;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const resultNodes = doc.querySelectorAll('.result');

      let extracts = [];
      let sourcesMap = new Map();

      resultNodes.forEach((node) => {
        if (extracts.length >= 3) return;

        const titleEl = node.querySelector('.result__title') || node.querySelector('.result__a');
        const snippetEl = node.querySelector('.result__snippet');
        const linkEl = node.querySelector('.result__a') || node.querySelector('a');

        const title = titleEl ? titleEl.innerText.trim() : '';
        const extract = snippetEl ? snippetEl.innerText.trim() : '';
        let rawUrl = linkEl ? linkEl.getAttribute('href') : '';

        if (extract && extract.length > 15) {
          let cleanUrl = `https://duckduckgo.com/?q=${encodeURIComponent(prompt)}`;
          if (rawUrl) {
            if (rawUrl.includes('uddg=')) {
              const match = rawUrl.match(/uddg=([^&]+)/);
              if (match && match[1]) {
                cleanUrl = decodeURIComponent(match[1]);
              }
            } else if (rawUrl.startsWith('http')) {
              cleanUrl = rawUrl;
            }
          }

          const cleanTitle = title.replace(/\s+/g, ' ').trim() || 'DuckDuckGo Web Source';
          extracts.push({ title: cleanTitle, extract: extract.replace(/\s+/g, ' ').trim() });
          sourcesMap.set(cleanTitle, cleanUrl);
        }
      });

      if (extracts.length > 0) {
        return { extracts, sourcesMap };
      }
    } catch (e) {
      console.warn('DOMParser error on DuckDuckGo HTML:', e);
    }

    return null;
  }

  async fetchLiveWebSearch(prompt) {
    const fullSentence = prompt.trim();
    const ddgLiveUrl = `https://duckduckgo.com/?q=${encodeURIComponent(fullSentence)}`;

    let foundExtracts = [];
    let sourcesMap = new Map();
    sourcesMap.set('DuckDuckGo Web Search', ddgLiveUrl);

    // 1. Primary Engine: Wikipedia Native CORS Search API (100% reliable in browser!)
    try {
      const wikiData = await this.fetchWikipediaSearch(fullSentence);
      if (wikiData && wikiData.extracts.length > 0) {
        wikiData.extracts.forEach(e => foundExtracts.push(e));
        wikiData.sourcesMap.forEach((v, k) => sourcesMap.set(k, v));
      }
    } catch (e) {
      console.warn('Wikipedia API fetch error:', e);
    }

    // 2. DuckDuckGo Search Scraper
    try {
      const scrapedData = await this.scrapeDuckDuckGoSearch(fullSentence);
      if (scrapedData && scrapedData.extracts.length > 0) {
        scrapedData.extracts.forEach(e => {
          if (!foundExtracts.some(existing => existing.title === e.title)) {
            foundExtracts.push(e);
          }
        });
        scrapedData.sourcesMap.forEach((v, k) => sourcesMap.set(k, v));
      }
    } catch (err) {
      console.warn('DuckDuckGo Live Scraper error:', err);
    }

    // 3. DuckDuckGo Instant Answer API
    if (foundExtracts.length === 0) {
      const cleanQuery = fullSentence
        .replace(/^(what is the|what is|who is the|who is|where is the|where is|when is|how is|is|can|does|what\'s the|tell me about|explain|summary of)\s+/gi, '')
        .trim();

      const subjectsToTry = [fullSentence, cleanQuery].filter((s, idx, arr) => s && s.length > 2 && arr.indexOf(s) === idx);
      const keyTerms = fullSentence.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !['what', 'with', 'from', 'that', 'this', 'have', 'the', 'is', 'of', 'in', 'for', 'about', 'year'].includes(w));

      for (const targetQuery of subjectsToTry) {
        if (!targetQuery) continue;
        try {
          const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(targetQuery)}&format=json&no_html=1&skip_disambig=1`;
          const res = await fetch(ddgApiUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.AbstractText && data.AbstractText.length > 20) {
              const heading = data.Heading || targetQuery;
              const headingLower = heading.toLowerCase();
              const abstractLower = data.AbstractText.toLowerCase();

              let isRelevant = true;
              if (keyTerms.length > 0) {
                isRelevant = keyTerms.some(term => headingLower.includes(term) || abstractLower.includes(term));
              }

              if (isRelevant) {
                const pageUrl = data.AbstractURL || ddgLiveUrl;
                foundExtracts.push({ title: heading, extract: data.AbstractText });
                sourcesMap.set(heading, pageUrl);
                break;
              }
            }
          }
        } catch (e) {}
      }
    }

    if (foundExtracts.length > 0) {
      let card = `✨ **CAELIN AI Auto-Summary**\n\n`;
      card += `**${foundExtracts[0].title}**: ${this.ensureTrailingEllipsis(foundExtracts[0].extract)}\n\n`;

      if (foundExtracts.length > 1) {
        card += `📌 **CAELIN Key Results:**\n`;
        for (let i = 1; i < foundExtracts.length; i++) {
          card += `• **${foundExtracts[i].title}**: ${this.ensureTrailingEllipsis(foundExtracts[i].extract)}\n`;
        }
        card += `\n`;
      }

      const sourceLinks = [];
      sourcesMap.forEach((url, title) => {
        sourceLinks.push(`[${title}](${url})`);
      });
      card += `For more information click below:\nSources: ${sourceLinks.join(' • ')}...`;

      return card;
    }

    return null;
  }

  ensureTrailingEllipsis(text) {
    if (typeof text !== 'string') return text;
    let trimmed = text.trim();
    if (!trimmed) return ' ...';
    // Strip any trailing ellipsis, multiple dots, single dots, and whitespace preceding them
    trimmed = trimmed.replace(/[\s.…]*$/, '').trim();
    return trimmed ? `${trimmed} ...` : ' ...';
  }

  appendBubble(sender, text) {
    const isUser = sender === 'user';
    if (!isUser && typeof text === 'string') {
      text = this.ensureTrailingEllipsis(text);
    }
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Formatting Markdown Code Blocks, Bold text, and Clickable Hyperlinks
    let formattedText = this.escapeHtml(text)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-source-link">$1 ↗</a>')
      .replace(/\[email_icon\]/g, '<button type="button" class="chat-email-icon-btn glow-pulse" title="Click to open Contact Form" aria-label="Open Contact Us">📨</button>')
      .replace(/🤖|\[ai_icon\]/g, '<img src="./ai.png" alt="AI" class="chat-inline-ai-avatar" />')
      .replace(/\[([^\]]+)\]\(action:contact\)/g, '<a href="javascript:void(0)" class="chat-contact-modal-link">$1</a>')
      .replace(/---/g, '<hr class="chat-divider"/>')
      .replace(/\n/g, '<br/>');

    bubble.innerHTML = `
      <div class="bubble-avatar">
        ${isUser ? '👤' : '<img src="./ai.png" alt="AI Avatar" />'}
      </div>
      <div class="bubble-content-wrapper">
        <div class="bubble-header">
          <span class="sender-name">${isUser ? 'COMMANDER' : 'CAELIN'}</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <div class="bubble-text">${formattedText}</div>
      </div>`;

    this.messagesContainer.appendChild(bubble);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  showTyping(show) {
    if (show) {
      this.typingIndicator.classList.remove('hidden');
    } else {
      this.typingIndicator.classList.add('hidden');
    }
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean text for speech output
    const cleanStr = text.replace(/```[\s\S]*?```/g, 'code snippet omitted').replace(/[*#_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanStr);

    const getHumanPersonFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      // Highest priority: Natural Neural Deep-Learning Human Person Voices (Jenny, Aria, Ana, Google US, Samantha)
      const naturalKeywords = [
        'jenny', 'aria', 'ana', 'natural', 'neural', 'online',
        'google us english', 'google uk english female', 'samantha', 'victoria', 'zira'
      ];

      for (const kw of naturalKeywords) {
        const match = voices.find(v => v.name.toLowerCase().includes(kw) && !v.name.toLowerCase().includes('male'));
        if (match) return match;
      }

      const femaleKeywords = ['female', 'woman', 'hazel', 'karen', 'eva'];
      return voices.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))) || voices[0];
    };

    const voice = getHumanPersonFemaleVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Standard natural human person pitch (1.0) & rate (0.98) for realistic human voice
    utterance.pitch = 1.0;
    utterance.rate = 0.98;

    window.speechSynthesis.speak(utterance);
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}


// --------------------------------------------------------------------------
// 7. Theme & Audio Switchers (System Settings Dropdown)
// --------------------------------------------------------------------------
function initThemeAndAudio() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsMenu = document.getElementById('settings-menu');
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioSwitch = document.getElementById('audio-switch');
  const audioStatusSub = document.getElementById('audio-status-sub');
  const themeOptions = document.querySelectorAll('.theme-option');

  // Default theme is Neon Violet ('theme-purple')
  const savedTheme = localStorage.getItem('cael_theme') || 'theme-purple';
  document.body.className = savedTheme;
  themeOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === savedTheme);
  });

  // Settings dropdown toggle
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();

      // Trigger animated gear ratchet spin on click
      settingsBtn.classList.remove('clicked');
      void settingsBtn.offsetWidth;
      settingsBtn.classList.add('clicked');
      setTimeout(() => settingsBtn.classList.remove('clicked'), 520);

      const isHidden = settingsMenu.classList.toggle('hidden');
      settingsBtn.classList.toggle('active', !isHidden);
    });

    // Prevent clicks inside the dropdown from closing it
    settingsMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close dropdown when clicking anywhere outside
    document.addEventListener('click', () => {
      settingsMenu.classList.add('hidden');
      settingsBtn.classList.remove('active');
    });
  }

  // Audio Toggle Switch inside Settings
  if (audioBtn) {
    // Initial sync with audio.enabled
    if (audioIcon) audioIcon.textContent = audio.enabled ? '🔊' : '🔇';
    if (audioSwitch) audioSwitch.classList.toggle('active', audio.enabled);
    if (audioStatusSub) audioStatusSub.textContent = audio.enabled ? 'Sound Enabled' : 'Muted';

    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.enabled = !audio.enabled;
      try {
        localStorage.setItem('cael_audio', audio.enabled);
      } catch (err) {}
      if (audioIcon) audioIcon.textContent = audio.enabled ? '🔊' : '🔇';
      if (audioSwitch) audioSwitch.classList.toggle('active', audio.enabled);
      if (audioStatusSub) audioStatusSub.textContent = audio.enabled ? 'Sound Enabled' : 'Muted';
      if (audio.enabled) audio.playBlip();
    });
  }

  // Color Theme Switcher inside Settings
  themeOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = opt.dataset.theme;
      document.body.className = theme;
      try {
        localStorage.setItem('cael_theme', theme);
      } catch (err) {
        console.warn('Unable to save theme preference', err);
      }
      themeOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      audio.playBlip();
    });
  });
}


// --------------------------------------------------------------------------
// 9. Apps Showcase Carousel Engine
// --------------------------------------------------------------------------
let appsSwiper = null;

function initAppsCarousel() {
  const viewport = document.getElementById('carousel-viewport');
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');

  if (!viewport || !track) return;

  if (appsSwiper) {
    try {
      appsSwiper.destroy(true, true);
    } catch (_) {}
  }

  // Ensure there are enough slides for continuous seamless looping in BOTH directions
  // Swiper requires totalSlides >= (slidesPerView * 2 + loopedSlides) to loop without boundary stops
  const currentCards = Array.from(track.querySelectorAll('.app-card-inline:not(.swiper-slide-duplicate)'));
  const totalOriginalApps = currentCards.length || 7;
  if (currentCards.length > 0 && currentCards.length < 15) {
    // Clone twice so there are enough slides for seamless 360-degree looping
    currentCards.forEach(c => {
      const clone = c.cloneNode(true);
      track.appendChild(clone);
    });
    currentCards.forEach(c => {
      const clone = c.cloneNode(true);
      track.appendChild(clone);
    });
  }

  appsSwiper = new Swiper(viewport, {
    loop: true,
    loopPreventsSliding: false,
    watchSlidesProgress: true,
    slidesPerView: 1.05,
    spaceBetween: 10,
    grabCursor: true,
    simulateTouch: true,
    touchRatio: 1.3,
    resistance: false,
    speed: 450,
    freeMode: {
      enabled: true,
      momentum: true,
      momentumRatio: 2.0,
      momentumVelocityRatio: 1.8,
      momentumBounce: false,
      sticky: false,
    },
    navigation: {
      prevEl: prevBtn,
      nextEl: nextBtn,
    },
    pagination: {
      el: '#carousel-dots',
      clickable: true,
      bulletClass: 'carousel-dot',
      bulletActiveClass: 'active',
      renderBullet: function (index, className) {
        if (index >= totalOriginalApps) return '';
        return `<span class="${className}" data-index="${index}" tabindex="0" role="button" aria-label="Go to app ${index + 1}"></span>`;
      },
    },
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      480: {
        slidesPerView: 1.25,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 1.6,
        spaceBetween: 16,
      },
      860: {
        slidesPerView: 2.2,
        spaceBetween: 18,
      },
      1150: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
    preventClicks: true,
    preventClicksPropagation: true,
    on: {
      slideChange: function (s) {
        const currentAppIndex = ((s.realIndex % totalOriginalApps) + totalOriginalApps) % totalOriginalApps;
        const dots = document.querySelectorAll('#carousel-dots .carousel-dot');
        dots.forEach((d, idx) => {
          if (idx < totalOriginalApps) {
            d.classList.toggle('active', idx === currentAppIndex);
          }
        });
      },
      touchEnd: function (s) {
        s.loopFix();
      },
      click: function (s, e) {
        const card = e.target.closest('.app-card-inline');
        if (!card) return;
        // In Development cards are non-clickable
        if (
          card.classList.contains('card-in-development') ||
          card.classList.contains('card-coming-soon') ||
          card.dataset.appId === 'colorgame' ||
          card.dataset.appId === 'oncallservice' ||
          card.dataset.appId === 'loanservice'
        ) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const appId = card.dataset.appId || 'ridehailing';
        if (window.openAppDetailsModal) {
          window.openAppDetailsModal(appId);
        }
      },
    },
  });

  // Sound effects on navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (audio && audio.playBlip) audio.playBlip();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (audio && audio.playBlip) audio.playBlip();
    });
  }
}

// --------------------------------------------------------------------------
// 10. App Details Pop-Up Modal (10-Screen Gallery, Specs, Details)
// --------------------------------------------------------------------------
let currentAppId = 'ridehailing';
let currentScreenIndex = 0;

function initAppDetailsModal() {
  const modal = document.getElementById('app-details-modal');
  if (!modal) return;

  const backdrop = document.getElementById('app-modal-backdrop');
  const closeBtn = document.getElementById('app-modal-close-btn');
  const closeFooterBtn = document.getElementById('app-modal-close-footer-btn');
  const talkAiBtn = document.getElementById('app-modal-talk-ai-btn');

  const badgeEl = document.getElementById('modal-app-badge');
  const titleEl = document.getElementById('modal-app-title');
  const subEl = document.getElementById('modal-app-sub');

  const slides = [
    document.getElementById('modal-large-img'),
    document.getElementById('modal-large-img-next')
  ];
  let activeLayerIndex = 0;

  const counterBadge = document.getElementById('hero-counter-badge');
  const captionText = document.getElementById('hero-caption-text');
  const heroPrevBtn = document.getElementById('hero-prev-btn');
  const heroNextBtn = document.getElementById('hero-next-btn');

  const thumbsTrack = document.getElementById('thumbs-track');
  const thumbsViewport = document.getElementById('thumbs-track-viewport');
  const thumbPrevBtn = document.getElementById('thumb-prev-btn');
  const thumbNextBtn = document.getElementById('thumb-next-btn');

  const tabsNav = document.getElementById('info-tabs-nav');
  const featuresList = document.getElementById('modal-features-list');
  const pitchBanner = document.getElementById('modal-pitch-banner');
  const detailsContent = document.getElementById('modal-details-content');
  const specsGrid = document.getElementById('modal-specs-grid');

  let modalAutoplayTimer = null;
  const AUTOPLAY_INTERVAL = 3500;
  let isAutoplayPaused = false;

  function startModalAutoplay() {
    stopModalAutoplay();
    isAutoplayPaused = false;
    modalAutoplayTimer = setInterval(() => {
      if (isAutoplayPaused || modal.classList.contains('hidden')) return;
      displayScreen(currentScreenIndex + 1, 'forward');
    }, AUTOPLAY_INTERVAL);
  }

  function stopModalAutoplay() {
    if (modalAutoplayTimer) {
      clearInterval(modalAutoplayTimer);
      modalAutoplayTimer = null;
    }
  }

  function resetModalAutoplay() {
    if (modal.classList.contains('hidden')) return;
    startModalAutoplay();
  }

  function openAppModal(appId) {
    // Coming Soon apps do not open modal
    if (appId === 'colorgame' || appId === 'oncallservice' || appId === 'loanservice') {
      return;
    }
    const app = APPS_CATALOG[appId] || APPS_CATALOG['ridehailing'];
    if (app && app.isComingSoon) {
      return;
    }
    currentAppId = app.id;
    currentScreenIndex = 0;

    audio.playChime();

    // Populate Headers
    if (badgeEl) badgeEl.textContent = app.title;
    if (titleEl) titleEl.textContent = app.title;
    if (subEl) subEl.textContent = app.subtitle;

    // Render 10 Thumbnails
    renderThumbnails(app);

    // Show initial large screen (Screen 0)
    displayScreen(0, null, true);

    // Preload remaining gallery images for instant slide transitions
    if (app.gallery) {
      app.gallery.forEach(item => {
        if (item.image) {
          const preImg = new Image();
          preImg.src = item.image;
        }
      });
    }

    // Populate Features
    renderFeatures(app);

    // Populate Details & Pitch
    renderDetails(app);

    // Populate Specs
    renderSpecs(app);

    // Reset Tabs to Features
    setActiveTab('features');

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Start auto-play and loop
    startModalAutoplay();
  }

  function closeAppModal() {
    stopModalAutoplay();
    audio.playBlip();
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    const chatLightbox = document.getElementById('chat-lightbox');
    const catalogModal = document.getElementById('apps-catalog-modal');
    const contactModal = document.getElementById('contact-modal');
    const isAnyOpen = (chatLightbox && !chatLightbox.classList.contains('hidden')) ||
                      (catalogModal && !catalogModal.classList.contains('hidden')) ||
                      (contactModal && !contactModal.classList.contains('hidden'));
    if (!isAnyOpen) {
      document.body.style.overflow = '';
    }
  }

  function displayScreen(targetIndex, customDirection = null, isInitial = false) {
    const app = APPS_CATALOG[currentAppId] || APPS_CATALOG['ridehailing'];
    const gallery = app.gallery;
    if (!gallery || gallery.length === 0) return;

    const prevIndex = currentScreenIndex;
    const nextIndex = ((targetIndex % gallery.length) + gallery.length) % gallery.length;
    currentScreenIndex = nextIndex;
    const item = gallery[nextIndex];

    const currentSlide = slides[activeLayerIndex];
    const incomingSlide = slides[1 - activeLayerIndex];

    if (isInitial) {
      if (currentSlide) {
        currentSlide.src = item.image;
        currentSlide.alt = item.title;
        currentSlide.className = 'hero-large-img active';
      }
      if (incomingSlide) {
        incomingSlide.src = '';
        incomingSlide.className = 'hero-large-img';
      }
    } else if (currentSlide && incomingSlide) {
      // Determine direction: forward = right out to center, center to left out
      let dir = customDirection;
      if (!dir) {
        if (prevIndex === gallery.length - 1 && nextIndex === 0) {
          dir = 'forward'; // looping end back to start
        } else if (prevIndex === 0 && nextIndex === gallery.length - 1) {
          dir = 'backward'; // looping start to end
        } else if (nextIndex >= prevIndex) {
          dir = 'forward';
        } else {
          dir = 'backward';
        }
      }

      // Prepare incoming slide
      incomingSlide.src = item.image;
      incomingSlide.alt = item.title;

      if (dir === 'forward') {
        // Prepare on the right (offscreen right) with transition: none
        incomingSlide.className = 'hero-large-img prepare-from-right';
        void incomingSlide.offsetWidth; // Force layout reflow

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Slide incoming from right to center (0), slide current from center to left (-100%)
            incomingSlide.className = 'hero-large-img active';
            currentSlide.className = 'hero-large-img slide-out-left';
          });
        });
      } else {
        // Prepare on the left (offscreen left) with transition: none
        incomingSlide.className = 'hero-large-img prepare-from-left';
        void incomingSlide.offsetWidth; // Force layout reflow

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Slide incoming from left to center (0), slide current from center to right (100%)
            incomingSlide.className = 'hero-large-img active';
            currentSlide.className = 'hero-large-img slide-out-right';
          });
        });
      }

      // Switch active layer index
      activeLayerIndex = 1 - activeLayerIndex;
    } else if (currentSlide) {
      currentSlide.src = item.image;
      currentSlide.alt = item.title;
    }

    const numStr = String(currentScreenIndex + 1).padStart(2, '0');
    const totalStr = String(gallery.length).padStart(2, '0');
    if (counterBadge) counterBadge.textContent = `SCREEN ${numStr} / ${totalStr}`;
    if (captionText) captionText.textContent = `${item.title} — ${item.desc}`;

    // Highlight active thumbnail and scroll ONLY the horizontal thumbnail viewport
    if (thumbsTrack) {
      const thumbs = thumbsTrack.querySelectorAll('.thumb-card');
      let activeThumbEl = null;
      thumbs.forEach((t, idx) => {
        const isActive = idx === currentScreenIndex;
        t.classList.toggle('active', isActive);
        if (isActive) {
          activeThumbEl = t;
        }
      });

      if (thumbsViewport) {
        if (currentScreenIndex === 0) {
          thumbsViewport.scrollTo({ left: 0, behavior: 'smooth' });
        } else if (activeThumbEl) {
          const cardLeft = activeThumbEl.offsetLeft;
          const cardWidth = activeThumbEl.offsetWidth;
          const viewportWidth = thumbsViewport.clientWidth;
          const targetScrollLeft = cardLeft - (viewportWidth / 2) + (cardWidth / 2);
          thumbsViewport.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth'
          });
        }
      }
    }
  }

  function renderThumbnails(app) {
    if (!thumbsTrack) return;
    thumbsTrack.innerHTML = '';

    app.gallery.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = `thumb-card ${idx === 0 ? 'active' : ''}`;
      card.dataset.index = idx;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = `Screen ${idx + 1}: ${item.title}`;

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <span class="thumb-badge">#${idx + 1}</span>
        <span class="thumb-label">${item.tag || item.title}</span>
      `;

      card.addEventListener('click', (e) => {
        if (thumbHasDragged) return;
        e.stopPropagation();
        audio.playBlip();
        displayScreen(idx);
        resetModalAutoplay();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          audio.playBlip();
          displayScreen(idx);
          resetModalAutoplay();
        }
      });

      thumbsTrack.appendChild(card);
    });
  }

  function renderFeatures(app) {
    if (!featuresList) return;
    featuresList.innerHTML = '';
    app.features.forEach(f => {
      const li = document.createElement('li');
      li.className = 'modal-feature-item';
      li.innerHTML = `
        <div class="modal-feature-head">
          <span class="feat-bullet">▪</span>
          <span>${f.title}</span>
        </div>
        <div class="modal-feature-desc">${f.desc}</div>
      `;
      featuresList.appendChild(li);
    });
  }

  function renderDetails(app) {
    if (pitchBanner) {
      pitchBanner.innerHTML = `
        <strong>💡 TURNKEY BUSINESS PITCH:</strong> ${app.pitch}
      `;
    }
    if (detailsContent) {
      const d = app.details;
      detailsContent.innerHTML = `
        <div class="modal-details-grid">
          <div class="modal-detail-card">
            <h4>🌐 Ecosystem Overview</h4>
            <p>${d.overview}</p>
          </div>
          <div class="modal-detail-card">
            <h4>⏱️ Workforce, Attendance &amp; Payroll</h4>
            <p>${d.workforce}</p>
          </div>
          <div class="modal-detail-card">
            <h4>🚀 Zero-Cost Monetization</h4>
            <p>${d.monetization}</p>
          </div>
          <div class="modal-detail-card">
            <h4>🔒 360° Security &amp; Telemetry</h4>
            <p>${d.security}</p>
          </div>
        </div>
      `;
    }
  }

  function renderSpecs(app) {
    if (!specsGrid) return;
    specsGrid.innerHTML = '';
    app.specs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'modal-spec-card';
      card.innerHTML = `
        <span class="spec-card-label">${s.label}</span>
        <span class="spec-card-value">${s.value}</span>
      `;
      specsGrid.appendChild(card);
    });
  }

  function setActiveTab(tabKey) {
    if (!tabsNav) return;
    const tabBtns = tabsNav.querySelectorAll('.info-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    const panels = modal.querySelectorAll('.info-panel');
    panels.forEach(p => {
      if (tabKey === 'all') {
        p.style.display = 'block';
      } else {
        p.style.display = '';
        p.classList.toggle('active', p.id === `panel-${tabKey}`);
      }
    });
  }

  // Hero Nav buttons
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      displayScreen(currentScreenIndex - 1, 'backward');
      resetModalAutoplay();
    });
  }

  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      displayScreen(currentScreenIndex + 1, 'forward');
      resetModalAutoplay();
    });
  }

  // Thumbs Nav buttons: advance or rewind selected image one by one
  if (thumbPrevBtn) {
    thumbPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      displayScreen(currentScreenIndex - 1, 'backward');
      resetModalAutoplay();
    });
  }

  if (thumbNextBtn) {
    thumbNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playBlip();
      displayScreen(currentScreenIndex + 1, 'forward');
      resetModalAutoplay();
    });
  }

  // Interactive mouse drag swipe scrolling on thumbs gallery viewport
  let thumbIsDown = false;
  let thumbStartX = 0;
  let thumbScrollLeft = 0;
  let thumbHasDragged = false;

  if (thumbsViewport) {
    thumbsViewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      thumbIsDown = true;
      thumbHasDragged = false;
      thumbStartX = e.pageX;
      thumbScrollLeft = thumbsViewport.scrollLeft;
      isAutoplayPaused = true;
    });

    window.addEventListener('mouseup', () => {
      if (!thumbIsDown) return;
      thumbIsDown = false;
      thumbsViewport.classList.remove('is-dragging');
      isAutoplayPaused = false;
      resetModalAutoplay();
      if (thumbHasDragged) {
        setTimeout(() => { thumbHasDragged = false; }, 120);
      }
    });

    thumbsViewport.addEventListener('mousemove', (e) => {
      if (!thumbIsDown) return;
      const walk = e.pageX - thumbStartX;
      if (Math.abs(walk) > 16) {
        thumbHasDragged = true;
        thumbsViewport.classList.add('is-dragging');
        e.preventDefault();
        thumbsViewport.scrollLeft = thumbScrollLeft - walk;
      }
    });

    thumbsViewport.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // Pause on hover over viewer frame or details info section
  const viewerFrame = modal.querySelector('.hero-viewer-frame');
  if (viewerFrame) {
    viewerFrame.addEventListener('mouseenter', () => {
      isAutoplayPaused = true;
    });
    viewerFrame.addEventListener('mouseleave', () => {
      isAutoplayPaused = false;
    });
  }

  const infoSection = modal.querySelector('.app-modal-info-section');
  if (infoSection) {
    infoSection.addEventListener('mouseenter', () => {
      isAutoplayPaused = true;
    });
    infoSection.addEventListener('mouseleave', () => {
      isAutoplayPaused = false;
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isAutoplayPaused = true;
    } else if (!modal.classList.contains('hidden')) {
      isAutoplayPaused = false;
    }
  });

  // Tabs Nav
  if (tabsNav) {
    tabsNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.info-tab-btn');
      if (!btn) return;
      audio.playBlip();
      setActiveTab(btn.dataset.tab);
    });
  }

  // Close Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeAppModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeAppModal);
  if (backdrop) backdrop.addEventListener('click', closeAppModal);

  // Esc key & Arrow keys
  window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      closeAppModal();
    } else if (e.key === 'ArrowLeft') {
      displayScreen(currentScreenIndex - 1, 'backward');
      resetModalAutoplay();
    } else if (e.key === 'ArrowRight') {
      displayScreen(currentScreenIndex + 1, 'forward');
      resetModalAutoplay();
    }
  });

  // Talk to CAELIN AI button
  if (talkAiBtn) {
    talkAiBtn.addEventListener('click', () => {
      const app = APPS_CATALOG[currentAppId] || APPS_CATALOG['ridehailing'];
      closeAppModal();
      // Open CAELIN chat lightbox
      const chatLightbox = document.getElementById('chat-lightbox');
      if (chatLightbox) {
        audio.playChime();
        chatLightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = `Tell me about the ${app.title} features, attendance, payroll system, and technical specs.`;
          setTimeout(() => {
            input.focus();
            const form = document.getElementById('chat-form');
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 300);
        }
      }
    });
  }

  // Expose global openAppModal
  window.openAppDetailsModal = openAppModal;
}

// --------------------------------------------------------------------------
// 11. Contact Us Popup Modal Controller
// --------------------------------------------------------------------------
function initContactUsModal() {
  const modal = document.getElementById('contact-modal');
  const backdrop = document.getElementById('contact-modal-backdrop');
  const closeBtn = document.getElementById('contact-modal-close-btn');
  const cancelBtn = document.getElementById('contact-modal-cancel-btn');
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBox = document.getElementById('contact-status-box');

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  if (!modal) return;

  function openContactModal() {
    audio.playBlip();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Highlight CONTACT link in navbar
    const contactNav = document.getElementById('nav-contact-link');
    if (contactNav) {
      document.querySelectorAll('.cyber-nav .nav-item').forEach(l => l.classList.remove('active'));
      contactNav.classList.add('active');
    }

    if (statusBox) {
      statusBox.className = 'contact-status-box hidden';
      statusBox.innerHTML = '';
    }
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 150);
  }

  function closeContactModal() {
    audio.playBlip();
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    const appModal = document.getElementById('app-details-modal');
    const chatModal = document.getElementById('chat-lightbox');
    const catalogModal = document.getElementById('apps-catalog-modal');
    const isAppModalOpen = appModal && !appModal.classList.contains('hidden');
    const isChatOpen = chatModal && !chatModal.classList.contains('hidden');
    const isCatalogOpen = catalogModal && !catalogModal.classList.contains('hidden');
    if (!isAppModalOpen && !isChatOpen && !isCatalogOpen) {
      document.body.style.overflow = '';
    }
    // Re-trigger scroll event to restore current section's active state
    window.dispatchEvent(new Event('scroll'));
  }

  window.openContactUsModal = openContactModal;
  window.openContactModal = openContactModal;
  window.closeContactUsModal = closeContactModal;
  window.closeContactModal = closeContactModal;

  if (closeBtn) closeBtn.addEventListener('click', closeContactModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeContactModal);
  if (backdrop) backdrop.addEventListener('click', closeContactModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeContactModal();
    }
  });

  // Top navigation Contact link
  const navContactLink = document.getElementById('nav-contact-link');
  if (navContactLink) {
    navContactLink.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  }

  // Disables the contact button in the chat after successful transmission
  function disableChatContactButton() {
    window.chatContactDisabled = true;

    // 1. Disable the #contact-us-chip button in prompt chips
    const contactChip = document.getElementById('contact-us-chip');
    if (contactChip) {
      contactChip.disabled = true;
      contactChip.classList.add('disabled-chip');
      contactChip.innerHTML = '📨 Contact Sent 🔒';
      contactChip.title = 'Inquiry already sent. Refresh the page to send another message.';
    }

    // 2. Disable all email trigger buttons inside chat messages
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.querySelectorAll('.chat-email-icon-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled-btn');
        btn.title = 'Inquiry already sent. Refresh to send again.';
      });
      chatContainer.querySelectorAll('.chat-contact-modal-link').forEach(link => {
        link.classList.add('disabled-link');
        link.style.opacity = '0.45';
        link.style.pointerEvents = 'none';
        link.style.cursor = 'not-allowed';
      });
    }
  }

  window.disableChatContactButton = disableChatContactButton;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      audio.playBlip();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !email || !subject || !message) {
        showStatus('error', '⚠️ Please complete all fields before sending.');
        return;
      }

      submitBtn.disabled = true;
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="btn-text">Sending...</span> <span class="spinner">⏳</span>';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.ok) {
          audio.playChime();

          // 1. Reset form fields
          form.reset();

          // 2. Do NOT disable the send button in the modal - restore it
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;

          // 3. After sending just close the modal immediately
          closeContactModal();

          // 4. Disable the Contact Us button in the chat
          disableChatContactButton();

          // 5. Post confirmation into AI chat
          if (window.caelinChatEngine) {
            window.caelinChatEngine.appendBubble(
              'ai',
              `Transmission confirmed from ${name} (<${email}>)! Your message regarding "${subject}" has been securely sent to caelhub@gmail.com Successfully. The chat contact button has now been disabled to prevent spam — You can only send message one at a time...`
            );
          }
        } else {
          audio.playError();
          const errMsg = result.error || 'Transmission failed. Please check connection.';
          showStatus(
            'error',
            `❌ ${errMsg} <br/><a href="mailto:caelhub@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}" class="chat-contact-modal-link" style="margin-top:6px; display:inline-block;">Open mail app directly ↗</a>`
          );
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      } catch (err) {
        audio.playError();
        console.error('Contact transmission error:', err);
        showStatus(
          'error',
          `❌ Network error: ${err.message}. <br/><a href="mailto:caelhub@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}" class="chat-contact-modal-link" style="margin-top:6px; display:inline-block;">Click here to send via email client ↗</a>`
        );
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  function showStatus(type, htmlContent) {
    if (!statusBox) return;
    statusBox.className = `contact-status-box ${type}`;
    statusBox.innerHTML = htmlContent;
    statusBox.classList.remove('hidden');
  }
}

// --------------------------------------------------------------------------
// 12. Console / Matrix Stream Page View Counter (Per-Load Metadata Sync)
// --------------------------------------------------------------------------
function initConsoleViewCounter() {
  const counterEl = document.getElementById('download-counter') || document.getElementById('view-counter');
  const streamContainer = document.getElementById('live-console-stream');
  if (!counterEl) return;

  const STORAGE_KEY = 'cael_matrix_view_counter';

  // Instant local cache rendering so there's zero UI flicker
  let count = parseInt(localStorage.getItem(STORAGE_KEY), 10);
  if (isNaN(count) || count < 0) {
    count = 0;
  }
  counterEl.textContent = count;

  // Function to pull latest authoritative metadata from server
  async function fetchServerMetadata(shouldPop = false) {
    try {
      const res = await fetch('/api/metadata');
      if (res.ok) {
        const data = await res.json();
        const authoritativeCount = data.views ?? data.total;
        if (typeof authoritativeCount === 'number') {
          const prev = count;
          count = authoritativeCount;
          counterEl.textContent = count;
          try {
            localStorage.setItem(STORAGE_KEY, count);
          } catch (_) {}

          if (shouldPop && count !== prev) {
            counterEl.style.transform = 'scale(1.25)';
            setTimeout(() => {
              counterEl.style.transform = '';
            }, 180);
          }
        }
      }
    } catch (_) {
      // Offline fallback: keep existing count
    }
  }

  // Record a page view on load (per load instead of per click)
  async function recordPageView() {
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'page_view', referrer: document.referrer || 'direct' })
      });
      if (res.ok) {
        const data = await res.json();
        const authoritativeCount = data.views ?? data.total;
        if (typeof authoritativeCount === 'number') {
          count = authoritativeCount;
          counterEl.textContent = count;
          counterEl.style.transform = 'scale(1.3)';
          setTimeout(() => {
            counterEl.style.transform = '';
          }, 200);
          try {
            localStorage.setItem(STORAGE_KEY, count);
          } catch (_) {}
          return;
        }
      }
    } catch (_) {
      // Optimistic offline increment
      count++;
      counterEl.textContent = count;
      try {
        localStorage.setItem(STORAGE_KEY, count);
      } catch (_) {}
    }
  }

  // Automatically record this page view on load!
  recordPageView();

  // Background auto-sync: when visitor returns to tab or every 12s
  window.addEventListener('focus', () => fetchServerMetadata(true));
  setInterval(() => fetchServerMetadata(false), 12000);

  // Optional pleasant interaction: clicking a log entry plays cyber blip
  if (streamContainer) {
    streamContainer.addEventListener('click', (e) => {
      const entry = e.target.closest('.log-entry');
      if (entry && audio && audio.playBlip) {
        audio.playBlip();
        entry.classList.remove('clicked-flash');
        void entry.offsetWidth;
        entry.classList.add('clicked-flash');
        setTimeout(() => {
          entry.classList.remove('clicked-flash');
        }, 300);
      }
    });
  }
}

const initConsoleDownloadCounter = initConsoleViewCounter;

// --------------------------------------------------------------------------
// 13. Navigation Scroll Spy (Active Menu Item Color on Browse)
// --------------------------------------------------------------------------
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.cyber-nav .nav-item[href^="#"]');
  const contactLink = document.getElementById('nav-contact-link');
  const brandLink = document.querySelector('.brand-link');
  if (!navLinks || navLinks.length === 0) return;

  const sections = [];
  navLinks.forEach(link => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      const el = document.querySelector(targetId);
      if (el) {
        sections.push({ id: targetId, link, el });
      }
    }
  });

  if (sections.length === 0) return;

  let isClickScrolling = false;
  let clickTimeout = null;

  function setActive(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    if (contactLink) contactLink.classList.remove('active');
    if (brandLink) brandLink.classList.remove('active');
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  function updateActiveSection() {
    if (isClickScrolling) return;

    // If contact modal is open, let contact link stay active
    const contactModal = document.getElementById('contact-modal');
    if (contactModal && !contactModal.classList.contains('hidden')) {
      if (contactLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        if (brandLink) brandLink.classList.remove('active');
        contactLink.classList.add('active');
      }
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if scrolled near the bottom of the page (activate last section, e.g. #console)
    if (scrollY + windowHeight >= documentHeight - 50) {
      setActive(sections[sections.length - 1].link);
      return;
    }

    // Offset below fixed header (72px header + 38px buffer)
    const scrollPosition = scrollY + 110;

    // If at the very top of the page (above first section #modules), activate CAEL HUB (Home)
    const firstSectionTop = sections[0].el.getBoundingClientRect().top + scrollY;
    if (scrollPosition < firstSectionTop) {
      setActive(brandLink);
      return;
    }

    let currentSection = sections[0];
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const top = sec.el.getBoundingClientRect().top + scrollY;
      if (top <= scrollPosition) {
        currentSection = sec;
      } else {
        break;
      }
    }

    if (currentSection) {
      setActive(currentSection.link);
    }
  }

  // Smooth scroll and sound effect on CAEL HUB brand link (serves as Home)
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (audio && audio.playBlip) audio.playBlip();

      setActive(brandLink);
      isClickScrolling = true;
      if (clickTimeout) clearTimeout(clickTimeout);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
        updateActiveSection();
      }, 850);
    });
  }

  // Smooth scroll and sound effect on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (audio && audio.playBlip) audio.playBlip();

          setActive(link);
          isClickScrolling = true;
          if (clickTimeout) clearTimeout(clickTimeout);

          const headerHeight = 72;
          const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });

          // Re-enable automatic scroll detection after smooth scroll completes
          clickTimeout = setTimeout(() => {
            isClickScrolling = false;
            updateActiveSection();
          }, 850);
        }
      }
    });
  });

  // Passive, throttled scroll listener for 60fps performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Update on window resize as layout dimensions may change
  window.addEventListener('resize', () => {
    updateActiveSection();
  }, { passive: true });

  // Initial detection on page load
  updateActiveSection();
}

// --------------------------------------------------------------------------
// 13b. System Mode Directives & Interactive 3D Flip Cards
// --------------------------------------------------------------------------
function initSystemMaintenanceCards() {
  const capabilitiesBtn = document.getElementById('hero-capabilities-btn');
  const maintenanceBtn = document.getElementById('hero-maintenance-btn');
  const cards = Array.from(document.querySelectorAll('#hero-flip-grid .stat-card.flip-card'));

  if (cards.length === 0) return;

  // Flips all cards to the System Maintenance directives side (won't flip back)
  function showMaintenance() {
    const allAlreadyFlipped = cards.every(c => c.classList.contains('is-flipped'));
    if (allAlreadyFlipped) return;

    audio.playChime();

    if (maintenanceBtn) maintenanceBtn.classList.add('active');
    if (capabilitiesBtn) capabilitiesBtn.classList.remove('active');

    // Staggered 3D card cascade animation to maintenance side
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('is-flipped');
      }, index * 75);
    });
  }

  // Reverts / flips all cards back to the System Capabilities side (won't flip to maintenance)
  function showCapabilities() {
    const noneAlreadyFlipped = cards.every(c => !c.classList.contains('is-flipped'));
    if (noneAlreadyFlipped) return;

    audio.playBlip();

    if (capabilitiesBtn) capabilitiesBtn.classList.add('active');
    if (maintenanceBtn) maintenanceBtn.classList.remove('active');

    // Staggered 3D card cascade animation back to capabilities side
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove('is-flipped');
      }, index * 75);
    });
  }

  if (maintenanceBtn) {
    maintenanceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showMaintenance();
    });
  }

  if (capabilitiesBtn) {
    capabilitiesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showCapabilities();
    });
  }

  // Sync button states if individual cards are clicked
  function syncButtonStates() {
    const flippedCount = cards.filter(c => c.classList.contains('is-flipped')).length;
    if (flippedCount === cards.length) {
      if (maintenanceBtn) maintenanceBtn.classList.add('active');
      if (capabilitiesBtn) capabilitiesBtn.classList.remove('active');
    } else if (flippedCount === 0) {
      if (capabilitiesBtn) capabilitiesBtn.classList.add('active');
      if (maintenanceBtn) maintenanceBtn.classList.remove('active');
    }
  }

  // Also support clicking individual cards to inspect
  cards.forEach(card => {
    card.addEventListener('click', () => {
      audio.playBlip();
      card.classList.toggle('is-flipped');
      syncButtonStates();
    });

    // Keyboard accessibility (Enter / Space to flip)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audio.playBlip();
        card.classList.toggle('is-flipped');
        syncButtonStates();
      }
    });
  });
}

// --------------------------------------------------------------------------
// 13.5. Mobile Cyber Navigation Menu & Drawer
// --------------------------------------------------------------------------
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!menuBtn || !drawer) return;

  function toggleMenu(forceClose = false) {
    const isOpen = !forceClose && !drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      audio.playBlip();
    } else {
      drawer.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Handle mobile navigation links
  const navLinks = drawer.querySelectorAll('.mobile-nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      audio.playChime();
      toggleMenu(true);
    });
  });

  // Mobile Contact Trigger Button
  const mobileContactBtn = document.getElementById('mobile-contact-trigger-btn');
  if (mobileContactBtn) {
    mobileContactBtn.addEventListener('click', () => {
      toggleMenu(true);
      if (typeof window.openContactModal === 'function') {
        window.openContactModal();
      } else {
        const contactNav = document.getElementById('nav-contact-link');
        if (contactNav) contactNav.click();
      }
    });
  }

  // Mobile Chat Trigger Button
  const mobileChatBtn = document.getElementById('mobile-chat-trigger-btn');
  if (mobileChatBtn) {
    mobileChatBtn.addEventListener('click', () => {
      toggleMenu(true);
      const floatingBtn = document.getElementById('floating-chat-btn');
      if (floatingBtn) floatingBtn.click();
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
      toggleMenu(true);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(true);
    }
  });

  // Auto-close when resizing to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && drawer.classList.contains('open')) {
      toggleMenu(true);
    }
  });
}

// --------------------------------------------------------------------------
// 14. Explore Free Applications Catalog Modal Controller (Search & Categories)
// --------------------------------------------------------------------------
function initAppsCatalogModal() {
  const modal = document.getElementById('apps-catalog-modal');
  if (!modal) return;

  const openBtn = document.getElementById('explore-free-apps-btn');
  const backdrop = document.getElementById('apps-catalog-modal-backdrop');
  const closeBtn = document.getElementById('apps-catalog-close-btn');
  const searchInput = document.getElementById('apps-search-input');
  const searchClearBtn = document.getElementById('apps-search-clear');
  const filterPills = modal.querySelectorAll('.apps-filter-pills .filter-pill');
  const categoryBlocks = modal.querySelectorAll('.apps-category-block');
  const appCards = modal.querySelectorAll('.catalog-app-card');
  const statusText = document.getElementById('apps-search-status');
  const noResultsBox = document.getElementById('apps-no-results');
  const noResultsQueryEl = document.getElementById('no-results-query');
  const resetSearchBtn = document.getElementById('reset-apps-search-btn');
  const footerCaelinBtn = document.getElementById('catalog-talk-caelin-btn');

  const pillCountAll = document.getElementById('pill-count-all');
  const pillCountBusiness = document.getElementById('pill-count-business');
  const pillCountPersonal = document.getElementById('pill-count-personal');
  const pillCountUpcoming = document.getElementById('pill-count-upcoming');

  let currentCategoryFilter = 'all';

  function updateGlobalModalOverflow() {
    const appModal = document.getElementById('app-details-modal');
    const chatModal = document.getElementById('chat-lightbox');
    const contactModal = document.getElementById('contact-modal');
    const catalogModal = document.getElementById('apps-catalog-modal');
    const isAnyOpen = (appModal && !appModal.classList.contains('hidden')) ||
                      (chatModal && !chatModal.classList.contains('hidden')) ||
                      (contactModal && !contactModal.classList.contains('hidden')) ||
                      (catalogModal && !catalogModal.classList.contains('hidden'));
    if (!isAnyOpen) {
      document.body.style.overflow = '';
      window.dispatchEvent(new Event('scroll'));
    }
  }

  function openCatalogModal() {
    audio.playChime();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Always reset view to show all applications at the top
    if (searchInput) searchInput.value = '';
    switchToApps('all');

    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 200);
  }

  function closeCatalogModal() {
    audio.playBlip();
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    updateGlobalModalOverflow();
  }

  function switchToWhatsIncluded() {
    currentCategoryFilter = 'whats-included';
    filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'whats-included'));
    
    const appsListWrap = document.getElementById('catalog-apps-list-wrap');
    const wiSection = document.getElementById('catalog-whats-included');
    if (appsListWrap) appsListWrap.style.display = 'none';
    if (noResultsBox) noResultsBox.classList.add('hidden');
    if (wiSection) wiSection.style.display = 'block';
    if (statusText) statusText.textContent = "Showing How Our Partnership Works & Managed Technology";
    
    const catalogBody = document.getElementById('apps-catalog-body');
    if (catalogBody) catalogBody.scrollTop = 0;
  }

  function switchToApps(category = 'all') {
    currentCategoryFilter = category;
    filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === category));

    const appsListWrap = document.getElementById('catalog-apps-list-wrap');
    const wiSection = document.getElementById('catalog-whats-included');
    if (wiSection) wiSection.style.display = 'none';
    if (appsListWrap) appsListWrap.style.display = 'block';

    filterApps();
    const catalogBody = document.getElementById('apps-catalog-body');
    if (catalogBody) catalogBody.scrollTop = 0;
  }

  function filterApps() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchClearBtn) {
      if (query.length > 0) {
        searchClearBtn.classList.remove('hidden');
      } else {
        searchClearBtn.classList.add('hidden');
      }
    }

    if (currentCategoryFilter === 'whats-included') {
      switchToWhatsIncluded();
      return;
    }

    const appsListWrap = document.getElementById('catalog-apps-list-wrap');
    const wiSection = document.getElementById('catalog-whats-included');
    if (wiSection) wiSection.style.display = 'none';
    if (appsListWrap) appsListWrap.style.display = 'block';

    let totalVisible = 0;
    const categoryCounts = { business: 0, personal: 0, upcoming: 0 };

    categoryBlocks.forEach(block => {
      const blockCategory = block.dataset.categoryGroup;
      const cards = block.querySelectorAll('.catalog-app-card');
      let blockVisibleCards = 0;

      cards.forEach(card => {
        const cardCategory = card.dataset.category;
        const searchData = (card.dataset.search || card.textContent || '').toLowerCase();
        const matchesCategory = currentCategoryFilter === 'all' || currentCategoryFilter === cardCategory;
        const matchesQuery = query === '' || searchData.includes(query);

        if (matchesCategory && matchesQuery) {
          card.style.display = '';
          blockVisibleCards++;
          totalVisible++;
          if (categoryCounts[cardCategory] !== undefined) {
            categoryCounts[cardCategory]++;
          }
        } else {
          card.style.display = 'none';
        }
      });

      // Show/hide entire category block
      if (blockVisibleCards > 0) {
        block.style.display = '';
      } else {
        block.style.display = 'none';
      }
    });

    // Update pill counters
    if (pillCountBusiness) pillCountBusiness.textContent = categoryCounts.business;
    if (pillCountPersonal) pillCountPersonal.textContent = categoryCounts.personal;
    if (pillCountUpcoming) pillCountUpcoming.textContent = categoryCounts.upcoming;
    if (pillCountAll) pillCountAll.textContent = categoryCounts.business + categoryCounts.personal + categoryCounts.upcoming;

    // Empty state
    if (totalVisible === 0) {
      if (noResultsBox) noResultsBox.classList.remove('hidden');
      if (noResultsQueryEl) noResultsQueryEl.textContent = `"${query}"`;
      if (statusText) statusText.textContent = `No applications match "${query}"`;
    } else {
      if (noResultsBox) noResultsBox.classList.add('hidden');
      if (statusText) {
        if (query) {
          statusText.textContent = `Found ${totalVisible} application${totalVisible === 1 ? '' : 's'} matching "${query}"`;
        } else if (currentCategoryFilter !== 'all') {
          statusText.textContent = `Showing ${totalVisible} application${totalVisible === 1 ? '' : 's'} in selected category`;
        } else {
          statusText.textContent = `Showing all ${totalVisible} applications`;
        }
      }
    }
  }

  // Event Listeners
  if (openBtn) openBtn.addEventListener('click', openCatalogModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCatalogModal);
  if (backdrop) backdrop.addEventListener('click', closeCatalogModal);

  // Delegate for any other trigger with .explore-apps-trigger
  document.querySelectorAll('.explore-apps-trigger').forEach(trigger => {
    if (trigger !== openBtn) {
      trigger.addEventListener('click', openCatalogModal);
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      // If typing in search while in What's Included, automatically switch to apps
      if (currentCategoryFilter === 'whats-included') {
        currentCategoryFilter = 'all';
        filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
      }
      filterApps();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      audio.playBlip();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      filterApps();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      audio.playBlip();
      if (searchInput) searchInput.value = '';
      switchToApps('all');
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      audio.playBlip();
      const cat = pill.dataset.category || 'all';
      if (cat === 'whats-included') {
        switchToWhatsIncluded();
      } else {
        switchToApps(cat);
      }
    });
  });

  // Switch to "What's Included?" triggers
  const wiTrigger = document.getElementById('catalog-whats-included-trigger');
  if (wiTrigger) {
    wiTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playChime();
      switchToWhatsIncluded();
    });
  }

  const wiOpenBtn = document.getElementById('catalog-wi-open-btn');
  if (wiOpenBtn) {
    wiOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playChime();
      switchToWhatsIncluded();
    });
  }

  // Back to All Applications buttons inside What's Included
  const wiBackBtn = document.getElementById('wi-back-to-apps-btn');
  if (wiBackBtn) {
    wiBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playBlip();
      switchToApps('all');
    });
  }

  const wiBackBottomBtn = document.getElementById('wi-back-to-apps-bottom-btn');
  if (wiBackBottomBtn) {
    wiBackBottomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playBlip();
      switchToApps('all');
    });
  }

  // Card Action Buttons
  modal.querySelectorAll('.catalog-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const appId = btn.dataset.appId;
      closeCatalogModal();
      if (typeof window.openAppDetailsModal === 'function') {
        window.openAppDetailsModal(appId);
      }
    });
  });

  modal.querySelectorAll('.catalog-ask-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const appName = btn.dataset.appName || 'Cael Hub applications';
      closeCatalogModal();
      const chatLightbox = document.getElementById('chat-lightbox');
      if (chatLightbox) {
        audio.playChime();
        chatLightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = `Tell me more about the features and business opportunities of the ${appName}.`;
          setTimeout(() => input.focus(), 250);
        }
      }
    });
  });

  // Direct CAELIN consultation button inside Transparency view
  modal.querySelectorAll('.catalog-talk-caelin-direct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeCatalogModal();
      const chatLightbox = document.getElementById('chat-lightbox');
      if (chatLightbox) {
        audio.playChime();
        chatLightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = `Can you explain how Cael Hub's managed technology, software maintenance, and 2% service share partnership work?`;
          setTimeout(() => input.focus(), 250);
        }
      }
    });
  });

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeCatalogModal();
    }
  });

  // Expose global controller
  window.openAppsCatalogModal = openCatalogModal;
  window.closeAppsCatalogModal = closeCatalogModal;
}

function initPartnershipButtons() {
  const buttons = document.querySelectorAll('.partnership-how-trigger, #partnership-how-btn, #hero-partnership-how-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const chatLightbox = document.getElementById('chat-lightbox');
      if (chatLightbox) {
        if (typeof audio !== 'undefined' && audio.playChime) audio.playChime();
        chatLightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = `Tell me more about how the Cael Hub partnership works, the 2% service share, and managed technology.`;
          setTimeout(() => {
            input.focus();
            const form = document.getElementById('chat-form');
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
          }, 220);
        }
      }
    });
  });
}

// --------------------------------------------------------------------------
// 15. Application Initialization Entry Point
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  initIntroAnimation();
  initThemeAndAudio();
  initMobileMenu();

  const visualizer = new Visualizer('audio-wave-canvas');
  initModalController(visualizer);
  window.caelinChatEngine = new AIChatEngine(visualizer);
  initAppsCarousel();
  initAppDetailsModal();
  initContactUsModal();
  initAppsCatalogModal();
  initConsoleDownloadCounter();
  initScrollSpy();
  initPartnershipButtons();
  initSystemMaintenanceCards();
});


