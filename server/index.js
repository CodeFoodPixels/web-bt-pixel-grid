'use strict';

const bleno = require(`bleno`);
const colorCharacteristic = require(`./colorCharacteristic.js`)
const dimensionsCharacteristic = require(`./dimensionsCharacteristic.js`)

const PIXELS = {
    width: 4,
    height: 4
};

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
                    new colorCharacteristic(PIXELS),
                    new dimensionsCharacteristic(PIXELS)
                ]
            })
        ]);
    }
});
