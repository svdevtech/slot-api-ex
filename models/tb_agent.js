const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaType = mongoose.Schema.Types
const tb_agent_Schema = new Schema({
    agent_code: String,
    agent_lineup: String,
    agent_name: String,
    agent_detail: String,
    agent_website: String,
    agent_master: String,
    agent_type: String,
    agent_percent: Number,
    agent_percent_aff : String,
    agent_comm: Number,
    agent_line_ad : String,
    agent_line_token1 : String,
    agent_line_token2 : String,
    agent_line_token3 : String,
    agent_api_user : String,
    agent_api_password : String,
    agent_api_key : String,
    withdraw_auto : String,
    agent_status : String,
    agent_percent_aff2 : String,
    agent_percent_aff3 : String,
    agent_percent_aff4 : String,
    agent_percent_aff5 : String
})

const Tb_AGentModel = mongoose.model('tb_agent', tb_agent_Schema)

module.exports = Tb_AGentModel