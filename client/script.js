const serviceUuid = '9d407ea0-1f04-11e8-882c-e798277bf91c';
const colorCharacteristicUuid = 'fadaf690-1f0d-11e8-a594-e1d1160981b7';
const dimensionsCharacteristicUuid = '7d973ea0-1f0d-11e8-a96e-ed9798f4df2c';

let color = '#ffffff';

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

    setupCanvas(dimensions, colorCharacteristic);

    document.querySelector('#connect').classList.add('connected');
    document.querySelector('#controls').classList.add('connected');
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

    document.querySelectorAll('.btn-color').forEach((el) => {
        el.addEventListener('click', setColorValue);
    });
}
