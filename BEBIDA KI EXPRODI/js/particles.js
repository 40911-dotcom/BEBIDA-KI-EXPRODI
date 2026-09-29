// js/particles.js - Sistema de Partículas para Jatos de Líquido, Fumaça, Faíscas e Explosão Massiva

export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.splatters = []; // Respingos na tela que escorrem
    this.shockwaves = [];
    this.shards = []; // Estilhaços de vidro
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clear() {
    this.particles = [];
    this.splatters = [];
    this.shockwaves = [];
    this.shards = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Jato de líquido despejado da garrafa para o copo
  emitPourStream(startX, startY, targetX, targetY, color, count = 4) {
    for (let i = 0; i < count; i++) {
      const spreadX = (Math.random() - 0.5) * 6;
      this.particles.push({
        type: 'pour',
        x: startX + spreadX,
        y: startY,
        vx: (targetX - startX) * 0.05 + (Math.random() - 0.5) * 1.5,
        vy: 4 + Math.random() * 8,
        gravity: 0.65,
        radius: 2.5 + Math.random() * 2.5,
        color: color,
        alpha: 0.85,
        targetY: targetY + (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.02
      });
    }
  }

  // Respingos do choque do líquido com a superfície
  emitSplash(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        type: 'splash',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.35,
        radius: 1.5 + Math.random() * 2,
        color: color,
        alpha: 0.9,
        life: 1.0,
        decay: 0.05 + Math.random() * 0.05
      });
    }
  }

  // Fumaça e faíscas de perigo quando a mistura está quase explodindo
  emitDangerWarning(x, y, intensity = 0.5) {
    // Fumaça de vapor tóxico
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.5 - Math.random() * 2,
        radius: 6 + Math.random() * 8,
        growth: 0.4,
        color: Math.random() > 0.4 ? 'rgba(239, 68, 68, ' : 'rgba(50, 50, 50, ',
        alpha: 0.6 * intensity,
        life: 1.0,
        decay: 0.025
      });
    }

    // Faíscas elétricas
    if (Math.random() < 0.6 * intensity) {
      this.particles.push({
        type: 'spark',
        x: x + (Math.random() - 0.5) * 50,
        y: y - Math.random() * 20,
        vx: (Math.random() - 0.5) * 6,
        vy: -3 - Math.random() * 4,
        gravity: 0.3,
        length: 8 + Math.random() * 8,
        color: '#fbbf24',
        alpha: 1.0,
        life: 1.0,
        decay: 0.06
      });
    }
  }

  // Explosão catastrófica: onda de choque, fogo, cacos e respingos na lente/tela
  triggerExplosion(originX, originY, dominantColor = '#ef4444') {
    // 1. Onda de choque expansiva
    for (let i = 0; i < 3; i++) {
      this.shockwaves.push({
        x: originX,
        y: originY,
        radius: 10 + i * 20,
        maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.85,
        speed: 18 + i * 8,
        alpha: 0.9,
        lineWidth: 16 - i * 4,
        color: i === 0 ? '#ffffff' : (i === 1 ? '#f59e0b' : dominantColor)
      });
    }

    // 2. Bolas de fogo e fumaça densa
    const fireCount = 140;
    for (let i = 0; i < fireCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 22;
      const isFire = Math.random() > 0.3;
      const fireColors = ['#ffffff', '#fef08a', '#f59e0b', '#ef4444', dominantColor];
      const smokeColors = ['#1e293b', '#334155', '#475569'];

      this.particles.push({
        type: isFire ? 'fire' : 'explosion_smoke',
        x: originX + (Math.random() - 0.5) * 30,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        friction: 0.94,
        gravity: isFire ? 0.05 : -0.05,
        radius: 8 + Math.random() * 20,
        growth: isFire ? 0.3 : 0.8,
        color: isFire ? fireColors[Math.floor(Math.random() * fireColors.length)] : smokeColors[Math.floor(Math.random() * smokeColors.length)],
        alpha: 0.95,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.018
      });
    }

    // 3. Estilhaços de vidro pontiagudos giratórios
    const shardCount = 45;
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 18;
      this.shards.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        size: 8 + Math.random() * 16,
        aspect: 0.2 + Math.random() * 0.5,
        gravity: 0.45,
        bounceCount: 0,
        alpha: 0.9,
        life: 1.0,
        decay: 0.007
      });
    }

    // 4. Respingos violentos de líquido na lente da tela (efeito câmera/olho do jogador sujo)
    const splatterCount = 35;
    for (let i = 0; i < splatterCount; i++) {
      const destX = Math.random() * this.canvas.width;
      const destY = Math.random() * this.canvas.height;
      this.splatters.push({
        x: destX,
        y: destY,
        radius: 12 + Math.random() * 32,
        color: dominantColor,
        alpha: 0.85,
        dripLength: 0,
        maxDrip: 20 + Math.random() * 80,
        dripSpeed: 0.8 + Math.random() * 1.5,
        life: 1.0,
        decay: 0.002
      });
    }
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Desenhar Ondas de Choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= 0.025;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = Math.max(0, sw.alpha);
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 2. Desenhar Partículas Principais
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'pour') {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y >= p.targetY) {
          this.emitSplash(p.x, p.y, p.color, 2);
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha * p.life;
        this.ctx.fill();
        this.ctx.restore();

      } else if (p.type === 'splash') {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha * p.life;
        this.ctx.fill();
        this.ctx.restore();

      } else if (p.type === 'smoke' || p.type === 'explosion_smoke') {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += p.growth;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + (p.alpha * p.life) + ')';
        this.ctx.fill();
        this.ctx.restore();

      } else if (p.type === 'fire') {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.radius += p.growth;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha * p.life;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();

      } else if (p.type === 'spark') {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = p.alpha * p.life;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.stroke();
        this.ctx.restore();
      }
    }

    // 3. Desenhar Cacos de Vidro
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life -= s.decay;

      if (s.life <= 0) {
        this.shards.splice(i, 1);
        continue;
      }

      s.vy += s.gravity;
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;

      // Chão do balcão ou fundo da tela
      if (s.y > this.canvas.height - 30 && s.bounceCount < 2) {
        s.y = this.canvas.height - 30;
        s.vy = -s.vy * 0.4;
        s.vx *= 0.6;
        s.bounceCount++;
      }

      this.ctx.save();
      this.ctx.translate(s.x, s.y);
      this.ctx.rotate(s.rotation);
      this.ctx.beginPath();
      this.ctx.moveTo(-s.size, -s.size * s.aspect);
      this.ctx.lineTo(s.size, 0);
      this.ctx.lineTo(-s.size * 0.5, s.size * s.aspect);
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.75 * s.life) + ')';
      this.ctx.strokeStyle = 'rgba(200, 240, 255, ' + (0.9 * s.life) + ')';
      this.ctx.lineWidth = 1.5;
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 4. Desenhar Respingos na Lente que Escorrem
    for (let i = this.splatters.length - 1; i >= 0; i--) {
      const sp = this.splatters[i];
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        this.splatters.splice(i, 1);
        continue;
      }

      if (sp.dripLength < sp.maxDrip) {
        sp.dripLength += sp.dripSpeed;
      }

      this.ctx.save();
      this.ctx.fillStyle = sp.color;
      this.ctx.globalAlpha = sp.alpha * sp.life;

      // Mancha central
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Gotas satélites ao redor
      for (let s = 0; s < 3; s++) {
        const offX = Math.sin(s * 2.1) * (sp.radius * 1.3);
        const offY = Math.cos(s * 2.1) * (sp.radius * 1.3);
        this.ctx.beginPath();
        this.ctx.arc(sp.x + offX, sp.y + offY, sp.radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Rastro escorrendo
      if (sp.dripLength > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(sp.x - sp.radius * 0.25, sp.y);
        this.ctx.lineTo(sp.x + sp.radius * 0.25, sp.y);
        this.ctx.lineTo(sp.x + sp.radius * 0.1, sp.y + sp.dripLength);
        this.ctx.arc(sp.x, sp.y + sp.dripLength, sp.radius * 0.2, 0, Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }
}
