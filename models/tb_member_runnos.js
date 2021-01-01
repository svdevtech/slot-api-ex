const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_runnno_Schema = new Schema({    
    agent_code:String,
    running_number:Number
})

const Tb_RuNoModel = mongoose.model('tb_member_runnos', tb_runnno_Schema)

module.exports = Tb_RuNoModel