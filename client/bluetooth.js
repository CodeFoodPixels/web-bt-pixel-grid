const serviceUuid = '9d407ea0-1f04-11e8-882c-e798277bf91c';
const colorCharacteristicUuid = 'fadaf690-1f0d-11e8-a594-e1d1160981b7';
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
    const encoder = new TextEncoder('utf-8');
    
    document.querySelector('#connect').classList.add('connected');
    document.querySelector('#editor').classList.add('connected');
  
    setupEditor(width, height, (x, y, color) => {
      const command = x + ',' + y + ',' + color.replace('#', '');

      colorCharacteristic.writeValue(encoder.encode(command))
        .catch(error => {
            console.log(error);
        });
    });
}


if (!navigator.bluetooth) {
    alert('You must use a Web Bluetooth enabled browser');
} else {
    document.querySelector('#connect').addEventListener('click', connect);
}