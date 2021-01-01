const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_slide1_Schema = new Schema({
    slide_code: String,
    slide_name: String,
    slide_img: String,
    slide_status: String    
})

const Tb_Slide1Model = mongoose.model('tb_slide1', tb_slide1_Schema)

module.exports = Tb_Slide1Model