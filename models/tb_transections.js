const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_transections_Schema = new Schema({
    amount: String,
    type: String, 
    username: String,
    before_balance: String,
    after_balance: String,
    agent_code: String,
    ts: Number,
    tran_date_time: String,
    note: String,
    user_admin: String,    
    tran_type: String,
})

const Tb_TransectionsModel = mongoose.model('tb_transections', tb_transections_Schema)

module.exports = Tb_TransectionsModel