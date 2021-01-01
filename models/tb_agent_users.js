const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_agent_user_Schema = new Schema({
    agent_code: String,
    user_name: String,
    user_email: String,
    user_pass: String,
    add_date: String,
    last_login: String,
    user_status: String,
    user_level: String
})

const Tb_AGent_UserModel = mongoose.model('tb_agent_users', tb_agent_user_Schema)

module.exports = Tb_AGent_UserModel