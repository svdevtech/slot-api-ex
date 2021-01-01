const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_gameslucky_Schema = new Schema({
    play_url1: String,
    play_url2: String,
    play_url3: String,
    play_url4: String,
    play_url5: String
})

const Tb_GamesLuckyModel = mongoose.model('tb_gamesluckies', tb_gameslucky_Schema)

module.exports = Tb_GamesLuckyModel