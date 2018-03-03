'use strict';

const bleno = require(`bleno`);

class pixelsCharacteristic extends bleno.Characteristic {
    constructor(pixels) {
        super({
            uuid: '7d973ea0-1f0d-11e8-a96e-ed9798f4df2c',
            properties: ['read'],
            descriptors: [
                new bleno.Descriptor({
                    uuid: '2901',
                    value: 'Gets the dimensions of the pixel grid'
                })
            ],
            value: Buffer.from(JSON.stringify(pixels))
        });
    }
}

module.exports = pixelsCharacteristic;
