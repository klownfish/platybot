'use strict';

const Discord = require('discord.js')

const keys = require('./keys.js')
const fs = require('fs')
const valid_emojis = require('./emojiList.json')
const Patter = require("./patter.js")
const MarseyWriter = require("./marseyWriter")
const Waifu = require("./waifu.js");
const Rocket = require("./rocket.js")
const EelSlapper = require('./eel_slap.js');
const ytdl = require("discord-ytdl-core");
const Deleter = require('./deleter.js');
const { PlayerManager, AudioYoutube } = require('./playerManager.js');

const client = new Discord.Client({ intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_PRESENCES
] });

const marsey_writer = new MarseyWriter();
const patter = new Patter();
const eelSlapper = new EelSlapper();
const deleter = new Deleter();
const waifu = new Waifu();
const rocket = new Rocket();

const PREFIX = "p ";
const EMOJI_LINK = "https://raw.githubusercontent.com/Aevann1/Drama/frost/files/assets/images/emojis/"
const THEME_CACHE = "./user_themes.json"
const PLAY_THEME_FOR = 15;

const DEFAULT_NAME = "platybot"
const DEFAULT_PFP = "./avatar.jpeg"
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

\t - p rocket 
\t\t *  sends information about the next upcoming rocket lanunch

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
let themes = JSON.parse(fs.readFileSync(THEME_CACHE))

let player_managers = {}


function delay(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}
 

function handleVoiceState(old_state, new_state) {
    if(old_state.channelId === null && new_state.channelId !== null) {
        if (themes[new_state.id]) {
            let guildId = new_state.guild.id
            if (!(guildId in player_managers)) {
                player_managers[guildId] = new PlayerManager(new_state.guild);
            }
            let audio = new AudioYoutube(themes[new_state.id], 15)
            player_managers[guildId].interrupt_play(audio, new_state.channelId)
        }
    }
}

async function handleMessage(message) {
    try {
        if (message.author.bot)
            return;
        if (message.content.toLowerCase().startsWith(PREFIX)) {
            let args = message.content.substring(PREFIX.length).split(/[ \n]/g);
            await handleCommand(args, message);
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
    await message.channel.sendTyping();
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

        case "play":
            let channel = message.member?.voice.channel
            if (!(message.channel.guildId in player_managers)) {
                player_managers[message.channel.guildId] = new PlayerManager(message.channel.guild);
            }

            if (channel) {
                let link;
                if (message.mentions.members.size > 0) {
                    link = themes[message.mentions.members.entries().next().value[0]]
                    if (!link) {
                        message.channel.send("user does not have a theme");
                        return;
                    }
                } else {
                    link = args[1];
                }
                if (!ytdl.validateURL(link)) {
                    message.channel.send("invalid link");
                    return;
                }
                let audio = new AudioYoutube(link)
                player_managers[message.channel.guildId].play(audio, channel.id)
            } else {
                message.channel.send("not in a voice channel")
            }
            break;
            
            
        case "stop":
            player_managers[message.channel.guildId].stop()
            break
        
        case "skip":
            player_managers[message.channel.guildId].skip()
            break;
        
        case "clone":
            message.delete()
            let doppelganger = message.mentions.members.first()
            if (doppelganger != null) {
                // await message.guild.me.setNickname("")
                let name = doppelganger.nickname ? doppelganger.nickname : doppelganger.user.username
                let content = message.content.substr(args[0].length + args[1].length + 2 + PREFIX.length)
                let webhook = await message.channel.createWebhook(name, {
                    avatar: doppelganger.displayAvatarURL(),
                })
                await webhook.send(content)
                await webhook.delete()
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
        
        case "slap":
            text = await waifu.getWaifu("slap")
            message.channel.send(text)
            break

        case "eel":
            let eel_mentioned = message.mentions.members;
            let eel_sent_something = false;
            for (let guild_member of eel_mentioned) {
                eel_sent_something = true;
                let url = `https://cdn.discordapp.com/avatars/${guild_member[1].user.id}/${guild_member[1].user.avatar}.png`
                let bin = await eelSlapper.getEelSlapGif(url);
                message.channel.send({
                    files: 
                    [
                        {
                            attachment: bin,
                            name: "eel.gif"
                        }
                    ]
                });
            }
            if (!eel_sent_something) {
                message.channel.send("You need to mention someone");   
            }
            break;

        case "delete":
            let delete_mentioned = message.mentions.members;
            let delete_sent_something = false;
            for (let guild_member of delete_mentioned) {
                delete_sent_something = true;
                let url = `https://cdn.discordapp.com/avatars/${guild_member[1].user.id}/${guild_member[1].user.avatar}.png`
                let bin = await deleter.getDeleteGif(url);
                message.channel.send({
                    files: 
                    [
                        {
                            attachment: bin,
                            name: "delete.gif"
                        }
                    ]
                });
            }
            if (!delete_sent_something) {
                message.channel.send("You need to mention someone");   
            }
            break;

        case "theme":
            if (args[1] === "none") {
                themes[message.author.id] = null;   
            }
            else if (ytdl.validateURL(args[1])) {
                themes[message.author.id] = args[1];
                message.channel.send("updated your theme song")
                fs.writeFileSync(THEME_CACHE, JSON.stringify(themes))
            } else {
                message.channel.send("not a valid URL")
            }
            break;

        case "rocket":
            let rocket_messages = await rocket.getNextLaunch()
            for (let rocket_message of rocket_messages) {
                message.channel.send(rocket_message);
            }
            break
        
        case "rules":
            message.channel.send(`https://i.imgur.com/TjtIJOI.png`)
            break;

        
        case "secret_command_lol":
            const guild = await client.guilds.fetch(message.channel.guildId)
            const members = await guild.members.fetch() // returns Collection
            try {
                fs.mkdirSync("./" + message.channel.guildId)
            } catch{}
            for (let member of members) {
                let url = member[1].displayAvatarURL()
                var request = require("request");
                request(url).pipe(fs.createWriteStream(`./${message.channel.guildId}/${member[1].displayName}.webp`))
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
    client.on('ready', () => {
        console.log(`logged in as ${client.user.tag}`);
        client.user.setPresence({
            activity: { name: 'Try "p help"' },
            status: 'idle',
          })
    });
    client.on('messageCreate', handleMessage); //on message
    client.on('voiceStateUpdate', handleVoiceState);
    client.login(keys.discordKey);
}

main();