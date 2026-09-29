// js/fluidCanvas.js - Renderização do Copo Medidor e Física dos Fluidos

export class GlassRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.capacity = 250; // ml
    this.contents = []; // [{ ingredientId, ml, color, density }]
    this.totalMl = 0;

    // Física da onda na superfície
    this.wavePhase = 0;
    this.waveAmp = 0;
    this.targetWaveAmp = 0;

    // Bolhas no líquido
    this.bubbles = [];
    this.initBubbles();

    // Tremedeira do copo por instabilidade
    this.shakeIntensity = 0;
  }

  setCapacity(capacity) {
    this.capacity = capacity;
  }

  setContents(contents) {
    this.contents = contents;
    this.totalMl = contents.reduce((acc, c) => acc + c.ml, 0);
  }

  setPouring(isPouring) {
    this.targetWaveAmp = isPouring ? 4.5 : 0.8;
  }

  setInstability(intensity) {
    this.shakeIntensity = intensity; // 0 a 1
    if (intensity > 0.4) {
      this.targetWaveAmp = Math.max(this.targetWaveAmp, intensity * 7);
    }
  }

  initBubbles() {
    this.bubbles = [];
    for (let i = 0; i < 22; i++) {
      this.bubbles.push({
        x: 0.15 + Math.random() * 0.7,
        y: Math.random(),
        radius: 1.2 + Math.random() * 2.5,
        speed: 0.003 + Math.random() * 0.007,
        swing: Math.random() * Math.PI * 2
      });
    }
  }

  draw(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Efeito de vibração do copo quando em perigo
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0.1) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 12;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 6;
    }

    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    // Parâmetros geométricos do copo medidor
    const padX = 35;
    const topY = 40;
    const botY = this.height - 25;
    const topW = this.width - padX * 2;
    const botW = topW * 0.82; // Leve formato cônico/copo de bar
    const glassLeftTop = padX;
    const glassRightTop = padX + topW;
    const glassLeftBot = padX + (topW - botW) / 2;
    const glassRightBot = glassLeftBot + botW;

    const fillRatio = Math.min(1.0, this.totalMl / this.capacity);
    const liquidTopY = botY - (botY - topY) * fillRatio;

    // 1. FUNDO DO COPO (Vidro translúcido escurecido)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(glassLeftTop, topY);
    this.ctx.lineTo(glassRightTop, topY);
    this.ctx.lineTo(glassRightBot, botY);
    this.ctx.arcTo(glassRightBot, botY + 12, glassRightBot - 12, botY + 12, 12);
    this.ctx.lineTo(glassLeftBot + 12, botY + 12);
    this.ctx.arcTo(glassLeftBot, botY + 12, glassLeftBot, botY, 12);
    this.ctx.closePath();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.fill();

    // Clip do copo para os líquidos não vazarem pelas bordas
    this.ctx.clip();

    // 2. RENDERIZAR CAMADAS DE LÍQUIDO
    if (this.totalMl > 0) {
      this.waveAmp += (this.targetWaveAmp - this.waveAmp) * 0.1;
      this.wavePhase += 0.12;

      let currentHeightFraction = 0;

      // Ordenar por densidade para separação visual realista de coquetel
      const sortedLayers = [...this.contents].sort((a, b) => (b.density || 1) - (a.density || 1));

      sortedLayers.forEach((layer, idx) => {
        const layerRatio = layer.ml / this.capacity;
        const startY = botY - (botY - topY) * currentHeightFraction;
        currentHeightFraction += layerRatio;
        const endY = botY - (botY - topY) * currentHeightFraction;

        this.ctx.save();
        this.ctx.beginPath();

        // Se for a camada superior, desenha a superfície ondulada
        if (idx === sortedLayers.length - 1) {
          this.ctx.moveTo(glassLeftBot - 20, startY);
          this.ctx.lineTo(glassRightBot + 20, startY);
          this.ctx.lineTo(glassRightBot + 20, endY);

          // Onda da superfície
          for (let x = glassRightBot + 20; x >= glassLeftBot - 20; x -= 8) {
            const wave = Math.sin(this.wavePhase + x * 0.04) * this.waveAmp;
            this.ctx.lineTo(x, endY + wave);
          }
        } else {
          this.ctx.moveTo(glassLeftBot - 20, startY);
          this.ctx.lineTo(glassRightBot + 20, startY);
          this.ctx.lineTo(glassRightBot + 20, endY);
          this.ctx.lineTo(glassLeftBot - 20, endY);
        }

        this.ctx.closePath();

        // Gradiente do líquido
        const grad = this.ctx.createLinearGradient(0, endY, 0, startY);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, layer.liquidColor || layer.color);
        this.ctx.fillStyle = grad;
        this.ctx.globalAlpha = 0.88;
        this.ctx.fill();

        // Brilho interno
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fill();

        this.ctx.restore();
      });

      // Efeito de fervura / brilho por instabilidade
      if (this.shakeIntensity > 0.2) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(239, 68, 68, ${Math.sin(time * 0.015) * 0.25 + 0.15})`;
        this.ctx.fillRect(glassLeftBot - 20, liquidTopY - 10, topW + 40, botY - liquidTopY + 20);
        this.ctx.restore();
      }

      // 3. BOLHAS SUBINDO
      this.bubbles.forEach((b) => {
        b.y -= b.speed * (1 + this.shakeIntensity * 3);
        b.swing += 0.05;
        if (b.y < 0) b.y = 1;

        const currentLiquidHeight = botY - liquidTopY;
        const bubbleActualY = botY - currentLiquidHeight * (1 - b.y);

        if (bubbleActualY > liquidTopY + 5 && bubbleActualY < botY) {
          const glassWAtY = botW + (topW - botW) * (1 - (bubbleActualY - topY) / (botY - topY));
          const leftAtY = (this.width - glassWAtY) / 2;
          const bubbleActualX = leftAtY + glassWAtY * b.x + Math.sin(b.swing) * 3;

          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(bubbleActualX, bubbleActualY, b.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          this.ctx.fill();
          this.ctx.restore();
        }
      });
    }

    this.ctx.restore(); // Fecha o clip

    // 4. DESENHAR BORDA DE VIDRO E REFLEXOS (Brilho e Realismo 3D)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(glassLeftTop, topY);
    this.ctx.lineTo(glassRightTop, topY);
    this.ctx.lineTo(glassRightBot, botY);
    this.ctx.arcTo(glassRightBot, botY + 12, glassRightBot - 12, botY + 12, 12);
    this.ctx.lineTo(glassLeftBot + 12, botY + 12);
    this.ctx.arcTo(glassLeftBot, botY + 12, glassLeftBot, botY, 12);
    this.ctx.closePath();

    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.stroke();

    // Borda superior arredondada (boca do copo)
    this.ctx.beginPath();
    this.ctx.ellipse(glassLeftTop + topW / 2, topY, topW / 2, 8, 0, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Reflexo de luz na lateral esquerda do vidro
    this.ctx.beginPath();
    this.ctx.moveTo(glassLeftTop + 8, topY + 15);
    this.ctx.lineTo(glassLeftBot + 8, botY - 8);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    this.ctx.restore();

    // 5. MARCAÇÕES GRADUADAS EM ML (Régua do Copo Medidor)
    this.drawGraduations(glassRightTop, glassRightBot, topY, botY, topW, botW);

    this.ctx.restore();
  }

  drawGraduations(rightTop, rightBot, topY, botY, topW, botW) {
    this.ctx.save();
    const stepMl = 50;
    const numSteps = Math.floor(this.capacity / stepMl);

    this.ctx.font = '600 12px "Outfit", sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (let ml = stepMl; ml <= this.capacity; ml += stepMl) {
      const frac = ml / this.capacity;
      const y = botY - (botY - topY) * frac;
      const glassWAtY = botW + (topW - botW) * frac;
      const rightX = (this.width + glassWAtY) / 2;

      // Traço da marcação
      this.ctx.beginPath();
      this.ctx.moveTo(rightX - 18, y);
      this.ctx.lineTo(rightX - 2, y);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Texto de ml
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(`${ml} ml`, rightX - 22, y);

      // Subdivisões menores (cada 10 ml)
      for (let sub = 10; sub < stepMl; sub += 10) {
        const subMl = ml - sub;
        if (subMl <= 0) continue;
        const subFrac = subMl / this.capacity;
        const subY = botY - (botY - topY) * subFrac;
        const subW = botW + (topW - botW) * subFrac;
        const subRightX = (this.width + subW) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(subRightX - 8, subY);
        this.ctx.lineTo(subRightX - 2, subY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }
}
