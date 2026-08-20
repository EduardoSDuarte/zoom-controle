const CONFIDENCE_THRESHOLD = 0.60; // abaixo disso, ação é ignorada
const ZOOM_STEP = 6;               // % de zoom ganho/perdido por predição aceita
const ZOOM_MIN = 50;
const ZOOM_MAX = 250;

let zoomLevel = 100;

// ---------- referências de DOM ----------
const el = {
  currentTag: document.getElementById('currentTag'),
  currentConf: document.getElementById('currentConf'),
  feedback: document.getElementById('feedback'),
  slideContent: document.getElementById('slideContent'),
  slideImage: document.getElementById('slideImage'),
  dialFill: document.getElementById('dialFill'),
  dialLabel: document.getElementById('dialLabel'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  bars: document.querySelectorAll('.bar'),
};

const DIAL_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52 no SVG

/* 
   FUNÇÃO PRINCIPAL  */
function onPrediction({ classe, confianca }) {
  setLive(true);
  updateBars(classe, confianca);
  updateCurrentClass(classe, confianca);
  applyZoomDecision(classe, confianca);
}
// expõe globalmente para o script do modelo poder chamar
window.onPrediction = onPrediction;

/* ---------- atualiza as barras de confiança ---------- */
function updateBars(classeAtiva, confiancaAtiva) {
  el.bars.forEach((bar) => {
    const nome = bar.dataset.class;
    const fill = bar.querySelector('.bar__fill');
    const valor = bar.querySelector('.bar__value');

    // sem dados reais das outras classes no mock: a ativa recebe a
    // confiança recebida, as outras dividem o restante de forma simples
    const pct = nome === classeAtiva
      ? confiancaAtiva * 100
      : ((1 - confiancaAtiva) / 2) * 100;

    fill.style.width = `${pct.toFixed(0)}%`;
    valor.textContent = `${pct.toFixed(0)}%`;
  });
}

/* ---------- atualiza o rótulo grande da classe atual ---------- */
function updateCurrentClass(classe, confianca) {
  el.currentTag.textContent = classe.toUpperCase();
  el.currentConf.textContent = `${(confianca * 100).toFixed(0)}%`;
}

/* ---------- decide se aplica zoom no slide ---------- */
function applyZoomDecision(classe, confianca) {
  if (confianca < CONFIDENCE_THRESHOLD) {
    setFeedback(`confiança insuficiente (${(confianca * 100).toFixed(0)}%) — ação ignorada`, 'ignored');
    return;
  }

  if (classe === 'zoom mais') {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    setFeedback('zoom mais aplicado', 'action');
  } else if (classe === 'zoom menos') {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    setFeedback('zoom menos aplicado', 'action');
  } else {
    setFeedback('neutro — zoom mantido', null);
  }

  renderZoom();
}

/* ---------- desenha o zoom no slide + no anel/dial ---------- */
function renderZoom() {
  el.slideImage.style.transform = `scale(${zoomLevel / 100})`;

  const pct = (zoomLevel - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN); // 0..1
  const offset = DIAL_CIRCUMFERENCE * (1 - pct);
  el.dialFill.style.strokeDashoffset = offset;
  el.dialLabel.textContent = `${zoomLevel}%`;
}

/* ---------- mensagem de feedback ---------- */
function setFeedback(texto, tipo) {
  el.feedback.textContent = texto;
  el.feedback.classList.remove('is-action', 'is-ignored');
  if (tipo === 'action') el.feedback.classList.add('is-action');
  if (tipo === 'ignored') el.feedback.classList.add('is-ignored');
}

function setLive(isLive) {
  el.statusDot.classList.toggle('live', isLive);
  el.statusText.textContent = isLive ? 'MODELO CONECTADO' : 'AGUARDANDO MODELO';
}

renderZoom();