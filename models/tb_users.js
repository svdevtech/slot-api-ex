const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_user_Schema = new Schema({
    user_name: String,
    user_pass: String,
    user_email: String,
    add_date: String,
    last_login: String,
    user_status: String,
    user_level: String
})

const Tb_UserModel = mongoose.model('tb_users', tb_user_Schema)

module.exports = Tb_UserModel