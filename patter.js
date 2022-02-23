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

        let canvas = createCanvas(150, 150);
        let ctx = canvas.getContext("2d");

        let y_offset = [
            -2,
            -1,
            0,
            -1,
            -3
        ]

        let y_scale = [
            1,
            0.8,
            0.6,
            0.8,
            1
        ]

        let hand_offset = [0, 0];
        let delay = 50;
        let i = 0

        for (let i = 0; i < 5; i++) {
            ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[i], 150, 150);
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