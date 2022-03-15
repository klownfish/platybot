"use strict";

const { createCanvas, loadImage } = require('canvas')
const GIF = require("gif.node")

class Patter {
    constructor() {
        this.hand_frames = [];
        this.init();
    }

    async init() {
        this.hand_frames = [
            await loadImage("./pat/pet0.gif"),
            await loadImage("./pat/pet1.gif"),
            await loadImage("./pat/pet2.gif"),
            await loadImage("./pat/pet3.gif"),
            await loadImage("./pat/pet4.gif"),
            await loadImage("./pat/pet5.gif"),
            await loadImage("./pat/pet6.gif"),
            await loadImage("./pat/pet7.gif"),
            await loadImage("./pat/pet8.gif"),
            await loadImage("./pat/pet9.gif")
        ]
    }

    async getPatGif(avatar) {
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        let avatar_img = await loadImage(avatar);

        let avatar_x = 15
        let avatar_y = 15
        let avatar_width = 150
        let avatar_height = 150
        let image_width = 180
        let image_height = 165
        let hand_x = 0
        let hand_y = 0

        let canvas = createCanvas(image_width, image_height);
        let ctx = canvas.getContext("2d");

        let y_scale = [
            1,
            0.95,
            0.9,
            0.85,
            0.8,
            0.8,
            0.85,
            0.9,
            0.95,
            1
        ]

        let x_scale = [
            0.80,
            0.85,
            0.90,
            0.95,
            1,
            1,
            0.95,
            0.90,
            0.85,
            0.80
        ]

        let hand_offset = [0, 0];
        let delay = 21;
        ctx.fillStyle = "#36393E"
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(0, 0, image_width, image_height)
            ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, (1 - x_scale[i]) * avatar_width / 2 + avatar_x, (1 - y_scale[i]) * avatar_height + avatar_y, avatar_width * x_scale[i], avatar_height * y_scale[i]);
            ctx.drawImage(this.hand_frames[i], ...hand_offset);
            gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { delay: delay })
        }

        let ret = new Promise((resolve, reject) => {
            gif.render();
            gif.on('finished', (blob) => {
                resolve(blob);
            })
        })
        return ret;
    }
}

module.exports = Patter;