'use strict';

const LED = require(`rpi-ws281x-native`);

class pixelGrid {
    constructor(width, height, brightness) {
        this.pixelTranslation = [];

        for (let y = 0; y < height; y++) {
            this.pixelTranslation[y] = [];
            for (let x = 0; x < width; x++) {
                let pixel = y * width;

                if (y % 2) {
                    pixel += (width - 1) - x;
                } else {
                    pixel += x;
                }

                this.pixelTranslation[y][x] = pixel;
            }
        }

        const numPixels = width * height;

        this.pixelData = new Uint32Array(numPixels);

        LED.init(numPixels, { brightness: Math.floor((255 / 100) * brightness) });

        LED.render(this.pixelData);

        process.on('SIGINT', function () {
            LED.reset();
            process.nextTick(function () { process.exit(0); });
        });
    }

    fillPixel(x, y, color) {
        this.pixelData[this.pixelTranslation[y][x]] = parseInt(color, 16);
        LED.render(this.pixelData);
    }

    clear() {
        LED.reset();
    }
}

module.exports = pixelGrid;
