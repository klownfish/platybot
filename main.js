'use strict';

const Discord = require('discord.js')

const keys = require('./keys.js')
const fs = require('fs')
const valid_emojis = require('./emojiList.json')
const Patter = require("./patter.js")
const MarseyWriter = require("./marseyWriter")
const Waifu = require("./waifu.js");
const Rocket = require("./rocket.js")
const { waitForDebugger } = require('inspector');

const marsey_writer = new MarseyWriter();
const patter = new Patter();
const waifu = new Waifu();
const rocket = new Rocket();

const PREFIX = "p ";
const EMOJI_LINK = "https://raw.githubusercontent.com/Aevann1/Drama/frost/files/assets/images/emojis/"
const platys = [
    "https://i.imgur.com/Hr5GHEe.jpg",
    "https://i.imgur.com/uWZMHNG.jpg",
    "https://i.imgur.com/oRgG2uY.jpg",
    "https://i.imgur.com/vZJ6UV5.jpg",
    "https://i.imgur.com/jtEhW42.jpg",
    "https://i.imgur.com/QuF1hRu.jpg",
    "https://i.imgur.com/AXu0w6A.jpg",
    "https://i.imgur.com/ZYnFl4e.jpg",
    "https://i.imgur.com/tbukEeA.jpg",
    "https://i.imgur.com/ip4OUVN.jpg",
    "https://i.imgur.com/wgPBEoP.png",
    "https://i.imgur.com/LInrdN5.png",
    "https://i.imgur.com/hHe5z2j.png",
    "https://i.imgur.com/KWEuUo9.png",
    "https://i.imgur.com/0s9spDF.png",
    "https://i.imgur.com/EXOKwO4.png",
    "https://i.imgur.com/D0VK2dY.png",
    "https://i.imgur.com/17TMLUE.png",
]

const help_text = 
`
\`\`\`
Platybot prefix: "p "

\t - p help
\t\t view this page

\t - p [name]
\t\t * tries to send an emoji. other commands take precedence

\t - p platys
\t\t * lists all platys

\t - p marseys
\t\t * lists all marseys

\t - p emoji [name]
\t\t * sends an emoji

\t - p pat @[user]
\t\t * pats the user

\t - p marseytext [text]
\t\t * writes the text using a marsey font

\t - p help marseytext
\t\t * sends the marseytext help page

\t - p avatar @[user]
\t\t * sends the user's avatar

\t - p waifu list
\t\t * lists all waifu categories

\t - p waifu [category]
\t\t * sends a waifu image
\t\t 
\t - platypus
\t\t * platy platy platy
\`\`\`
`

const marseytext_help_text = 
`
\`\`\`
command: "p marseytext [text]"

use $"color" to set the text color. example $"red"hello

use #"color" to set the background color. example $"green"bubsy

any css color + "none" is valid so pretty much all basic colors like orange, green e.t.c work.

bigger example:

p marseytext
$"black"
#"SkyBlue"BOT
#"Violet"RIGHTS
#"White"ARE
#"Violet"HUMAN
#"SkyBlue"RIGHTS

\`\`\`
` 

function handleMessage(message) {
    try {
        if (message.author.bot)
            return;
        if (message.content.toLowerCase().startsWith(PREFIX)) {
            let args = message.content.substring(PREFIX.length).split(/[ \n]/g);
            handleCommand(args, message);
        } else
        if (message.content.includes("platypus")) {
            let platy_count = message.content.match(/platy/g).length
            let offset = Math.floor(Math.random() * platys.length)
            let text = ""
            for (let i = 0; i < platy_count && i < 5; i++) {
                text += platys[(offset + i) % platys.length];
                text += "\n"
            }
            message.channel.send(text);
        }
    }
    catch (e) {
        console.log("lol crash", e)
    }
}

async function handleCommand(args, message) {
    let i = 0; // i lob jabascribd xdddd
    let text = ""
    switch (args[0]) {
        case "marseys":
            text = "https://rdrama.net/marseys"
            message.channel.send(text);
            break;

        case "platys":
            i = 1;
            text = "```"
            for (let key in valid_emojis) {
                if (key.startsWith("platy")) {
                    text += key + (i++ % 3 == 0 ? "\n" : " ");
                }
            }
            text += "```"
            message.channel.send(text);
            break;
    
        case "emoji":
            text = generateEmojiText(args[1]);
            if (text == "") {
                text = "invalid emoji";
            }
            message.channel.send(text);
            break;
        
        case "pat":
            let mentioned = message.mentions.members;
            let sent_something = false;
            for (let guild_member of mentioned) {
                sent_something = true;
                let url = `https://cdn.discordapp.com/avatars/${guild_member[1].user.id}/${guild_member[1].user.avatar}.png`
                let bin = await patter.getPatGif(url);
                message.channel.send({
                    files: 
                    [
                        {
                            attachment: bin,
                            name: "pat.gif"
                        }
                    ]
                });
            }
            if (!sent_something) {
                message.channel.send("You need to mention someone");   
            }
            break;

        case "marseytext":
            let bin = marsey_writer.getMarseyText(message.content.substr(args[0].length + 1 + PREFIX.length));
            if (bin) {
                message.channel.send({
                    files: 
                    [
                        {
                            attachment: bin,
                            name: "text.png"
                        }
                    ]
                });
            } else {
                message.channel.send("invalid syntax")
            }
            break;

        case "help":
            if (args[1] === "marseytext") {
                text = marseytext_help_text;
            } else {
                text = help_text
            }
            message.channel.send(text);
            break;

        case "avatar":
            let mentioned2 = message.mentions.members; // JABASCRIBD XDDDD (and c but i don't care)
            let sent_something2 = false; 
            for (let guild_member of mentioned2) {
                sent_something2 = true;
                let url = `https://cdn.discordapp.com/avatars/${guild_member[1].user.id}/${guild_member[1].user.avatar}.png`
                message.channel.send(url)
            }
            if (!sent_something2) {
                message.channel.send("You need to mention someone");   
            }
            break;

        case "waifu":
            if (args[1] === null) {
                message.channel.send("no category specified");
            } else
            if (args[1] === "list") {
                i = 1;
                text = "```"
                for (let category of waifu.getCategories()) {
                    text += category + (i++ % 3 == 0 ? "\n" : " ");
                }
                text += "```"
                message.channel.send(text);
            } else {
                let waifu_pic = await waifu.getWaifu(args[1])
                if (waifu_pic) {
                    text = waifu_pic;
                } else {
                    text = "invalid category";
                }
                message.channel.send(text);
            }
            break;

        case "rocket":
            text = await rocket.getNextLaunch()
            if (text) { 
                message.channel.send(text);
            } else {
                message.channel.send("something borked")
            }
            break

        default:
            let maybe_emoji = generateEmojiText(args[0]);
            if (maybe_emoji) {
                text = maybe_emoji;
            } else {
                text = `invalid command. try "p help"`;
            }
            message.channel.send(text);
            break;
    }
}

function generateEmojiText(emoji) {
    if (valid_emojis[emoji]) {
        return EMOJI_LINK + emoji + ".webp"
    }
    return ""
}

function main() {
    const client = new Discord.Client({ intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ] });
    client.on('ready', () => {
        console.log(`logged in as ${client.user.tag}`);
        client.user.setPresence({
            activity: { name: 'Try "p help"' },
            status: 'idle',
          })
    });
    client.on('messageCreate', handleMessage); //on message
    client.login(keys.discordKey);
}

main();