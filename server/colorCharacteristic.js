'use strict';

const bleno = require(`bleno`);
const LED = require(`rpi-ws281x-native`);
const config = require('./config.json');

class colorCharacteristic extends bleno.Characteristic {
    constructor() {
        super({
            uuid: 'fadaf690-1f0d-11e8-a594-e1d1160981b7',
            properties: ['writeWithoutResponse'],
            descriptors: [
                new bleno.Descriptor({
                    uuid: '2901',
                    value: 'Sets the color of a pixel'
                })
            ],
        });

        this.pixelWidth = config.width;

        const numPixels = config.width * config.height;

        this.pixelData = new Uint32Array(numPixels);

        LED.init(numPixels, {brightness: Math.floor((255 / 100) * config.brightness)});

        LED.render(this.pixelData);

        process.on('SIGINT', function () {
            LED.reset();
            process.nextTick(function () { process.exit(0); });
        });
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        let [ x, y, color ] = data.toString().split(',');

        x = parseInt(x, 10);
        y = parseInt(y, 10);

        let pixel = y * this.pixelWidth;

        if (y % 2) {
            pixel += (this.pixelWidth - 1) - x;
        } else {
            pixel += x;
        }

        this.pixelData[pixel] = parseInt(color, 16);
        LED.render(this.pixelData);
    }
}

module.exports = colorCharacteristic;
