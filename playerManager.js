"use strict";

const axios = require('axios')
const ytdl = require('youtube-dl-exec')
const ytdl_core = require('ytdl-core');

const { joinVoiceChannel, createAudioPlayer, createAudioResource, PlayerSubscription, AudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

class AudioDescriptor {
    constructor(start_func, stop_func) {
        this.start_func = start_func
        this.stop_func  = stop_func
    }
}

class AudioYoutube {
    constructor(link, duration = 0) {
        this.link = link
        this.duration = duration
        this.stopped = false;
        this.timeout_func = this.timeout_func.bind(this)
        this.process
    }

    async start_func() {
        if (this.duration != 0) {
            this.stream = await ytdl_core(this.link, { filter : 'audioonly' })
            this.resource = createAudioResource(this.stream)
            setTimeout(this.timeout_func, this.duration * 1000)
            return this.resource
        }
        this.process = ytdl.exec(
            this.link,
            {
                o: '-',
                q: '',
                f: 'bestaudio[acodec=opus]',
                r: '100K',
            },
            { stdio: ['ignore', 'pipe', 'ignore'] },
        );
        this.stream = this.process.stdout;
        this.resource = createAudioResource(this.stream);
        return this.resource
    }

    async stop_func() {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        this.stream.destroy();

        if (this.duration == 0) {
            this.process.cancel()
        }
    }

    timeout_func() {
        if (this.stopped == false) {
            this.stopped = true;
            this.resource.audioPlayer?.stop();
            this.stream.destroy()
        }
    }
}

class AudioListenMoe {
    constructor() {

    }
    async start_func() {
        let response = await axios.get("https://listen.moe/opus", { responseType: 'stream'} )
        this.stream = response.data
        this.resource = createAudioResource(this.stream);
        return this.resource;
    }

    async stop_func() {
        this.stream.destroy();
    }
}

class PlayerManager {
    constructor(guild) {
        this.channelId = null;
        this.guild = guild
        this.connection = null;
        this.queue = [];
        this.main_playing = false;
        this.interrupt_playing = false;
        this.main_audio = null;
        this.interrupt_audio = null;
        this.interrupt_want_to_play = null;
        this.main_player = createAudioPlayer({behaviors: {maxMissedFrames: 100}});
        this.interrupt_player = createAudioPlayer({behaviors: {maxMissedFrames: 100}});
        this.repeat = false;

        this.on_interrupt_state_change = this.on_interrupt_state_change.bind(this);
        this.on_main_state_change = this.on_main_state_change.bind(this)

        this.main_player.on("stateChange", this.on_main_state_change)
        this.interrupt_player.on("stateChange", this.on_interrupt_state_change)

        this.main_player.on("error", console.log)
        this.interrupt_player.on("error", console.log)
    }

    try_to_connect() {
        this.connection = joinVoiceChannel({
            channelId: this.channelId,
            guildId: this.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator
        });
    }

    try_to_disconnect() {
        if (!this.main_playing && !this.interrupt_playing) {
            this.connection.disconnect();
        }
    }

    async play(audio, channelId) {
        this.channelId = channelId
        this.try_to_connect();
        if (!this.main_playing) {
            this.main_audio = audio
            let resource = await this.main_audio.start_func()
            this.main_player.play(resource)
            this.main_playing = true;
            if (!this.interrupt_playing) {
                this.connection.subscribe(this.main_player);   
            }
        } else {
            this.repeat = false;
            this.queue.push(audio)
        }
    } 

    async interrupt_play(audio, channelId) {
        this.channelId = channelId
        this.try_to_connect();
        if (this.interrupt_playing) {
            this.interrupt_want_to_play = audio;
            this.interrupt_player.stop(true);
        } else {
            this.interrupt_playing = true;
            this.interrupt_audio = audio;
            let resource = await this.interrupt_audio.start_func();
            this.interrupt_player.play(resource);
            this.connection.subscribe(this.interrupt_player);
        }
    }

    async stop() {
        this.repeat = false;
        this.queue = []
        await this.skip()
    }

    async skip() {
        this.repeat = false;
        if (this.main_playing) {
            await this.main_player.stop()
        }
        if (this.interrupt_playing) {
            await this.interrupt_player.stop()
        }
    }

    set_repeat(status) {
        this.repeat = status 
    }

    get_repeat() {
        return this.repeat
    }

    async on_main_state_change(old_state, new_state) {
        if (new_state.status == AudioPlayerStatus.Idle) {
            await this.main_audio.stop_func();
            if (this.repeat) {
                let resource = await this.main_audio.start_func()
                this.main_player.play(resource)
                return;
            }
            this.main_audio = this.queue.shift()
            if (this.main_audio != null) {
                let resource = await this.main_audio.start_func()
                this.main_player.play(resource)
            } else {
                this.main_playing = false;
                this.try_to_disconnect();
            }
        }
    }

    async on_interrupt_state_change(old_state, new_state) {
        if (new_state.status == AudioPlayerStatus.Idle) {
            await this.interrupt_audio.stop_func();
            if (this.interrupt_want_to_play) {
                this.interrupt_audio = this.interrupt_want_to_play;
                this.interrupt_want_to_play = null;
                let resource = await this.interrupt_audio.start_func()
                this.interrupt_player.play(resource);
            } else {
                this.connection.subscribe(this.main_player);
                this.interrupt_playing = false;
                this.try_to_disconnect();
            }
        } 
    }
}


module.exports = {
    "AudioYoutube": AudioYoutube,
    "PlayerManager": PlayerManager,
    "AudioListenMoe": AudioListenMoe,
};