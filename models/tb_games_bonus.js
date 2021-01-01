const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_games_bonus_Schema = new Schema({
    bonus_name: String,
    member_point: Number,
    agent_code: String,    
    bonus_img1: String,
    bonus_img2: String,
    bonus_img3: String,
    bonus_img4: String,
    bonus_img5: String,
    bonus_img6: String,
    bonus_img7: String,
    bonus_value1: String,
    bonus_value2: String,
    bonus_value3: String,
    bonus_value4: String,
    bonus_value5: String,
    bonus_value6: String,
    bonus_value7: String,
    bonus_status: Number,
    create_at: String,
    update_at: String,
})

const Tb_Games_BonusModel = mongoose.model('tb_games_bonus', tb_games_bonus_Schema)

module.exports = Tb_Games_BonusModel