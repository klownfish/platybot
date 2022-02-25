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
        this.spacex = {}
        this.ll = {}
        this.cache_updated = 0
    }

    async getNextLaunch() {
        let current_time = +new Date()
    
        if (current_time - this.cache_updated >= 60 * 5 * 100) {
            let response = await axios.get("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1")
            this.ll = response.data?.results[0]
            response = await axios.get("https://api.spacexdata.com/v4/launches/upcoming")
            this.spacex = response.data[0]
            this.cache_updated = current_time
        }

        let embed = new MessageEmbed()
        embed.setColor('#ff6900')
        if (this.ll.name) {
            embed.setTitle(this.ll.name)
        }
        if (this.ll.net) {
            let launch_date = +Date.parse(this.ll.net)
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
        if (this.ll?.launch_service_provider?.name == "SpaceX" && this.spacex?.links?.webcast) {
            embed.setURL(this.spacex?.links?.webcast)
            embed.addField("webcast", this.spacex?.links?.webcast, false)
        } else if (this.ll.vidURLs) {
            embed.setURL(this.ll.vidURLs[0])
            embed.addField("webcast", this.ll.vidURLs[0], false)

        }

        if (this.ll.image) {
            embed.setImage(this.ll.image)
        }
        return { embeds: [embed] }
    }
}

module.exports = RocketAPI