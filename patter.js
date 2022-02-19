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
        let hand_offset = [0, 0];
        let delay = 50;

        ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[0], 150, 150);
        ctx.drawImage(this.hand_frames[0], ...hand_offset);
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[1], 150, 150);
        ctx.drawImage(this.hand_frames[1], ...hand_offset);
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[2], 150, 150);
        ctx.drawImage(this.hand_frames[2], ...hand_offset);
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[3], 150, 150);
        ctx.drawImage(this.hand_frames[3], ...hand_offset);
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, 0, y_offset[4], 150, 150);
        ctx.drawImage(this.hand_frames[4], ...hand_offset);
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), {delay: delay})
        
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