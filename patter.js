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
            await loadImage("./pat/pat0.png"),
            await loadImage("./pat/pat1.png"),
            await loadImage("./pat/pat2.png"),
            await loadImage("./pat/pat3.png"),
            await loadImage("./pat/pat4.png")
        ]
    }

    async getPatGif(avatar) {
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        let avatar_img = await loadImage(avatar);

        let avatar_offset_x = 15
        let avatar_offset_y = 15
        let canvas = createCanvas(150 + avatar_offset_x, 150 + avatar_offset_y);
        let ctx = canvas.getContext("2d");

        let y_scale = [
            1,
            0.9,
            0.8,
            0.9,
            1
        ]

        let x_scale = [
            0.9,
            0.95,
            1,
            0.95,
            0.9
        ]

        let hand_offset = [0, 0];
        let delay = 50;
        ctx.fillStyle = "#36393E"
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(0, 0, 150 + avatar_offset_x, 150 + avatar_offset_y)
            ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, (1 - x_scale[i]) * 150 + avatar_offset_x, (1 - y_scale[i]) * 150 + avatar_offset_y, 150 * x_scale[i], 150 * y_scale[i]);
            ctx.drawImage(this.hand_frames[i], ...hand_offset);
            gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})
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