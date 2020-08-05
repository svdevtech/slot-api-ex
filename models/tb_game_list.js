const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_game_list_Schema = new Schema({
    game_code: String,
    game_id: String,
    game_id2: String,
    game_id3: String,
    game_id4: String,
    game_name: String,
    game_brand: String,
    game_type: String,
    game_img: String,
    game_img_app: String,
    game_line: Number,
    game_new: String,
    game_jackpot: String,
    game_free: String,
    game_provider: String,
    game_status: Number
})

const Tb_GameListtModel = mongoose.model('tb_game_list', tb_game_list_Schema)

module.exports = Tb_GameListtModel