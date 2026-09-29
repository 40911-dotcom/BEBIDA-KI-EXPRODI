// js/game.js - Lógica Central, Física da Dosagem, Verificação Química e Estados do Jogo
import { INGREDIENTS, LEVELS } from './recipes.js';
import { audioSystem } from './audio.js';
import { ParticleEngine } from './particles.js';
import { GlassRenderer } from './fluidCanvas.js';

class DrinkGame {
  constructor() {
    this.currentLevelIdx = 0;
    this.unlockedLevels = 1;
    this.levelStars = [0, 0, 0, 0, 0];
    this.score = 0;

    // Estado do copo
    this.glassContents = []; // [{ ingredientId, ml, color, liquidColor, density }]
    this.instability = 0.0; // 0.0 a 1.0
    this.isPouring = false;
    this.activeIngredientId = null;
    this.lastFrameTime = performance.now();
    this.isGameOver = false;

    // Elementos DOM
    this.viewport = document.getElementById('game-viewport');
    this.particleCanvas = document.getElementById('particle-canvas');
    this.glassCanvas = document.getElementById('glass-canvas');

    // UI Stats
    this.headerLevelBadge = document.getElementById('header-level-badge');
    this.headerScore = document.getElementById('header-score');
    this.headerStars = document.getElementById('header-stars');

    // UI Recipe
    this.recipeLevelTag = document.getElementById('recipe-level-tag');
    this.recipeDrinkName = document.getElementById('recipe-drink-name');
    this.recipeStory = document.getElementById('recipe-story');
    this.recipeItemsContainer = document.getElementById('recipe-items-container');
    this.recipeTipsText = document.getElementById('recipe-tips-text');

    // UI Danger
    this.dangerTitleBadge = document.getElementById('danger-title-badge');
    this.dangerStatusBadge = document.getElementById('danger-status-badge');
    this.dangerGaugeFill = document.getElementById('danger-gauge-fill');

    // UI Bottles & Station
    this.bottlesShelfContainer = document.getElementById('bottles-shelf-container');
    this.pouringIndicator = document.getElementById('pouring-indicator');
    this.pouringIndicatorDot = document.getElementById('pouring-indicator-dot');
    this.pouringIndicatorText = document.getElementById('pouring-indicator-text');
    this.btnDump = document.getElementById('btn-dump');
    this.btnServe = document.getElementById('btn-serve');

    // UI Modals
    this.modalKaboom = document.getElementById('modal-kaboom');
    this.kaboomReasonText = document.getElementById('kaboom-reason-text');
    this.btnRetry = document.getElementById('btn-retry');

    this.modalVictory = document.getElementById('modal-victory');
    this.victoryStarsBox = document.getElementById('victory-stars-box');
    this.victoryAccuracy = document.getElementById('victory-accuracy');
    this.victoryPoints = document.getElementById('victory-points');
    this.victoryMessage = document.getElementById('victory-message');
    this.btnReplayPhase = document.getElementById('btn-replay-phase');
    this.btnNextLevel = document.getElementById('btn-next-level');

    this.modalLevels = document.getElementById('modal-levels');
    this.levelsGridContainer = document.getElementById('levels-grid-container');
    this.btnCloseLevels = document.getElementById('btn-close-levels');
    this.btnLevels = document.getElementById('btn-levels');

    this.modalHelp = document.getElementById('modal-help');
    this.btnHelp = document.getElementById('btn-help');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnSound = document.getElementById('btn-sound');

    // Motores gráficos
    this.particleEngine = new ParticleEngine(this.particleCanvas);
    this.glassRenderer = new GlassRenderer(this.glassCanvas);

    this.loadSaveData();
    this.initEventListeners();
    this.loadLevel(this.currentLevelIdx);

    // Iniciar loop de animação
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadSaveData() {
    try {
      const savedUnlocked = localStorage.getItem('bebida_unlocked');
      if (savedUnlocked) this.unlockedLevels = Math.min(LEVELS.length, parseInt(savedUnlocked, 10));

      const savedScore = localStorage.getItem('bebida_score');
      if (savedScore) this.score = parseInt(savedScore, 10);

      const savedStars = localStorage.getItem('bebida_stars');
      if (savedStars) this.levelStars = JSON.parse(savedStars);
    } catch (_) {}
    this.updateHeaderStats();
  }

  saveGameData() {
    try {
      localStorage.setItem('bebida_unlocked', this.unlockedLevels);
      localStorage.setItem('bebida_score', this.score);
      localStorage.setItem('bebida_stars', JSON.stringify(this.levelStars));
    } catch (_) {}
  }

  updateHeaderStats() {
    this.headerLevelBadge.textContent = `${this.currentLevelIdx + 1} / ${LEVELS.length}`;
    this.headerScore.textContent = this.score;
    const totalStars = this.levelStars.reduce((a, b) => a + b, 0);
    this.headerStars.textContent = `⭐ ${totalStars}`;
  }

  loadLevel(index) {
    this.currentLevelIdx = index;
    this.isGameOver = false;
    this.instability = 0.0;
    this.stopPour();
    this.glassContents = [];
    this.clearModals();
    this.resetScreenShake();

    const level = LEVELS[this.currentLevelIdx];
    this.glassRenderer.setCapacity(level.glassCapacity);
    this.glassRenderer.setContents(this.glassContents);
    this.glassRenderer.setInstability(0);

    // Atualizar UI da receita
    this.recipeLevelTag.textContent = `Fase ${level.id}`;
    this.recipeDrinkName.textContent = level.drinkName;
    this.recipeStory.textContent = level.storyDialogue;
    this.recipeTipsText.textContent = level.tips;

    this.renderRecipeList(level);
    this.renderBottleShelf(level);
    this.updateDangerGauge(0);
    this.updateHeaderStats();
  }

  renderRecipeList(level) {
    this.recipeItemsContainer.innerHTML = '';

    level.recipe.forEach((item) => {
      const ing = INGREDIENTS[item.ingredientId];
      if (!ing) return;

      const card = document.createElement('div');
      card.className = 'recipe-item-card';
      card.id = `recipe-card-${ing.id}`;

      card.innerHTML = `
        <div class="recipe-item-top">
          <div>
            <span class="ingredient-color-dot" style="background-color: ${ing.color}; box-shadow: 0 0 8px ${ing.color};"></span>
            <span class="ingredient-name">${ing.name}</span>
          </div>
          <span class="ingredient-ml-badge" id="recipe-val-${ing.id}">0 / ${item.targetMl} ml</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="recipe-prog-${ing.id}" style="background-color: ${ing.color};"></div>
          <div class="progress-target-marker" style="left: ${(item.targetMl / level.glassCapacity) * 100}%;"></div>
        </div>
        <div class="tolerance-info">
          <span>Meta: <strong>${item.targetMl} ml</strong></span>
          <span>Tolerância: ±${level.tolerance} ml</span>
        </div>
      `;
      this.recipeItemsContainer.appendChild(card);
    });
  }

  renderBottleShelf(level) {
    this.bottlesShelfContainer.innerHTML = '';

    // Coletar todos os ingredientes desta fase
    const availableIngredients = level.recipe.map((r) => INGREDIENTS[r.ingredientId]);

    availableIngredients.forEach((ing, idx) => {
      const card = document.createElement('div');
      card.className = 'bottle-card';
      card.id = `bottle-${ing.id}`;
      card.setAttribute('data-id', ing.id);

      card.innerHTML = `
        <div class="bottle-graphic">
          <svg class="bottle-svg" viewBox="0 0 40 70">
            <!-- Gargalo e tampa -->
            <rect x="15" y="2" width="10" height="8" rx="2" fill="#94a3b8" />
            <rect x="16" y="10" width="8" height="14" rx="1" fill="rgba(255,255,255,0.4)" />
            <!-- Corpo de vidro da garrafa -->
            <path d="M 8 26 C 8 20, 16 18, 16 18 L 24 18 C 24 18, 32 20, 32 26 L 33 62 C 33 66, 30 68, 26 68 L 14 68 C 10 68, 7 66, 7 62 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
            <!-- Conteúdo líquido colorido -->
            <path d="M 9 32 L 31 32 L 32 60 C 32 64, 29 66, 25 66 L 15 66 C 11 66, 8 64, 8 60 Z" fill="${ing.liquidColor}" opacity="0.85" />
            <!-- Brilho no vidro -->
            <line x1="12" y1="28" x2="12" y2="60" stroke="#ffffff" stroke-width="2" opacity="0.35" stroke-linecap="round" />
          </svg>
        </div>
        <div class="bottle-details">
          <span class="bottle-name">${ing.name}</span>
          <span class="bottle-desc">${ing.description}</span>
        </div>
        <div class="bottle-hold-btn">
          <span>💧</span> Segure
        </div>
      `;

      // Eventos de clique contínuo (mouse e touch)
      const onStart = (e) => {
        e.preventDefault();
        audioSystem.init();
        if (this.isGameOver) return;
        this.startPour(ing.id, card);
      };

      card.addEventListener('mousedown', onStart);
      card.addEventListener('touchstart', onStart, { passive: false });

      this.bottlesShelfContainer.appendChild(card);
    });
  }

  startPour(ingredientId, cardElement) {
    if (this.isGameOver) return;
    this.isPouring = true;
    this.activeIngredientId = ingredientId;
    this.activeBottleCard = cardElement;

    if (cardElement) {
      cardElement.classList.add('pouring');
    }

    const ing = INGREDIENTS[ingredientId];
    this.pouringIndicator.classList.add('active');
    this.pouringIndicatorDot.style.backgroundColor = ing.color;
    this.pouringIndicatorDot.style.width = '10px';
    this.pouringIndicatorDot.style.height = '10px';
    this.pouringIndicatorDot.style.borderRadius = '50%';
    this.pouringIndicatorDot.style.display = 'inline-block';
    this.pouringIndicatorDot.style.boxShadow = `0 0 10px ${ing.color}`;
    this.pouringIndicatorText.textContent = `Despejando: ${ing.shortName}...`;

    this.glassRenderer.setPouring(true);
    audioSystem.startPour();
  }

  stopPour() {
    if (!this.isPouring) return;
    this.isPouring = false;
    this.activeIngredientId = null;

    if (this.activeBottleCard) {
      this.activeBottleCard.classList.remove('pouring');
      this.activeBottleCard = null;
    }

    document.querySelectorAll('.bottle-card.pouring').forEach((c) => c.classList.remove('pouring'));
    this.pouringIndicator.classList.remove('active');
    this.glassRenderer.setPouring(false);
    audioSystem.stopPour();
  }

  initEventListeners() {
    // Parar de despejar se o usuário soltar o clique em qualquer lugar da tela
    window.addEventListener('mouseup', () => this.stopPour());
    window.addEventListener('touchend', () => this.stopPour());
    window.addEventListener('touchcancel', () => this.stopPour());

    // Botão de Esvaziar Copo
    this.btnDump.addEventListener('click', () => {
      audioSystem.playClick();
      this.dumpGlass();
    });

    // Botão de Servir Coquetel
    this.btnServe.addEventListener('click', () => {
      audioSystem.playClick();
      this.serveDrink();
    });

    // Botão de Tentar Novamente após explosão
    this.btnRetry.addEventListener('click', () => {
      audioSystem.playClick();
      this.loadLevel(this.currentLevelIdx);
    });

    // Botões de Vitória
    this.btnReplayPhase.addEventListener('click', () => {
      audioSystem.playClick();
      this.loadLevel(this.currentLevelIdx);
    });

    this.btnNextLevel.addEventListener('click', () => {
      audioSystem.playClick();
      if (this.currentLevelIdx + 1 < LEVELS.length) {
        this.loadLevel(this.currentLevelIdx + 1);
      } else {
        this.loadLevel(0); // Volta ao início ou loop
      }
    });

    // Botão de Áudio (Mute/Unmute)
    this.btnSound.addEventListener('click', () => {
      const isMuted = audioSystem.toggleMute();
      this.btnSound.textContent = isMuted ? '🔇' : '🔊';
      audioSystem.playClick();
    });

    // Modal de Fases
    this.btnLevels.addEventListener('click', () => {
      audioSystem.playClick();
      this.openLevelsModal();
    });

    this.btnCloseLevels.addEventListener('click', () => {
      audioSystem.playClick();
      this.modalLevels.classList.remove('active');
    });

    // Modal de Ajuda
    this.btnHelp.addEventListener('click', () => {
      audioSystem.playClick();
      this.modalHelp.classList.add('active');
    });

    this.btnCloseHelp.addEventListener('click', () => {
      audioSystem.playClick();
      this.modalHelp.classList.remove('active');
    });

    // Teclas de atalho (1 a 5 para dosar as garrafas correspondentes)
    window.addEventListener('keydown', (e) => {
      if (this.isGameOver) return;
      const num = parseInt(e.key, 10);
      const level = LEVELS[this.currentLevelIdx];
      if (num >= 1 && num <= level.recipe.length && !this.isPouring) {
        const item = level.recipe[num - 1];
        const card = document.getElementById(`bottle-${item.ingredientId}`);
        this.startPour(item.ingredientId, card);
      }
    });

    window.addEventListener('keyup', (e) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5 && this.isPouring) {
        this.stopPour();
      }
    });
  }

  dumpGlass() {
    this.stopPour();
    this.glassContents = [];
    this.instability = 0.0;
    this.glassRenderer.setContents(this.glassContents);
    this.glassRenderer.setInstability(0);
    this.updateDangerGauge(0);
    this.resetScreenShake();
    this.particleEngine.clear();
    this.updateRecipeProgressUI();
  }

  openLevelsModal() {
    this.levelsGridContainer.innerHTML = '';
    LEVELS.forEach((lvl, idx) => {
      const isLocked = idx >= this.unlockedLevels;
      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : ''}`;

      const starsCount = this.levelStars[idx] || 0;
      const starsDisplay = isLocked ? '🔒 Bloqueada' : '⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount);

      card.innerHTML = `
        <span class="level-num">${lvl.id}</span>
        <span class="level-name-small">${lvl.drinkName}</span>
        <span class="level-card-stars">${starsDisplay}</span>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          audioSystem.playClick();
          this.modalLevels.classList.remove('active');
          this.loadLevel(idx);
        });
      }

      this.levelsGridContainer.appendChild(card);
    });

    this.modalLevels.classList.add('active');
  }

  clearModals() {
    this.modalKaboom.classList.remove('active');
    this.modalVictory.classList.remove('active');
    this.modalLevels.classList.remove('active');
    this.modalHelp.classList.remove('active');
  }

  resetScreenShake() {
    this.viewport.className = '';
  }

  setScreenShake(level) {
    this.viewport.className = level;
  }

  // LOOP PRINCIPAL DO JOGO
  gameLoop(currentTime) {
    const dt = Math.min(0.05, (currentTime - this.lastFrameTime) / 1000);
    this.lastFrameTime = currentTime;

    if (!this.isGameOver) {
      if (this.isPouring && this.activeIngredientId) {
        this.handlePouringPhysics(dt);
      }
      this.evaluateInstability();
    }

    // Renderizar simulação do copo e líquidos
    this.glassRenderer.draw(currentTime);

    // Renderizar motor de partículas (ondas de choque, respingos, explosão)
    this.particleEngine.updateAndDraw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  handlePouringPhysics(dt) {
    const ing = INGREDIENTS[this.activeIngredientId];
    if (!ing) return;

    // Calcular incremento de ml baseado na taxa de fluxo
    const addedMl = ing.pourRate * dt;

    let existing = this.glassContents.find((c) => c.ingredientId === ing.id);
    if (!existing) {
      existing = {
        ingredientId: ing.id,
        name: ing.name,
        ml: 0,
        color: ing.color,
        liquidColor: ing.liquidColor,
        density: ing.density
      };
      this.glassContents.push(existing);
    }
    existing.ml += addedMl;

    this.glassRenderer.setContents(this.glassContents);
    this.updateRecipeProgressUI();

    // Partículas do jato caindo no copo
    const glassRect = this.glassCanvas.getBoundingClientRect();
    const targetX = glassRect.left + glassRect.width / 2;
    const targetY = glassRect.top + glassRect.height * 0.45;

    let startX = targetX;
    let startY = glassRect.top - 20;

    if (this.activeBottleCard) {
      const bRect = this.activeBottleCard.getBoundingClientRect();
      startX = bRect.left + 20;
      startY = bRect.top + bRect.height / 2;
    }

    this.particleEngine.emitPourStream(startX, startY, targetX, targetY, ing.color, 3);

    // Atualizar pitch sonoro baseado no nível do copo
    const currentTotal = this.glassContents.reduce((acc, c) => acc + c.ml, 0);
    const level = LEVELS[this.currentLevelIdx];
    audioSystem.updatePourPitch(currentTotal / level.glassCapacity);
  }

  updateRecipeProgressUI() {
    const level = LEVELS[this.currentLevelIdx];

    level.recipe.forEach((item) => {
      const ing = INGREDIENTS[item.ingredientId];
      const added = this.glassContents.find((c) => c.ingredientId === ing.id);
      const currentMl = added ? added.ml : 0;

      const badge = document.getElementById(`recipe-val-${ing.id}`);
      const prog = document.getElementById(`recipe-prog-${ing.id}`);
      const card = document.getElementById(`recipe-card-${ing.id}`);

      if (badge && prog && card) {
        badge.textContent = `${currentMl.toFixed(1)} / ${item.targetMl} ml`;
        const pct = Math.min(130, (currentMl / item.targetMl) * 100);
        prog.style.width = `${pct}%`;

        // Cores de status no cartão da receita
        const diff = currentMl - item.targetMl;
        if (Math.abs(diff) <= level.tolerance && currentMl >= item.targetMl - level.tolerance) {
          card.classList.add('completed');
          card.classList.remove('overdosed');
        } else if (diff > level.tolerance) {
          card.classList.remove('completed');
          card.classList.add('overdosed');
        } else {
          card.classList.remove('completed');
          card.classList.remove('overdosed');
        }
      }
    });
  }

  evaluateInstability() {
    const level = LEVELS[this.currentLevelIdx];
    let maxExcessRatio = 0.0;
    let criticalIngredient = null;
    let totalMl = 0;

    this.glassContents.forEach((c) => {
      totalMl += c.ml;
      const targetItem = level.recipe.find((r) => r.ingredientId === c.ingredientId);

      if (!targetItem) {
        // Ingrediente proibido/não pertencente à receita!
        const ratio = c.ml / 15;
        if (ratio > maxExcessRatio) {
          maxExcessRatio = ratio;
          criticalIngredient = c.name;
        }
      } else {
        const excess = c.ml - targetItem.targetMl;
        if (excess > 0) {
          // Excedeu o ponto ideal!
          const excessRatio = excess / (level.tolerance * 1.6);
          if (excessRatio > maxExcessRatio) {
            maxExcessRatio = excessRatio;
            criticalIngredient = c.name;
          }
        }
      }
    });

    // Checar transbordamento do copo
    if (totalMl > level.glassCapacity + 10) {
      maxExcessRatio = Math.max(maxExcessRatio, 1.2);
      criticalIngredient = 'Volume Total (Transbordou!)';
    }

    this.instability = Math.min(1.0, maxExcessRatio);
    this.updateDangerGauge(this.instability);
    this.glassRenderer.setInstability(this.instability);

    // Efeitos dinâmicos conforme instabilidade aumenta
    if (this.instability > 0.3) {
      audioSystem.startWarning(this.instability);
      audioSystem.updateWarning(this.instability);

      const glassRect = this.glassCanvas.getBoundingClientRect();
      const glassCenterX = glassRect.left + glassRect.width / 2;
      const glassTopY = glassRect.top + 80;
      this.particleEngine.emitDangerWarning(glassCenterX, glassTopY, this.instability);

      if (this.instability > 0.75) {
        this.setScreenShake('shake-medium');
      } else if (this.instability > 0.45) {
        this.setScreenShake('shake-light');
      }
    } else {
      audioSystem.stopWarning();
      this.resetScreenShake();
    }

    // GATILHO DA EXPLOSÃO IMINENTE (se atingir 100% de instabilidade)
    if (this.instability >= 1.0) {
      const reason = `Você exagerou violentamente na dosagem de ${criticalIngredient}! A reação molecular causou superaquecimento imediato!`;
      this.triggerExplosion(reason);
    }
  }

  updateDangerGauge(val) {
    const pct = Math.min(100, Math.round(val * 100));
    this.dangerGaugeFill.style.width = `${pct}%`;

    if (val > 0.75) {
      this.dangerTitleBadge.className = 'danger-title critical';
      this.dangerStatusBadge.className = 'danger-status critical';
      this.dangerStatusBadge.textContent = 'CRÍTICO! VAI EXPLODIR!';
      this.dangerGaugeFill.classList.add('critical');
    } else if (val > 0.4) {
      this.dangerTitleBadge.className = 'danger-title';
      this.dangerStatusBadge.className = 'danger-status warning';
      this.dangerStatusBadge.textContent = 'INSTÁVEL / PERIGO';
      this.dangerGaugeFill.classList.remove('critical');
    } else {
      this.dangerTitleBadge.className = 'danger-title';
      this.dangerStatusBadge.className = 'danger-status';
      this.dangerStatusBadge.textContent = 'ESTÁVEL';
      this.dangerGaugeFill.classList.remove('critical');
    }
  }

  triggerExplosion(reasonText) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.stopPour();
    audioSystem.stopWarning();

    // Tremor violento na tela
    this.setScreenShake('shake-severe');

    // Reproduzir áudio de explosão devastador
    audioSystem.playExplosion();

    // Partículas e fogo centrados no copo
    const glassRect = this.glassCanvas.getBoundingClientRect();
    const centerX = glassRect.left + glassRect.width / 2;
    const centerY = glassRect.top + glassRect.height / 2;

    const dominantColor = this.glassContents.length > 0 ? this.glassContents[0].color : '#ef4444';
    this.particleEngine.triggerExplosion(centerX, centerY, dominantColor);

    // Esvaziar o copo estilhaçado
    this.glassContents = [];
    this.glassRenderer.setContents([]);

    // Exibir modal KABOOM após breve impacto
    setTimeout(() => {
      this.kaboomReasonText.textContent = reasonText;
      this.modalKaboom.classList.add('active');
    }, 600);
  }

  serveDrink() {
    if (this.isGameOver) return;
    this.stopPour();

    const level = LEVELS[this.currentLevelIdx];
    let totalDeviation = 0;
    let missingIngredient = false;
    let failedIngredient = null;
    let totalAddedMl = 0;

    // Verificar cada ingrediente da receita
    level.recipe.forEach((item) => {
      const added = this.glassContents.find((c) => c.ingredientId === item.ingredientId);
      const currentMl = added ? added.ml : 0;
      totalAddedMl += currentMl;

      const diff = Math.abs(currentMl - item.targetMl);
      totalDeviation += diff;

      if (currentMl < 2) {
        missingIngredient = true;
        failedIngredient = INGREDIENTS[item.ingredientId].name;
      } else if (diff > level.tolerance) {
        failedIngredient = INGREDIENTS[item.ingredientId].name;
      }
    });

    if (totalAddedMl === 0) {
      alert('O copo está vazio! Despeje os ingredientes antes de servir.');
      return;
    }

    // Se faltou algum ingrediente obrigatório ou se errou a medida na hora de servir:
    if (missingIngredient) {
      this.triggerExplosion(`Você esqueceu de adicionar ${failedIngredient}! Sem ele, a fórmula virou uma bomba de choque ao servir!`);
      return;
    }

    if (failedIngredient) {
      this.triggerExplosion(`Ao servir e misturar o drink, a proporção errada de ${failedIngredient} provocou uma reação explosiva na taça!`);
      return;
    }

    // VITÓRIA! O DRINK DEU CERTO!
    this.isGameOver = true;
    audioSystem.playSuccess();
    this.resetScreenShake();

    const avgDeviation = totalDeviation / level.recipe.length;
    const accuracy = Math.max(70, Math.min(100, Math.round(100 - avgDeviation * 4)));

    // Cálculo das estrelas
    let stars = 1;
    if (avgDeviation <= level.tolerance * 0.35) {
      stars = 3;
    } else if (avgDeviation <= level.tolerance * 0.7) {
      stars = 2;
    }

    const earnedPoints = Math.round(stars * 400 + accuracy * 5);
    this.score += earnedPoints;

    // Atualizar recorde de estrelas
    if (stars > (this.levelStars[this.currentLevelIdx] || 0)) {
      this.levelStars[this.currentLevelIdx] = stars;
    }

    // Desbloquear próxima fase
    if (this.currentLevelIdx + 1 >= this.unlockedLevels && this.unlockedLevels < LEVELS.length) {
      this.unlockedLevels = this.currentLevelIdx + 2;
    }

    this.saveGameData();
    this.updateHeaderStats();

    // Renderizar estrelas no modal
    this.victoryStarsBox.innerHTML = '';
    for (let s = 0; s < 3; s++) {
      const starSpan = document.createElement('span');
      starSpan.className = s < stars ? 'star-earned' : 'star-empty';
      starSpan.textContent = '⭐';
      this.victoryStarsBox.appendChild(starSpan);
    }

    this.victoryAccuracy.textContent = `${accuracy}%`;
    this.victoryPoints.textContent = `+${earnedPoints}`;

    const victoryTexts = [
      'Alquimia impecável! Os clientes do bar estão aplaudindo de pé!',
      'Drink refinado e sem nenhuma perda material ou biológica!',
      'Perfeito! O Conselho Galáctico de Bartenders aprova essa obra de arte!'
    ];
    this.victoryMessage.textContent = victoryTexts[stars - 1] || victoryTexts[0];

    // Atualizar botão de próxima fase se for a última
    if (this.currentLevelIdx + 1 >= LEVELS.length) {
      this.btnNextLevel.innerHTML = '<span>🏆</span> Zerou o Jogo!';
    } else {
      this.btnNextLevel.innerHTML = '<span>🚀</span> Próxima Fase';
    }

    setTimeout(() => {
      this.modalVictory.classList.add('active');
    }, 400);
  }
}

// Inicializar quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  new DrinkGame();
});
