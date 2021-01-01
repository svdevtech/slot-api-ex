const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaType = mongoose.Schema.Types
const tb_agents_credit_history_Schema = new Schema({
    date_time: String,
    ts: Number,
    agent_code: String,
    credit_type: String,
    amount: String,
    before_balance: String,
    after_balance: String,
    remark: String,  
   
})

const Tb_AGent_Credit_HistoryModel = mongoose.model('tb_agents_credit_history', tb_agents_credit_history_Schema)

module.exports = Tb_AGent_Credit_HistoryModel