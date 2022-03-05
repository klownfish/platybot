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

    getMaxWidth(text) {
        text.replace(/\$".*" /, " ")
        for (let char in text) {
            if (char === "$") {
                
            }
        }
    }

    getMarseyText(text) {
        let font = "80px Marsey";
        let canvas = createCanvas(1,1);

        let ctx = canvas.getContext('2d')
        ctx.font = font;
        
        text = text.trim().replace(/( *)\\n( *)/g, "\n")
        let only_text = text.replace(/\$"[^"]*"/g, "").replace(/\#"[^"]*"/g, "").trimLeft()
        let max_width = 0
        let total_height = 0
        let line_heights = []
        let total_lines = 0;
        for (let line of only_text.split("\n")) {
            total_lines += 1
            let size = ctx.measureText(line);
            max_width = Math.max(size.width, max_width);
            total_height += size.emHeightAscent + size.emHeightDescent;
            line_heights.push({ascent: size.emHeightAscent, descent: size.emHeightDescent})
        }

        canvas.width = max_width;
        canvas.height = total_height;

        let text_color = "DarkOrange"
        let background_color = "none"
        ctx.font = font;
        let y = line_heights[0].ascent;
        let x = 0;
        let line = 0;
        let had_char_before = false;
        let lines_skipped = 0;
        for (let i = 0; i < text.length; i++) {
            let char = text[i]
            if (char === "\n") {
                if (background_color != "none") {
                    ctx.fillStyle = background_color;
                    ctx.fillRect(x, y + line_heights[line].descent, max_width - x + 1, -(line_heights[line].descent + line_heights[line].ascent + 1))
                }
                if (had_char_before) {
                    y += line_heights[line].descent
                    line++;
                    y += line_heights[line].ascent
                } else {
                    lines_skipped++;
                }
                x = 0
            }

            if (char === "$") {
                let color_end = text.indexOf(`"`, i + 2);
                if (text[i+1] != `"` || color_end == -1) {
                    return false;
                }
                text.indexOf(`"`, i + 1); 
                let color = text.substr(i + 2, color_end - i - 2);
                text_color = color;
                i = color_end; 
            } else 
            if (char === "#") {
                let color_end = text.indexOf(`"`, i + 2);
                if (text[i+1] != `"` || color_end == -1) {
                    return false;
                }
                text.indexOf(`"`, i + 1); 
                let color = text.substr(i + 2, color_end - i - 2);
                background_color = color;
                i = color_end;
            } else {
                if (!had_char_before && (char === " " || char === "\n")) {
                    continue
                }
                let size = ctx.measureText(char);

                if (background_color != "none") {
                    ctx.fillStyle = background_color;
                    ctx.fillRect(x, y + line_heights[line].descent, size.width + 1, -(line_heights[line].descent + line_heights[line].ascent + 1));
                }
                ctx.fillStyle = text_color
                ctx.fillText(char, x, y)
                x += size.width;
                had_char_before = true;
            }
        }

        if (background_color != "none") {
            ctx.fillStyle = background_color;
            let len = line_heights.length
            ctx.fillRect(x, y + line_heights[len - 1].descent, max_width - x + 1, -(line_heights[len - 1].descent + line_heights[len - 1].ascent + 1))
        }
        return canvas.createPNGStream();
    }
}
module.exports = MarseyWriter;