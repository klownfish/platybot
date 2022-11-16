"use strict";

const axios = require('axios')
// at the top of your file
const { EmbedBuilder } = require('discord.js');

// inside a command, event listener, etc.


const ms_minute = 1000 * 60
const ms_hour = ms_minute * 60
const ms_day = ms_hour * 24

class RocketAPI {
    constructor() {
        this.spacex = {}
        this.ll = {}
        this.cache_updated = 0
    }

    async getNextLaunch() {
        let current_time = +new Date()
    
        if (current_time - this.cache_updated >= 60 * 5 * 100) {
            let response = await axios.get("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&hide_recent_previous=true")
            this.ll = response.data?.results[0]
            response = await axios.get("https://api.spacexdata.com/v5/launches/upcoming")
            this.spacex = response.data[0]
            this.cache_updated = current_time
        }
        let embed = new EmbedBuilder()
        embed.setColor('#ff6900')
        let second_message = ""
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
                when_launch += `${days} days, ${hours} hours and ${minutes} minutes`
            } else
            if (hours > 0) {
                when_launch += `${hours} hours and ${minutes} minutes`
            } else
            if (minutes > 0) {
                when_launch += `${minutes} minutes`
            } else {
                when_launch += "right now!"
            }
            embed.addFields( {name: 'launches in', value: when_launch} )
        }
        //spacex specific
        if (this.ll?.launch_service_provider?.name == "SpaceX") {
            if (this.spacex?.links?.webcast) {
                embed.setURL(this.spacex?.links?.webcast)
                embed.addFields( {name: "webcast", value: this.spacex?.links?.webcast} )
                second_message = this.spacex?.links?.webcast;
            }

            if (this.spacex?.links?.patch?.large) {
                embed.setThumbnail(this.spacex?.links?.patch?.large)
            }

        } else if (this.ll.vidURLs) {
            embed.setURL(this.ll.vidURLs[0])
            embed.addFields( {name: "webcast", value: this.ll.vidURLs[0]} )
            second_message = this.ll.vidURLs[0]
        }

        if (this.ll.image) {
            embed.setImage(this.ll.image)
        }

        let out = []
        out.push({ embeds: [embed] })
        if (second_message) {
            //out.push(second_message)
        }
        return out
    }
}

module.exports = RocketAPI