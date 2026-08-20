import * as tmImage from '@teachablemachine/image';

const MODEL_URL = '/';

let model;
let webcam;

const CONFIDENCE_THRESHOLD = 0.80;

let actionLocked = false;

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

    if (predictedClass === 'neutro') {

        actionLocked = false;

        console.log(
            'Sistema liberado para novo comando.'
        );

        return;
    }

    if (actionLocked) {

        return;
    }

    if (predictedClass === 'zoom mais') {

        actionLocked = true;

        console.log(
            'AÇÃO: aumentar zoom'
        );
    }

    if (predictedClass === 'zoom menos') {

        actionLocked = true;

        console.log(
            'AÇÃO: diminuir zoom'
        );
    }
}

init();