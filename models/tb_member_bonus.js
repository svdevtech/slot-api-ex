const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_member_bonus_Schema = new Schema({
    bonus_id: String,
    bonus_name: String,
    bonus_type: String,
    bonus_value: String,
    agent_code: String,
    member_id: String,    
    member_name: String, 
    member_bonus_redeem: String, 
    member_bonus_status: Number,
    create_at: String,
    update_at: String,
})

const Tb_Member_BonusModel = mongoose.model('tb_member_bonus', tb_member_bonus_Schema)

module.exports = Tb_Member_BonusModel