const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_game_list_Schema = new Schema({
    game_code: String,
    game_id: String,
    game_id2: String,
    game_id3: String,
    game_id4: String,
    game_name: String,
    game_band: String,
    game_type: String,
    game_img: String,
    game_line: Number,
    game_new: String,
    game_jackpot: String,
    game_free: String
})

const Tb_GameListtModel = mongoose.model('tb_game_list', tb_game_list_Schema)

module.exports = Tb_GameListtModel