"use strict";

const { createCanvas, loadImage } = require('canvas')
const GIF = require("gif.node")

class Deleter {
    constructor() {
    }

    async getDeleteGif(avatar) {
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        let avatar_img = await loadImage(avatar);

        let delay = 20;
        let frames = 40;
        let image_width = 200
        let image_height = 200

        let rotation_ang_vel = 0.05;
        let scale_dt = 0.03;


        let canvas = createCanvas(image_width, image_height);
        let ctx = canvas.getContext("2d");

        ctx.fillStyle = "#36393E"
        for (let i = 0; i < frames; i++) {
            let rotation = rotation_ang_vel * i;
            let scale = 1 - scale_dt * i;
            let width = image_width * scale
            let height = image_height * scale

            /*
            ctx.rotate(rotation);
            ctx.drawImage(avatar_img,  0, 0, avatar_img.width, avatar_img.height, 0, 0, width, height);
            */
            ctx.fillRect(0, 0, image_width, image_height)
            ctx.save()
            let pos = {x: image_width / 2, y: image_height / 2}
            ctx.translate(pos.x ,pos.y)    
            ctx.rotate(rotation)
            ctx.drawImage(avatar_img,0, 0, avatar_img.width, avatar_img.height, -image_width / 2 * scale, -image_height / 2 * scale, image_width * scale, image_height * scale);
            ctx.restore()
            gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { delay: i == 0 ? 3000 : delay })
        }
        ctx.fillRect(0, 0, image_width, image_height)
        gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { delay: 160000 })
        let ret = new Promise((resolve, reject) => {
            gif.render();
            gif.on('finished', (blob) => {
                resolve(blob);
            })
        })
        return ret;
    }
}

module.exports = Deleter;