/**
 * Mobile Audio & Speech API compatibility helper
 * Solves iOS Safari / Android Chrome quirks:
 * 1. Audio context locking on touch devices
 * 2. Utterance garbage collection mid-speech
 * 3. SpeechRecognition continuous mode failure on mobile
 * 4. Fallback voice recorder for unsupported mobile browsers
 */

// Global reference to prevent garbage collection on mobile WebKit/Blink
if (typeof window !== 'undefined') {
  window.__activeUtterances = window.__activeUtterances || [];
}

/**
 * Detect if device is a mobile device or tablet
 */
export function isMobileDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (touch && window.innerWidth < 1024);
}

/**
 * Detect if device is iOS (iPhone/iPad)
 */
export function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect if running in an insecure context where microphone might be blocked on mobile
 */
export function isInsecureMobileContext() {
  if (typeof window === 'undefined') return false;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isHttps = window.location.protocol === 'https:';
  return isMobileDevice() && !isHttps && !isLocalhost;
}

/**
 * Check if Speech Recognition is supported
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if Speech Synthesis is supported
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Unlock mobile audio synthesis on first user interaction.
 * Crucial for iOS Safari and mobile Chrome.
 */
let isAudioUnlocked = false;
export function unlockMobileAudio() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;
  if (!('speechSynthesis' in window)) return;

  try {
    // Resume synthesis if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Speak a silent empty utterance to unlock the audio channel
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    silent.rate = 2.0;
    window.speechSynthesis.speak(silent);
    isAudioUnlocked = true;
  } catch (e) {
    // Ignore unlock errors
  }
}

/**
 * Retain utterance in global array to stop mobile garbage collection
 */
export function retainUtterance(utterance, onDoneCallback) {
  if (typeof window === 'undefined') return;
  window.__activeUtterances = window.__activeUtterances || [];
  window.__activeUtterances.push(utterance);

  const cleanup = () => {
    const idx = window.__activeUtterances.indexOf(utterance);
    if (idx !== -1) {
      window.__activeUtterances.splice(idx, 1);
    }
    if (onDoneCallback) onDoneCallback();
  };

  const origEnd = utterance.onend;
  const origError = utterance.onerror;

  utterance.onend = (e) => {
    cleanup();
    if (origEnd) origEnd.call(utterance, e);
  };

  utterance.onerror = (e) => {
    cleanup();
    if (origError) origError.call(utterance, e);
  };
}

/**
 * Universal Mobile Voice Recorder using MediaRecorder API
 * For browsers or mobile devices without SpeechRecognition
 */
export class MobileVoiceRecorder {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.onDataAvailable = options.onDataAvailable || null;
    this.onStateChange = options.onStateChange || null;
  }

  static isSupported() {
    return typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined';
  }

  async start() {
    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Prefer audio/webm or audio/mp4 depending on browser support
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else {
          mimeType = '';
        }
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        if (this.onStateChange) this.onStateChange('recording');
      };

      this.mediaRecorder.start(250); // Slice every 250ms for responsiveness
      return true;
    } catch (err) {
      console.error('MobileVoiceRecorder start error:', err);
      throw err;
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
        if (this.onStateChange) this.onStateChange('idle');
        resolve({ blob, mimeType });
      };

      this.mediaRecorder.stop();
    });
  }
}
