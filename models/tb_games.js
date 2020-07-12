const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_games_Schema = new Schema({
    game_code: String,
    game_name: String,
    game_banner: String,
    game_key: String,
    game_img: String,
    game_status: String,
    play_type: String,
    play_url: String
})

const Tb_GamesModel = mongoose.model('tb_games', tb_games_Schema)

module.exports = Tb_GamesModel