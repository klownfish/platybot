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
const ytdl = require("ytdl-core");
const Deleter = require('./deleter.js');
const { PlayerManager, AudioYoutube, AudioListenMoe } = require('./playerManager.js');
const OpenAI = require('openai-nodejs');
const yts = require( 'yt-search' )
const child_process = require('child_process');

const PREFIX = "p ";
const EMOJI_LINK = "https://raw.githubusercontent.com/Aevann1/Drama/frost/files/assets/images/emojis/"
const THEME_CACHE = "./user_themes.json"
const PLAY_THEME_FOR = 7;

const AI_COST = 20
const AI_MAX_DEBT = 80

const IMAGE_COOLDOWN = 240
const SERVER_IMAGE_COOLDOWN = 60

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
const ai_client = new OpenAI(keys.openaiKey)

let themes = JSON.parse(fs.readFileSync(THEME_CACHE))

let player_managers = {}
let last_gnosti = +Date.now()
let ai_requests = {};

let image_requests = {};
let server_image_requests = {};

function handleVoiceState(old_state, new_state) {
    if(old_state.channelId === null && new_state.channelId !== null) {
        if (themes[new_state.id]) {
            let guildId = new_state.guild.id
            if (!(guildId in player_managers)) {
                player_managers[guildId] = new PlayerManager(new_state.guild);
            }
            let audio = new AudioYoutube(themes[new_state.id], PLAY_THEME_FOR)
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
        if (message.content.toLowerCase().includes("platybot")) {
            let user_prompt = message.content.trim()
            if (user_prompt.length > 500) {
                return
            }
            let user_obj = ai_requests[message.author.id]
            if (user_obj) {
                let delay = +Date.now() / 1000 - user_obj.last_prompt 
                user_obj.debt = Math.max(user_obj.debt - delay, 0)
                if (user_obj.debt > AI_MAX_DEBT) {
                    message.channel.send(`Please wait ${user_obj.debt - AI_MAX_DEBT} seconds. This thing costs actual money lmao`)
                    return
                }
            } else {
                ai_requests[message.author.id] = {debt:0, last_prompt:0}
                user_obj = ai_requests[message.author.id];
            }

            let prompt = `The following is a conversation with the friendly AI Platybot:\nHuman: How are you doing?\nPlatybot: Pretty good! How about you?\nHuman: also good!\nPlatybot: I'm happy to hear!\nHuman: ` + message.content + "\nPlatybot: "
            let response = await ai_client.complete(prompt, {
                max_tokens: 100,
                temperature: 0.9,
                n: 1,
                stop: ["Human: "]
            })

            user_obj.last_prompt = +Date.now() / 1000
            user_obj.debt += AI_COST
            console.log(prompt)
            console.log(response)
            console.log(`sent an openAI request worth ${response.usage.total_tokens} tokens`)
            message.channel.send(response.choices[0].text.trim())
        }
        if (message.content.includes("platypus")) {
            return;
            let platy_count = message.content.match(/platy/g).length
            let offset = Math.floor(Math.random() * platys.length)
            let text = ""
            for (let i = 0; i < platy_count && i < 5; i++) {
                text += platys[(offset + i) % platys.length];
                text += "\n"
            }
            message.channel.send(text);
        } else
        if (message.content.includes("gnosti")) {
            let current_time = +Date.now()
            let ms_since_last = current_time - last_gnosti
            last_gnosti = +Date.now()
            if (ms_since_last < 1 * 60 * 1000) {
                return
            }
            let days = Math.floor(ms_since_last / (1000 * 60 * 60 * 24))
            ms_since_last -= days * 1000 * 60 * 60 * 24
            let hours = Math.floor(ms_since_last / (1000 * 60 * 60)) 
            ms_since_last -= hours * 1000 * 60 * 60
            let minutes = Math.floor(ms_since_last / (1000 * 60))
            ms_since_last -= minutes * 1000 * 60
            let seconds = Math.floor(ms_since_last / 1000)

            let ago_text = ""
            if (days > 0) {
                ago_text += `${days} days, ${hours} hours and ${minutes} minutes`
            } else
            if (hours > 0) {
                ago_text += `${hours} hours and ${minutes} minutes`
            } else
            if (minutes > 0) {
                ago_text += `${minutes} minutes and ${seconds} seconds`
            } else
            if (seconds > 0) {
                ago_text += `${seconds} seconds`
            }
            message.channel.send("gnosticism was last mentioned " + ago_text + " ago!")
        } else 
        if (message.content.toLowerCase().includes("byo") && Math.random() <= 0.05) {
            message.channel.send(`https://cdn.discordapp.com/attachments/863478668692029440/1003935541152190474/trim.18401F40-98E8-49F7-A258-1FEA21593076.mov`)
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

        case "play": {
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
                    let search = await yts.search(args.slice(1).join(""))
                    link = search.videos[0].url
                }
                let audio = new AudioYoutube(link)
                player_managers[message.channel.guildId].play(audio, channel.id)
                message.channel.send(`playing ${link}`)
            } else {
                message.channel.send("not in a voice channel")
            }
            break;
        }
        
        case "moeradio": {
            let channel = message.member?.voice.channel
            if (!(message.channel.guildId in player_managers)) {
                player_managers[message.channel.guildId] = new PlayerManager(message.channel.guild);
            }

            if (channel) {
                let audio = new AudioListenMoe()
                player_managers[message.channel.guildId].play(audio, channel.id)
                message.channel.send(`playing listen.moe`)
            } else {
                message.channel.send("not in a voice channel")
            }
        }
        break;

        case "repeat":
            let repeat_status = player_managers[message.channel.guildId].get_repeat();
            player_managers[message.channel.guildId].set_repeat(!repeat_status)
            message.channel.send(`repeating: ${!repeat_status}`)
            break;
            
        case "stop":
            player_managers[message.channel.guildId].stop()
            break
        
        case "skip":
            player_managers[message.channel.guildId].skip()
            break;

        case "guildicon":
            message.channel.send(message.channel.guild.iconURL())
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
            await message.channel.sendTyping();
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
            await message.channel.sendTyping();
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

        case "imagine":
            let user_obj = image_requests[message.author.id]
            let server_obj = server_image_requests[message.channel.guildId]
            if (user_obj == null) {
                image_requests[message.author.id] = {}
                user_obj = image_requests[message.author.id];
                user_obj.last_prompt = 0;
            }
            if (server_obj == null) {
                server_image_requests[message.channel.guildId] = {}
                server_obj = server_image_requests[message.channel.guildId]
                server_obj.last_prompt = 0;
            }
            let user_delta = (+Date.now() - user_obj.last_prompt) / 1000;
            let server_delta = (+Date.now() - user_obj.last_prompt) / 1000;

            if (user_delta < IMAGE_COOLDOWN) {
                message.reply(`please wait ${IMAGE_COOLDOWN - user_delta}s (personal cooldown)`)
                return
            }

            if (user_delta < SERVER_IMAGE_COOLDOWN) {
                message.reply(`please wait ${IMAGE_COOLDOWN - server_delta}s (server cooldown)`)
                return
            }

            process.env["STABILITY_KEY"] = keys.stabilityKey
            let prompt = args.slice(1).join(" ")
            let stability = child_process.spawn("python3", ["stability.py", ...args.slice(1)], {stdio: ["ignore", "pipe", "ignore"]})
            console.log(`image prompt: ${prompt}`)
            stability.stdout.once("readable", async ()=> {
                if (stability.stdout.readableLength == 0) {
                    await message.reply(`something went wrong. your prompt might have been "immoral"`)
                    return;
                }
                server_obj.last_prompt = +Date.now();
                user_obj.last_prompt = +Date.now();
                await message.reply({
                    files: 
                    [
                        {
                            attachment: stability.stdout,
                            name: "imagine.png"
                        }
                    ],
                });
            })


        case "secret_command_lol":
            const guild = await client.guilds.fetch(message.channel.guildId)
            const members = await guild.members.fetch() // returns Collection
            // try {
            //     fs.mkdirSync("./" + message.channel.guildId)
            // } catch{}
            for (let member of members) {
                if (member[1].nickname == "root's bitch boy") {
                    console.log("found user", member[1].nickname)
                    member[1].setNickname("")
                }
                // let url = member[1].displayAvatarURL()
                // var request = require("request");
                // request(url).pipe(fs.createWriteStream(`./${message.channel.guildId}/${member[1].displayName}.webp`))
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