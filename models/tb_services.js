const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaType = mongoose.Schema.Types
const tb_service_Schema = new Schema({
    game_code: String,
    agent_code: String,
    ser_api_key: String,
    ser_api_secret: String,
    ser_api_username: String,
    ser_api_password: String,
    startpass_string: String,
    startuser_string: String,
    ser_date: String,
    ser_status: String,
    user_process: String,
    ser_percent: SchemaType.Decimal128,
    ser_comm: SchemaType.Decimal128,
    last_turn_date: String,
    last_turn_hour: Number
})

const Tb_ServiceModel = mongoose.model('tb_services', tb_service_Schema)

module.exports = Tb_ServiceModel