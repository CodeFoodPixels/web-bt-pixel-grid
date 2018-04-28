'use strict';

const bleno = require(`bleno`);
const colorCharacteristic = require(`./colorCharacteristic.js`);
const clearCharacteristic = require(`./clearCharacteristic.js`);
const dimensionsCharacteristic = require(`./dimensionsCharacteristic.js`);
const PixelGrid = require(`rpi-ws281x-grid`);
const config = require('./config.json');

const pixelGrid = PixelGrid(config);

bleno.on(`stateChange`, (state) => {
    if (state === `poweredOn`) {
        bleno.startAdvertising('Pixel Grid', ['9d407ea0-1f04-11e8-882c-e798277bf91c']);
    } else {
        bleno.stopAdvertising();
    }
});

bleno.on(`advertisingStart`, (error) => {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
        bleno.setServices([
            new bleno.PrimaryService({
                uuid: '9d407ea0-1f04-11e8-882c-e798277bf91c',
                characteristics: [
                    new colorCharacteristic(pixelGrid),
                    new clearCharacteristic(pixelGrid),
                    new dimensionsCharacteristic()
                ]
            })
        ]);
    }
});
