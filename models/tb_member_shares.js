const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_membershare_Schema = new Schema({
    share_redeem: String,
    share_member: String,
    agent_code: String,
    create_at: String,
    update_at: String,
})

const Tb_MemberShareModel = mongoose.model('tb_member_shares', tb_membershare_Schema)

module.exports = Tb_MemberShareModel