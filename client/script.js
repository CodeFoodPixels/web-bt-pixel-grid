if (!navigator.bluetooth) {
    alert('You must use a Web Bluetooth enabled browser');
} else {
    const encoder = new TextEncoder('utf-8');
    const decoder = new TextDecoder('utf-8');

    document.querySelector('#connect').addEventListener('click', async () => {
        const serviceUuid = '9d407ea0-1f04-11e8-882c-e798277bf91c';
        const colorCharacteristicUuid = 'fadaf690-1f0d-11e8-a594-e1d1160981b7';
        const dimensionsCharacteristicUuid = '7d973ea0-1f0d-11e8-a96e-ed9798f4df2c';

        const positionEl = document.querySelector('#position');
        const colourEl = document.querySelector('#color');

        const service = await navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUuid] }] }).then((device) => {
            return device.gatt.connect();
        }).then((server) => {
            return server.getPrimaryService(serviceUuid);
        })

        const dimensions = await service.getCharacteristic(dimensionsCharacteristicUuid).then((characteristic) => {
            return characteristic.readValue();
        }).then((value) => {
            return JSON.parse(decoder.decode(value));
        });

        const colourCharacteristic = await service.getCharacteristic(colorCharacteristicUuid);

        document.querySelector('#connect').style.display = 'none';
        document.querySelector('#controls').style.display = 'block';

        const widthPixel = Math.floor(window.innerWidth / dimensions.width);
        const heightPixel = Math.floor(window.innerHeight / dimensions.height);

        const pixelSize = widthPixel < heightPixel ? widthPixel : heightPixel;

        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', pixelSize * dimensions.width);
        canvas.setAttribute('height', pixelSize * dimensions.height);

        document.querySelector('#canvasContainer').appendChild(canvas);

        let color = '#ffffff';
        const colorPicker = document.querySelector('#color');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, pixelSize * dimensions.width, pixelSize * dimensions.height);

        function drawPixel(x, y, color) {
            x = (Math.ceil(x / pixelSize) * pixelSize) - pixelSize;
            y = (Math.ceil(y / pixelSize) * pixelSize) - pixelSize;

            ctx.fillStyle = color;
            ctx.fillRect(x, y, pixelSize, pixelSize);

            const command = x / pixelSize + ',' + y / pixelSize + ',' + colorPicker.value.replace('#', '');

            colourCharacteristic.writeValue(encoder.encode(command))
                .catch(error => { console.log(error); });
        }

        function getCanvasCoords(x, y) {
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

        function onMouseDown(e) {
            e.preventDefault();
            const position = getCanvasCoords(e.pageX, e.pageY);
            drawPixel(position.x, position.y, color);
            canvas.addEventListener('mousemove', moveDraw);
            canvas.addEventListener('touchmove', onTouchMove);
        }

        function onMouseUp(e) {
            e.preventDefault();
            canvas.removeEventListener('mousemove', moveDraw);
        }

        function onTouchMove(e) {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                moveDraw(e.touches[i]);
            }
        }

        function moveDraw(e) {
            const position = getCanvasCoords(e.pageX, e.pageY);

            const pixelData = ctx.getImageData(position.x, position.y, 1, 1).data;

            if (color !== getHexCode(pixelData)) {
                drawPixel(position.x, position.y, color);
            }
        }

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);

        colorPicker.addEventListener('change', () => {
            color = colorPicker.value;
        });
    });
}
