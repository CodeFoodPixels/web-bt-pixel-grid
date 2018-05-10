const serviceUuid = '9d407ea0-1f04-11e8-882c-e798277bf91c';
const colorCharacteristicUuid = 'fadaf690-1f0d-11e8-a594-e1d1160981b7';
const clearCharacteristicUuid = '49b98934-a3b4-4d1c-8cc5-06524a61a742';
const dimensionsCharacteristicUuid = '7d973ea0-1f0d-11e8-a96e-ed9798f4df2c';

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

    const {width, height} = await service.getCharacteristic(dimensionsCharacteristicUuid)
        .then((characteristic) => {
            return characteristic.readValue();
        }).then((value) => {
            const decoder = new TextDecoder('utf-8');

            return JSON.parse(decoder.decode(value));
        });

    const colorCharacteristic = await service.getCharacteristic(colorCharacteristicUuid);
    const clearCharacteristic = await service.getCharacteristic(clearCharacteristicUuid);
    const encoder = new TextEncoder('utf-8');

    document.querySelector('#connect').classList.add('connected');
    document.querySelector('#editor').classList.add('connected');

    setupEditor(width, height, writePixel, clear);

    function clear() {
        clearCharacteristic.writeValue(encoder.encode('clear'));
    }

    const writeQueue = [];

    function writePixel(x, y, color) {
        const command = x + ',' + y + ',' + color.replace('#', '');

        writeQueue.push(command);
    }

    setInterval(async () => {
        if (writeQueue.length > 0) {
            const command = writeQueue.shift();

            await colorCharacteristic.writeValue(encoder.encode(command))
                .catch(error => {
                    console.log(error);
                });
        }
    }, 1);
}


if (!navigator.bluetooth) {
    alert('You must use a Web Bluetooth enabled browser');
} else {
    document.querySelector('#connect').addEventListener('click', connect);
}
