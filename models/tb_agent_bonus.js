const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_agent_bonus_Schema = new Schema({
    bonus_name: String,
    agent_code: String,    
    bonus_img: String,
    bonus_type: String,
    bonus_status: Number,
    create_at: String,
    update_at: String,
})

const Tb_Agent_BonusModel = mongoose.model('tb_agent_bonus', tb_agent_bonus_Schema)

module.exports = Tb_Agent_BonusModel