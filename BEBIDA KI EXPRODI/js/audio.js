// js/audio.js - Gerador de Áudio Procedural usando Web Audio API (100% nativo, sem dependências externas)

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.pourOsc = null;
    this.pourGain = null;
    this.pourFilter = null;
    this.warningOsc = null;
    this.warningGain = null;
    this.isPouring = false;
    this.isWarning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopPour();
      this.stopWarning();
    }
    return this.muted;
  }

  // Som contínuo de despejo de líquido com modulação de frequência de acordo com o nível do copo
  startPour(pitchFactor = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.isPouring) return;

    this.isPouring = true;
    const now = this.ctx.currentTime;

    // Buffer de ruído rosa para simular o som natural da água correndo
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
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
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro passa-faixa ressonante
    this.pourFilter = this.ctx.createBiquadFilter();
    this.pourFilter.type = 'bandpass';
    this.pourFilter.frequency.setValueAtTime(450 * pitchFactor, now);
    this.pourFilter.Q.setValueAtTime(4.0, now);

    this.pourGain = this.ctx.createGain();
    this.pourGain.gain.setValueAtTime(0.001, now);
    this.pourGain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);

    // Oscilador de bolhas borbulhantes
    const bubbleOsc = this.ctx.createOscillator();
    bubbleOsc.type = 'sine';
    bubbleOsc.frequency.setValueAtTime(280 * pitchFactor, now);

    const bubbleGain = this.ctx.createGain();
    bubbleGain.gain.setValueAtTime(0.06, now);

    // Conexões
    whiteNoise.connect(this.pourFilter);
    this.pourFilter.connect(this.pourGain);
    bubbleOsc.connect(bubbleGain);
    bubbleGain.connect(this.pourGain);
    this.pourGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    bubbleOsc.start(now);

    this.pourSource = whiteNoise;
    this.bubbleSource = bubbleOsc;
  }

  updatePourPitch(ratio) {
    if (this.pourFilter && this.ctx && !this.muted) {
      // Conforme o copo enche, o pitch aumenta como num copo real
      const targetFreq = 400 + ratio * 700;
      this.pourFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      if (this.bubbleSource) {
        this.bubbleSource.frequency.setTargetAtTime(250 + ratio * 400, this.ctx.currentTime, 0.05);
      }
    }
  }

  stopPour() {
    if (!this.isPouring || !this.ctx) return;
    this.isPouring = false;
    const now = this.ctx.currentTime;
    if (this.pourGain) {
      this.pourGain.gain.setValueAtTime(this.pourGain.gain.value, now);
      this.pourGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        try {
          if (this.pourSource) this.pourSource.stop();
          if (this.bubbleSource) this.bubbleSource.stop();
        } catch (_) {}
      }, 100);
    }
  }

  // Alerta sonoro de instabilidade crítica / perigo de explosão
  startWarning(intensity = 0.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.isWarning) return;

    this.isWarning = true;
    const now = this.ctx.currentTime;

    this.warningOsc = this.ctx.createOscillator();
    this.warningOsc.type = 'sawtooth';
    this.warningOsc.frequency.setValueAtTime(500, now);

    // Efeito tremolo de perigo
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6 + intensity * 10, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, now);
    lfo.connect(this.warningOsc.frequency);

    this.warningGain = this.ctx.createGain();
    this.warningGain.gain.setValueAtTime(0.001, now);
    this.warningGain.gain.exponentialRampToValueAtTime(0.12 * intensity, now + 0.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    this.warningOsc.connect(filter);
    filter.connect(this.warningGain);
    this.warningGain.connect(this.ctx.destination);

    this.warningOsc.start(now);
    lfo.start(now);
    this.warningLFO = lfo;
  }

  updateWarning(intensity) {
    if (this.warningGain && this.ctx && !this.muted) {
      const now = this.ctx.currentTime;
      this.warningGain.gain.setTargetAtTime(0.05 + intensity * 0.15, now, 0.05);
      if (this.warningLFO) {
        this.warningLFO.frequency.setTargetAtTime(6 + intensity * 16, now, 0.05);
      }
    }
  }

  stopWarning() {
    if (!this.isWarning || !this.ctx) return;
    this.isWarning = false;
    const now = this.ctx.currentTime;
    if (this.warningGain) {
      this.warningGain.gain.setValueAtTime(this.warningGain.gain.value, now);
      this.warningGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      setTimeout(() => {
        try {
          if (this.warningOsc) this.warningOsc.stop();
          if (this.warningLFO) this.warningLFO.stop();
        } catch (_) {}
      }, 120);
    }
  }

  // Efeito sonoro colossal de EXPLOSÃO com sub-grave, impacto, estilhaços e resíduo de fogo
  playExplosion() {
    this.stopPour();
    this.stopWarning();
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. IMPACTO SUB-BASS (Tremor de chão)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.3);

    // 2. DETONAÇÃO DE RUÍDO (O estouro violento)
    const bufferSize = this.ctx.sampleRate * 2.0;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.45));
    }

    const blastNoise = this.ctx.createBufferSource();
    blastNoise.buffer = noiseBuffer;

    const blastFilter = this.ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(2200, now);
    blastFilter.frequency.exponentialRampToValueAtTime(100, now + 1.2);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.85, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    blastNoise.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.ctx.destination);
    blastNoise.start(now);

    // 3. ESTILHAÇOS DE VIDRO QUEBRANDO
    for (let i = 0; i < 6; i++) {
      const shardOsc = this.ctx.createOscillator();
      shardOsc.type = 'triangle';
      const delay = Math.random() * 0.25;
      const freq = 1600 + Math.random() * 2800;
      shardOsc.frequency.setValueAtTime(freq, now + delay);
      shardOsc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + delay + 0.3);

      const shardGain = this.ctx.createGain();
      shardGain.gain.setValueAtTime(0.0001, now);
      shardGain.gain.setValueAtTime(0.18, now + delay);
      shardGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

      shardOsc.connect(shardGain);
      shardGain.connect(this.ctx.destination);
      shardOsc.start(now + delay);
      shardOsc.stop(now + delay + 0.4);
    }
  }

  // Fanfarra de Sucesso / Drink Perfeito
  playSuccess() {
    this.stopPour();
    this.stopWarning();
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  }

  // Toque de clique na interface
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const audioSystem = new SoundFX();
