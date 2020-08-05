const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_user_level_Schema = new Schema({
    user_level_id: Number,
    user_level_name: String,
    user_level_permission: String
})

const Tb_User_LevelModel = mongoose.model('tb_user_level', tb_user_level_Schema)

module.exports = Tb_User_LevelModel