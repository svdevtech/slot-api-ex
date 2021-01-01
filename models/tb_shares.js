const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_share_Schema = new Schema({
    share_img: String,
    share_message: String,
    agent_code: String,
    create_at: String,
    update_at: String,
})

const Tb_ShareModel = mongoose.model('tb_shares', tb_share_Schema)

module.exports = Tb_ShareModel