import * as tmImage from '@teachablemachine/image';

const MODEL_URL = '/';

let model;
let webcam;

async function init() {
    console.log('Carregando modelo...');

    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);

    console.log('Modelo carregado!');

    webcam = new tmImage.Webcam(320, 320, true);

    await webcam.setup();
    await webcam.play();

    document
        .getElementById('webcam-container')
        .appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let highestPrediction = prediction[0];

    for (let i = 0; i < prediction.length; i++) {

        if (
            prediction[i].probability >
            highestPrediction.probability
        ) {
            highestPrediction = prediction[i];
        }

        console.log(
            prediction[i].className,
            prediction[i].probability
        );
    }

    console.log(
        'Predição:',
        highestPrediction.className,
        'Confiança:',
        highestPrediction.probability
    );
}

init();