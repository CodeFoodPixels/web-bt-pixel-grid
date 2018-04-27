'use strict';

const bleno = require(`bleno`);
class clearCharacteristic extends bleno.Characteristic {
    constructor(pixelGrid) {
        super({
            uuid: '49b98934-a3b4-4d1c-8cc5-06524a61a742',
            properties: ['writeWithoutResponse'],
            descriptors: [
                new bleno.Descriptor({
                    uuid: '2901',
                    value: 'Clears the pixel display'
                })
            ],
        });

        this.pixelGrid = pixelGrid;
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        if (data.toString() === 'clear'){
            this.pixelGrid.clear();
        }
    }
}

module.exports = clearCharacteristic;
