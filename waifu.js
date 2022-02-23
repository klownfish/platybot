const axios = require('axios')


class WaifuOWO {
    constructor() {
        /* hewwo */
        this.valid_categories = {
            waifu: 1,
            neko: 1,
            shinobu: 1,
            megumin: 1,
            bully: 1,
            cuddle: 1,
            cry: 1,
            hug: 1,
            awoo: 1,
            kiss: 1,
            lick: 1,
            pat: 1,
            smug: 1,
            bonk: 1,
            yeet: 1,
            blush: 1,
            smile: 1,
            wave: 1,
            highfive: 1,
            handhold: 1,
            nom: 1,
            bite: 1,
            glomp: 1,
            slap: 1,
            kill: 1,
            kick: 1,
            happy: 1,
            wink: 1,
            poke: 1,
            dance: 1,
            cringe: 1
        }
    }

    async getWaifu(category, nsfw = false) {
        if (!this.valid_categories[category]) {
            return false;
        }
        let response = await axios.get(`https://api.waifu.pics/${nsfw ? "nsfw" : "sfw"}/${category}`)
        if (response.data.url) {
            return response.data.url
        } else {
            return false
        }
    }

    getCategories() {
        return Object.keys(this.valid_categories);
    }
}

module.exports = WaifuOWO