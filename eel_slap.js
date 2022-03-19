"use strict";

const { createCanvas, loadImage } = require('canvas')
const GIF = require("gif.node")

class EelSlapper {
    constructor() {
        this.eel_frames = [];
        this.wallpapers = []
        this.init();
    }

    async init() {
        for (let i = 6; i < 35; i++) {
            this.eel_frames.push(await loadImage(`./eel_slap/frame_${(i < 10 ? "0" : "") + i}_delay-0.1s.png`));
        }
        this.wallpapers = [
            await loadImage("./eel_slap/wp_cliffs.png"),
            await loadImage("./eel_slap/wp_oval.png"),
            await loadImage("./eel_slap/wp_mountain.png"),
            await loadImage("./eel_slap/wp_bobomb.png"),
            await loadImage("./eel_slap/wp_apollo.png"),
            await loadImage("./eel_slap/wp_bioshock.png"),
            await loadImage("./eel_slap/wp_school.png"),
            await loadImage("./eel_slap/wp_forest.png"),
            await loadImage("./eel_slap/wp_trench.png"),
            await loadImage("./eel_slap/wp_cyberpunk.png")
        ]
    }

    async getEelSlapGif(avatar) {
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        let avatar_img = await loadImage(avatar);

        let avatar_x = 150
        let avatar_y = 50
        let avatar_width = 150
        let avatar_height = 150
        let image_width = 475
        let image_height = 354
        let move_per_frame = -0.5
        let start_move_at = 14
        let squish = 0.995

        let canvas = createCanvas(image_width, image_height);
        let ctx = canvas.getContext("2d");

        let delay = 15;
        ctx.fillStyle = "yellowgreen"
        let wallpaper = this.wallpapers[Math.floor(Math.random() * this.wallpapers.length)]
        //let wallpaper = this.wallpapers[0]
        for (let i = 0; i < this.eel_frames.length; i++) {
            if (i >= start_move_at) {
                avatar_x += move_per_frame;
                avatar_width *= squish;
            }
            ctx.drawImage(wallpaper, 0, 0);
            ctx.drawImage(avatar_img, 0, 0, avatar_img.width, avatar_img.height, avatar_x, avatar_y, avatar_width, avatar_height);
            ctx.drawImage(this.eel_frames[i], 0, 0);
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

module.exports = EelSlapper;