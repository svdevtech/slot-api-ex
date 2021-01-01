const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_move_credit_Schema = new Schema({
    move_date: String,
    move_time: String,
    agent_code: String,
    mem_username: String,
    mem_name: String,
    move_type: String,
    move_from: String,
    move_to: String,
    move_to_game: String,
    amount: String,
    balance_current: String,
    balance_update: String,
    move_ip: String,
    move_msg: String,
    ts: Number,
})

const Tb_MoveCeditModel = mongoose.model('tb_move_credits', tb_move_credit_Schema)

module.exports = Tb_MoveCeditModel