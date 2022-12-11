'use strict';

const { ComponentType, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
const yts = require( 'yt-search')
const axios = require('axios')
const cheerio = require("cheerio")
const { ArgumentParser } = require('argparse');
const { Computerender } =  require("computerender")
const sharp = require('sharp');
const { parse } = require('path');

const PREFIX = "p ";
const THEME_CACHE = "./user_themes.json"
const PLAY_THEME_FOR = 10;

const AI_COST = 20
const AI_MAX_DEBT = 80

const IMAGE_COOLDOWN = 240
const SERVER_IMAGE_COOLDOWN = 60

const VOTING_TIME_H = 12
const H_TO_MS = 60 * 60 * 1000

const EMOJI_LINK = "https://rdrama.net/e/"

// let parser = new ArgumentParser();
// let sub_parsers = parser.add_subparsers()
// let imagine_parser = sub_parsers.add_parser("imagine")

// imagine_parser.add_argument("prompt", {type: "str", nargs: "*"})
// imagine_parser.add_argument("--seed", "", {type: "int"})
// imagine_parser.add_argument("--width", "", {type: "int"})
// imagine_parser.add_argument("--height", "", {type: "int"})

let imagine_parser = new ArgumentParser();

imagine_parser.add_argument("prompt", {type: "str", nargs: "*"})
imagine_parser.add_argument("--seed", {type: "int"})
imagine_parser.add_argument("--resolution", {type: "int", nargs: 2})
imagine_parser.add_argument("--file", {type: "str"})
imagine_parser.add_argument("--guidance", {type: "float"})
imagine_parser.add_argument("--iterations", {type: "int"})

const premium_servers = [
    "827312525380026368", //cyberia
    "239483833353895936" //swas
]

const CHAOSCORD = "1038151617159110767"

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

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
] });

const marsey_writer = new MarseyWriter();
const patter = new Patter();
const eelSlapper = new EelSlapper();
const deleter = new Deleter();
const waifu = new Waifu();
const rocket = new Rocket();
const ai_client = new OpenAI(keys.openaiKey)
let cr = new Computerender(keys.computerenderKey);

let themes = JSON.parse(fs.readFileSync(THEME_CACHE))

let player_managers = {}

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
        if (message.content.toLowerCase().includes("platybot") || message.mentions.has(client.user)) {
            let user_prompt = message.content.trim()
            if (user_prompt.length > 500) {
                return
            }
            let prompt = `The following is a conversation with the friendly AI Platybot:\nHuman: How are you doing?\nPlatybot: Pretty good! How about you?\nHuman: also good!\nPlatybot: I'm happy to hear!\nHuman: Have you ever been to Greenwhich?\nPlatybot: I live there!\nHuman: ` + message.content + "\nPlatybot: "
            let response = await ai_client.complete(prompt, {
                max_tokens: 200,
                temperature: 0.8,
                n: 1,
                stop: ["Human: "]
            })

            console.log(`sent an openAI request worth ${response.usage.total_tokens} tokens`)
            message.channel.send(response.choices[0].text.trim().replace(/@/g, "[@]").replace(/Platybot: /g, ""))
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
    switch (args[0].toLowerCase()) {
        case "marseys":
            text = "https://rdrama.net/marseys"
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
                let content = message.content.substr(args[0].length + args[1].length + 2 + PREFIX.length).replace(/@/g, "[@]")
                let webhook = await message.channel.createWebhook({
                    name: name,
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

        case "imagine": {
            let seed;
            let prompt;
            let resolution;
            let iterations;
            let guidance;
            let default_resolution = [512, 512]
            let default_iterations = 50;
            let default_guidance = 7.5;
            let max_cost = 512 * 512 * 50 * 4
            let premium_max_cost = 512 * 512 * 50 * 10
            let default_cost = default_resolution[0] * default_resolution[1] * default_iterations;
            let parsed_args = imagine_parser.parse_args(args.slice(1))

            seed = parsed_args.seed ? parsed_args.seed : `${Math.floor(+Date.now() / 1000)}`
            resolution = parsed_args.resolution ? parsed_args.resolution : default_resolution
            iterations = parsed_args.iterations ? parsed_args.iterations : default_iterations
            guidance = parsed_args.guidance ? parsed_args.guidance : default_guidance
            // console.log(parsed_args.prompt, args.slice(2))
            prompt = parsed_args.prompt.join(" ")

            let options;
            try {
                let output_img;
                if (message.attachments.first() || parsed_args.file) {
                    let src_img_url = parsed_args.file ? parsed_args.file : message.attachments.first().proxyURL;
                    let metadata
                    let sharp_img
                    try {
                        let src_img = await axios.get(src_img_url, {responseType: "arraybuffer"})
                        sharp_img = sharp(src_img.data)
                        metadata = await sharp_img.metadata()
                    } catch {
                        message.reply("Something wrong with the file")
                    }
                    let resize_height;
                    let resize_width;
                    if (parsed_args.resolution) {
                        resize_width = Math.floor(parsed_args.resolution[0] / 64) * 64
                        resize_height = Math.floor(parsed_args.resolution[1] / 64) * 64
                    } else {
                        let max_pixels = default_cost[0] * default_cost[1]
                        let src_pixels = metadata.width * metadata.height
                        let scale = src_pixels > max_pixels ? Math.sqrt(max_pixels / src_pixels) : 1
                        resize_height = Math.floor(metadata.height * scale / 64) * 64
                        resize_width = Math.floor(metadata.width * scale / 64) * 64

                    }
                    let resized_img = await sharp_img.resize(resize_width, resize_height)
                    .png()
                    .toBuffer()  
                    options = {prompt: prompt, img: resized_img, seed: seed, iterations: iterations, guidance: guidance}
                } else {
                    options = {prompt: prompt, seed: seed, w: resolution[0], h: resolution[1], iterations: iterations, guidance: guidance}
                }

                let cost = options.h * options.w * options.iterations;
                let allowed_cost = premium_servers.includes(message.guildId) ? premium_max_cost : max_cost;
                if (cost > allowed_cost) {
                    message.reply("too expensive")
                    break;
                }
                output_img = await cr.generateImage(options)

                await message.reply({
                    files: [{attachment: output_img, name: prompt.replace(/ /g, "_") + `_seed_${seed}.jpg`}]
                })
            } catch (e) {
                console.log(e)
                await message.reply("it borked <:basilbruh:860924777891495957>")
            }
            break;
        }

        case "img": {
            const bing_url = "https://www.bing.com/images/search?q=" + args.slice(1).join(" ")
            let response = await axios.get(bing_url);
            let doc = cheerio.load(response.data)
            let pic_doms = doc(".iusc");
            let url = JSON.parse(doc(".iusc")[0].attribs["m"]).murl
            message.reply(url)
            break;
        }

        case "vote": {
            if (message.guild.id != CHAOSCORD) {
                break;
            }
            function generate_meta_text(vote_data) {
                return `\ncurrent votes:\nfor: ${vote_data.for}\nagainst: ${vote_data.against}\ntime remaining: ${((VOTING_TIME_H * H_TO_MS - (+Date.now() - vote_data.started)) / H_TO_MS).toFixed(3)} hours`
            }
            let user;
            let role;
            let text;
            user = message.mentions.users.first()
            user = message.guild.members.cache.get(user.id)
            role = message.mentions.roles.first()
            if (!(user && role)) {
                message.reply("You need to mention a role and a user!")
                break
            }
            if (!message.guild.members.cache.get(message.author.id)._roles.includes(role.id)) {
                message.reply("You can only vote on roles that you yourself have")
                break
            }
            let username = user.nickname || user.user.username
            if (user._roles.includes(role.id)) {
                text = `kick ${username} from ${role.name}?`
            } else {
                text = `invite ${username} to ${role.name}?`
            }
            let updoot = new ButtonBuilder()
                .setCustomId('updoot')
                .setLabel('updoot')
                .setStyle(ButtonStyle.Primary)
            let downdoot = new ButtonBuilder()
                .setCustomId('downdoot')
                .setLabel('downdoot')
                .setStyle(ButtonStyle.Primary)
            let actions = new ActionRowBuilder().addComponents(updoot, downdoot)
            let vote_data = {
                voters: [],
                for: 0,
                against: 0,
                started: +Date.now()
            }
            let vote = await message.channel.send({ content: text + generate_meta_text(vote_data), components: [actions] })
            let collector = vote.createMessageComponentCollector({ componentType: ComponentType.Button, time: VOTING_TIME_H * H_TO_MS });
            collector.on("collect", (interaction) => {
                if (!message.guild.members.cache.get(interaction.user.id)._roles.includes(role.id)) {
                    interaction.reply({ content: "You can only vote on roles that you yourself have", ephemeral: true })
                    return
                }
                if (vote_data.voters.includes(interaction.user.id)) {
                    interaction.reply({ content:"You have already voted", ephemeral: true});
                    return
                }
                vote_data.voters.push(interaction.user.id)
                if (interaction.customId == "downdoot") {
                    vote_data.against++
                }
                if (interaction.customId == "updoot") {
                    vote_data.for++
                }
                interaction.reply({ content: "Vote registered", ephemeral: true});
                vote.edit(text + generate_meta_text(vote_data))
            })
            collector.on('end', collected => {
                let accepted = vote_data.for > vote_data.against;
                if (accepted) {
                    user.roles.add(role.id)
                } else {
                    user.roles.remove(role.id)
                }
                vote.reply(`Results:\nfor: ${vote_data.for}\nagainst: ${vote_data.against}\n\nverdict:\n${accepted ? "ACCEPTED" : "REJECTED"}`)
            });
        } break;

        case "autest": {
            let messages = [message]
            let filtered_messages = []
            let userid = message.mentions.members.first().user.id
            let fetches = 20
            for (let i = 0; i < fetches; i++) {
                let partial_messages = await message.channel.messages.fetch({limit: 100, before: messages[messages.length - 1].id,  cache: true})
                for (let msg of partial_messages) {
                    messages.push(msg[1])
                }
                console.log(messages.length)
            }

            let f = fs.openSync(userid + ".txt", "w")
            for (message of messages) {
                if (message.author.id == userid)  {
                    if (!message.content) {
                        continue
                    }
                    let filtered_content = message.content.replace(/\<[\s\S]*?\>/g, "")
                    fs.writeFileSync(f, filtered_content + "\n\n")
                }
            }
            break
        }

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