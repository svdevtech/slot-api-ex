const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_transections_Schema = new Schema({
    bank_id: String,
    deposit: String,
    bonus: String,
    withdraw: String,
    username: String,
    current_credit: String,
    withdraw_credit: String,
    transfer_credit: String,
    credit: String,
    agent_code: String,
    ts: Number,
    tran_date_time: String,
    note: String,
    member_credit: String,
    user_process_id: Number,
    cash_balance: String,
    bank_credit: String,
    tran_type: String,
    pro_id: Number,
    tran_confirm_by: String,
    bank_tran_runid: String,
    admin_check: String
})

const Tb_TransectionsModel = mongoose.model('tb_transections', tb_transections_Schema)

module.exports = Tb_TransectionsModel