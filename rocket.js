"use strict";

const axios = require('axios')
// at the top of your file
const { MessageEmbed } = require('discord.js');

// inside a command, event listener, etc.


const ms_minute = 1000 * 60
const ms_hour = ms_minute * 60
const ms_day = ms_hour * 60

class RocketAPI {
    constructor() {
        this.cache = {}
        this.cache_updated = 0
    }

    async getNextLaunch() {
        let current_time = +new Date()
        let next_launch
        if (current_time - this.cache_updated >= 60 * 5 * 100) {
            let response = await axios.get("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1")
            next_launch = response.data?.results[0]
            this.cache = next_launch
            this.cache_updated = current_time
        } else {
            next_launch = this.cache
        }


        let embed = new MessageEmbed()

        if (next_launch.name) {
            embed.setTitle(next_launch.name)
        }
        if (next_launch.net) {
            let launch_date = +Date.parse(next_launch.net)
            let ms_to_launch = launch_date - current_time
            let days = Math.floor(ms_to_launch / ms_day)
            ms_to_launch -= days * ms_day
            let hours = Math.floor(ms_to_launch / ms_hour) 
            ms_to_launch -= hours * ms_hour
            let minutes = Math.floor(ms_to_launch / ms_minute)

            let when_launch = ""
            if (days > 0) {
                when_launch += `in ${days} days, ${hours} hours and ${minutes} minutes`
            } else
            if (hours > 0) {
                when_launch += `in ${hours} hours and ${minutes} minutes`
            } else
            if (minutes > 0) {
                when_launch += `in ${minutes} minutes`
            } else {
                when_launch += "right now!"
            }
            embed.addField('launches in', when_launch, false)
        }
        if (next_launch.vidURLs) {
            embed.setURL(next_launch.vidURLs[0])
        }
        if (next_launch.image) {
            embed.setImage(next_launch.image)
        }
        return { embeds: [embed] }
    }
}

module.exports = RocketAPI