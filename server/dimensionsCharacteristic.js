'use strict';

const bleno = require(`bleno`);
const config = require('./config.json');

class pixelsCharacteristic extends bleno.Characteristic {
    constructor() {
        super({
            uuid: '7d973ea0-1f0d-11e8-a96e-ed9798f4df2c',
            properties: ['read'],
            descriptors: [
                new bleno.Descriptor({
                    uuid: '2901',
                    value: 'Gets the dimensions of the pixel grid'
                })
            ],
            value: Buffer.from(JSON.stringify({
                width: config.width,
                height: config.height
            }))
        });
    }
}

module.exports = pixelsCharacteristic;
