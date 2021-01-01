const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_game_provider_Schema = new Schema({
    game_code: String,    
    game_name: String,
    game_brand: String,
    game_img: String,
    game_img_app: String,
    game_new: String,
    game_status: Number,
    brand_sort: Number,
    game_img_web: String,
    brand_type: String,
})

const Tb_GameProvidertModel = mongoose.model('tb_game_providers', tb_game_provider_Schema)

module.exports = Tb_GameProvidertModel