const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_news_Schema = new Schema({
    news_text: String,
    agent_code: String,
    news_status: Number,
    create_at: String,
    update_at: String,
})

const Tb_NewsModel = mongoose.model('tb_news', tb_news_Schema)

module.exports = Tb_NewsModel