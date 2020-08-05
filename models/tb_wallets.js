const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_walets_Schema = new Schema({
    mem_username: String,
    brand_code: String,
    game_username: String,
    game_password: String,
    agent_code: String    
})

const Tb_WalletsModel = mongoose.model('tb_wallets', tb_walets_Schema)

module.exports = Tb_WalletsModel