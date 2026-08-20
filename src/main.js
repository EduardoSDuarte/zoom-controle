import * as tmImage from '@teachablemachine/image';

const MODEL_URL = '/';

let model;
let webcam;

const CONFIDENCE_THRESHOLD = 0.80;

let actionLocked = false;

let currentZoom = 100;

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

/**
 * Inicializa o modelo e a webcam.
 */
async function init() {

    console.log('Carregando modelo...');

    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';

    model = await tmImage.load(
        modelURL,
        metadataURL
    );

    console.log('Modelo carregado!');

    webcam = new tmImage.Webcam(
        320,
        320,
        true
    );

    await webcam.setup();

    await webcam.play();

    document
        .getElementById('webcam-container')
        .appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

/**
 * Atualiza a webcam e realiza
 * novas previsões continuamente.
 */
async function loop() {

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);
}

/**
 * Realiza a classificação da imagem
 * capturada pela webcam.
 */
async function predict() {

    const predictions =
        await model.predict(
            webcam.canvas
        );

    let highestPrediction =
        predictions[0];

    for (const prediction of predictions) {

        if (
            prediction.probability >
            highestPrediction.probability
        ) {

            highestPrediction =
                prediction;
        }
    }

    const predictedClass =
        highestPrediction.className;

    const confidence =
        highestPrediction.probability;

    console.log(
        'Classe:',
        predictedClass
    );

    console.log(
        'Confiança:',
        confidence
    );

    if (
        confidence <
        CONFIDENCE_THRESHOLD
    ) {

        console.log(
            'Predição ignorada: confiança abaixo de 80%'
        );

        return;
    }

    console.log('Predição passou pelo limiar!');

    console.log(
    'Classe recebida pela lógica:',
    predictedClass
);

    if (predictedClass === 'neutro') {

        actionLocked = false;

        console.log(
            'Sistema liberado para novo comando.'
        );

        return;
    }

console.log(
    'Estado do bloqueio:',
    actionLocked
);

if (actionLocked) {

    console.log(
        'AÇÃO BLOQUEADA'
    );

    return;
}

    if (actionLocked) {

        return;
    }

    if (predictedClass === 'zoom mais') {

      console.log('ENTROU NO ZOOM MAIS');

        actionLocked = true;

        zoomIn();

        console.log(
            'AÇÃO: aumentar zoom'
        );
    }

    if (predictedClass === 'zoom menos') {

        actionLocked = true;

        zoomOut();

        console.log(
            'AÇÃO: diminuir zoom'
        );
    }
}

/**
 * Aumenta o nível de zoom.
 */
function zoomIn() {

    currentZoom += ZOOM_STEP;

    if (currentZoom > MAX_ZOOM) {

        currentZoom = MAX_ZOOM;

    }

    console.log(
        `Zoom atual: ${currentZoom}%`
    );
}

/**
 * Diminui o nível de zoom.
 */
function zoomOut() {

    currentZoom -= ZOOM_STEP;

    if (currentZoom < MIN_ZOOM) {

        currentZoom = MIN_ZOOM;

    }

    console.log(
        `Zoom atual: ${currentZoom}%`
    );
}

init();