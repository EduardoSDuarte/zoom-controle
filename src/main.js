import * as tmImage from '@teachablemachine/image';
import './ui.js';

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
        .getElementById('viewfinder')
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

    console.log('Classe:', highestPrediction.className, 'Confiança:', highestPrediction.probability);

    window.onPrediction({
        classe: highestPrediction.className,
        confianca: highestPrediction.probability
    });
}
init();