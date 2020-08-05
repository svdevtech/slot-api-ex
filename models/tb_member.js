const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_member_Schema = new Schema({
    agent_code: String,
    mem_date_add: String,
    mem_username: String,
    mem_password: String,
    mem_name: String,
    mem_tel: String,
    mem_line: String,
    mem_balance: String,
    last_login: String,
    register_type: String,
    mem_status: String,
    external_id: String
})

const Tb_MemberModel = mongoose.model('tb_member', tb_member_Schema)

module.exports = Tb_MemberModel