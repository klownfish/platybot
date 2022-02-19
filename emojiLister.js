const fs = require('fs');

if (process.argv.length != 4) {
    console.log("usage")
    process.exit(1);
}

let emojis = {};
let directory = process.argv[2];
let out = process.argv[3];
let files = fs.readdirSync(directory);
for (let name of files) {
    emoji = name.slice(0, name.length - 5);
    emojis[emoji] = true;
}

file_out = fs.openSync(out, "w")
fs.writeFileSync(file_out, JSON.stringify(emojis));