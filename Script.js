/* ============================================================
   ZOOM · CONTROLE — camada de interface (Nique)
   ------------------------------------------------------------
   O Eduardo vai chamar window.onPrediction({ classe, confianca })
   toda vez que o modelo (TensorFlow.js / Teachable Machine) fizer
   uma nova predição. Este arquivo só CONSOME esse resultado e
   desenha a tela — não sabe nada sobre webcam de predição real,
   TensorFlow, nem sobre como as classes foram treinadas.

   Classes esperadas: "Neutro", "Zoom +", "Zoom -"
   ============================================================ */

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

/* ============================================================
   FUNÇÃO PRINCIPAL — é isso que o Eduardo vai chamar
   ============================================================ */
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

  if (classe === 'Zoom +') {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    setFeedback('Zoom + aplicado', 'action');
  } else if (classe === 'Zoom -') {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    setFeedback('Zoom - aplicado', 'action');
  } else {
    setFeedback('Neutro — zoom mantido', null);
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

/* ============================================================
   WEBCAM — apenas exibição do vídeo (a predição é do Eduardo)
   ============================================================ */
const viewfinder = document.getElementById('viewfinder');
const camToggle = document.getElementById('camToggle');
const webcamVideo = document.getElementById('webcam');

camToggle.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamVideo.srcObject = stream;
    viewfinder.classList.add('is-active');
  } catch (err) {
    setFeedback('não foi possível acessar a webcam', 'ignored');
  }
});

/* ============================================================
   MOCK — simula predições chegando, só para testar a tela
   sem depender do modelo pronto. Depois é só apagar este
   bloco (ou desmarcar o checkbox) quando o script do Eduardo
   estiver chamando window.onPrediction de verdade.
   ============================================================ */
const mockToggle = document.getElementById('mockToggle');
let mockInterval = null;

function startMock() {
  const sequencia = ['Neutro', 'Zoom +', 'Zoom +', 'Zoom +', 'Neutro', 'Zoom -', 'Zoom -', 'Neutro'];
  let i = 0;

  mockInterval = setInterval(() => {
    const classe = sequencia[i % sequencia.length];
    const confianca = classe === 'Neutro'
      ? 0.55 + Math.random() * 0.2
      : 0.75 + Math.random() * 0.24;

    onPrediction({ classe, confianca: Math.min(confianca, 0.99) });
    i++;
  }, 1400);
}

function stopMock() {
  clearInterval(mockInterval);
  setLive(false);
}

mockToggle.addEventListener('change', () => {
  if (mockToggle.checked) startMock();
  else stopMock();
});

// inicializa
renderZoom();
if (mockToggle.checked) startMock();