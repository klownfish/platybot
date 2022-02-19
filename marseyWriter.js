"use strict";

const { registerFont, createCanvas } = require('canvas')
const fs = require("fs");

const LETTER_WIDTH = 32;
const LETTER_HEIGHT = 80;
const LETTERS_PER_ROW = 25

class MarseyWriter {
    constructor() {
        this.init();
   }

    async init() {
        registerFont("./Marsey-Regular.ttf", {family: "Marsey"})
    }

    getMarseyText(text) {
        let font = "80px Marsey";
        let canvas = createCanvas(1,1);

        let ctx = canvas.getContext('2d')
        ctx.font = font;
        
        let lines = text.replace(/( *)\\n( *)/g, "\n").split("\n")
        let max_width = 0
        let total_height = 0
        for (let line of lines) {
            let size = ctx.measureText(line);
            max_width = Math.max(size.width, max_width);
            total_height += size.emHeightAscent + size.emHeightDescent;
        }

        canvas.width = max_width;
        canvas.height = total_height;

        ctx.font = font;
        ctx.fillStyle = "DarkOrange"

        let offset = 0;
        for (let line of lines) {
            let size = ctx.measureText(line);
            offset += size.emHeightAscent;
            ctx.fillText(line, 0, offset);
            offset += size.emHeightDescent;
        }
        return canvas.createPNGStream();
    }
}
module.exports = MarseyWriter;