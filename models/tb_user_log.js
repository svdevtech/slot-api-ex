const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_user_log_Schema = new Schema({
    date_st: String,
    detail: String,
    mem_id: Number,
    ip: String,
    do_del: String    
})

const Tb_UserLogModel = mongoose.model('tb_user_log', tb_user_log_Schema)

module.exports = Tb_UserLogModel