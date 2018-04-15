

let color = '#ffffff';

const pallette = [
    '#000000',
    '#797979',
    '#a2a2a2',
    '#305182',
    '#4192c3',
    '#61d3e3',
    '#a2fff3',
    '#306141',
    '#49a269',
    '#71e392',
    '#a2ffcb',
    '#386d00',
    '#49aa10',
    '#71f341',
    '#a2f3a2',
    '#386900',
    '#51a200',
    '#9aeb00',
    '#cbf382',
    '#495900',
    '#8a8a00',
    '#ebd320',
    '#fff392',
    '#794100',
    '#c37100',
    '#ffa200',
    '#ffdba2',
    '#a23000',
    '#e35100',
    '#ff7930',
    '#ffcbba',
    '#b21030',
    '#db4161',
    '#ff61b2',
    '#ffbaeb',
    '#9a2079',
    '#db41c3',
    '#f361ff',
    '#e3b2ff',
    '#6110a2',
    '#9241f3',
    '#a271ff',
    '#c3b2ff',
    '#2800ba',
    '#4141ff',
    '#5182ff',
    '#a2baff',
    '#2000b2',
    '#4161fb',
    '#61a2ff',
    '#92d3ff',
    '#797979',
    '#b2b2b2',
    '#ebebeb',
    '#ffffff'
];

async function connect() {
    const service = await navigator.bluetooth.requestDevice({
            filters: [
                { services: [ serviceUuid ] }
            ]
        }).then((device) => {
            return device.gatt.connect();
        }).then((server) => {
            return server.getPrimaryService(serviceUuid);
        });

    const dimensions = await service.getCharacteristic(dimensionsCharacteristicUuid)
        .then((characteristic) => {
            return characteristic.readValue();
        }).then((value) => {
            const decoder = new TextDecoder('utf-8');

            return JSON.parse(decoder.decode(value));
        });

    const colorCharacteristic = await service.getCharacteristic(colorCharacteristicUuid);

    buildPallette();
    setupCanvas(dimensions, colorCharacteristic);

    document.querySelector('#connect').classList.add('connected');
    document.querySelector('#controls').classList.add('connected');
}

function buildPallette() {
    const palletteEl = document.querySelector('#pallette');
  
    pallette.forEach((color) => {
        const button = document.createElement('button');
        button.classList.add('btn-color');
        button.setAttribute('data-color', color);
        button.style.backgroundColor = color;
        
        palletteEl.appendChild(button);
        button.addEventListener('click', setColorValue);
    });
}

function setupCanvas(dimensions, colorCharacteristic) {
    const widthPixel = Math.floor((window.innerWidth / dimensions.width));
    const heightPixel = Math.floor((window.innerHeight / dimensions.height));

    const pixelSize = widthPixel < heightPixel ? widthPixel : heightPixel;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', pixelSize * dimensions.width);
    canvas.setAttribute('height', pixelSize * dimensions.height);

    document.querySelector('#controls').appendChild(canvas);

    let color = '#ffffff';
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, pixelSize * dimensions.width, pixelSize * dimensions.height);

    canvas.addEventListener('touchstart', onCanvasMouseDown.bind(null, canvas, pixelSize, colorCharacteristic));
    canvas.addEventListener('mousedown', onCanvasMouseDown.bind(null, canvas, pixelSize, colorCharacteristic));
}

function drawPixel(canvas, pixelSize, colorCharacteristic, x, y, color) {
    const encoder = new TextEncoder('utf-8');

    x = (Math.ceil(x / pixelSize) * pixelSize) - pixelSize;
    y = (Math.ceil(y / pixelSize) * pixelSize) - pixelSize;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);

    const command = x / pixelSize + ',' + y / pixelSize + ',' + document.querySelector('#color').value.replace('#', '');

    colorCharacteristic.writeValue(encoder.encode(command))
        .catch(error => {
            console.log(error);
        });
}

function getCanvasCoords(canvas, x, y) {
    return {
        x: x - canvas.offsetLeft,
        y: y - canvas.offsetTop
    }
}

function getHexCode(pixelData) {
    let output = '#';

    for (let i = 0; i < 3; i++) {
        let part = pixelData[i].toString(16);

        if (part.length === 1) {
            part = '0' + part;
        }

        output += part;
    }

    return output;
}

function onCanvasMouseDown(canvas, pixelSize, colorCharacteristic, ev) {
    ev.preventDefault();

    const position = getCanvasCoords(canvas, ev.pageX, ev.pageY);

    drawPixel(canvas, pixelSize, colorCharacteristic, position.x, position.y, color);

    const boundMoveDraw = moveDraw.bind(null, canvas, pixelSize, colorCharacteristic);
    const boundTouchMove = onCanvasTouchMove.bind(null, canvas, pixelSize, colorCharacteristic);

    canvas.addEventListener('mousemove', boundMoveDraw);
    canvas.addEventListener('touchmove', boundTouchMove);
    canvas.addEventListener('mouseup', onCanvasMouseUp.bind(null, canvas, boundMoveDraw, boundTouchMove));

}

function onCanvasMouseUp(canvas, boundMoveDraw, boundTouchMove, ev) {
    ev.preventDefault();

    canvas.removeEventListener('mousemove', boundMoveDraw);
    canvas.removeEventListener('touchmove', boundTouchMove);
}

function onCanvasTouchMove(canvas, pixelSize, colorCharacteristic, ev) {
    ev.preventDefault();

    for (let i = 0; i < ev.touches.length; i++) {
        moveDraw(canvas, pixelSize, colorCharacteristic, ev.touches[i]);
    }
}

function moveDraw(canvas, pixelSize, colorCharacteristic, ev) {
    const position = getCanvasCoords(canvas, ev.pageX, ev.pageY);

    const pixelData = canvas.getContext('2d').getImageData(position.x, position.y, 1, 1).data;

    if (color !== getHexCode(pixelData)) {
        drawPixel(canvas, pixelSize, colorCharacteristic, position.x, position.y, color);
    }
}

function updateColor() {
    color = document.querySelector('#color').value;
}

function setColorValue() {
    document.querySelector('#color').value = this.getAttribute('data-color');
    updateColor();
}

if (!navigator.bluetooth) {
    alert('You must use a Web Bluetooth enabled browser');
} else {
    document.querySelector('#connect').addEventListener('click', connect);

    document.querySelector('#color').addEventListener('change', updateColor);
}
