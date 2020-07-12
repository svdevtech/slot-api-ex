const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_alert_Schema = new Schema({
  alert_date: String,
  alert_date_end: String,
  alert_detail: String,
  alert_type: String
})

const Tb_AlertModel = mongoose.model('tb_alert', tb_alert_Schema)

module.exports = Tb_AlertModel