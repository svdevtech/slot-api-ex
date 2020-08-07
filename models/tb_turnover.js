const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_turnover_Schema = new Schema({
    agent_code: String,
    username: String,
    game_username: String,
    turn_date: String,
    turn_hours: String,
    amount: String,
    game_code: String
})

const Tb_TurnoverModel = mongoose.model('tb_turnover', tb_turnover_Schema)

module.exports = Tb_TurnoverModel