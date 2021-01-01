const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_slide3_Schema = new Schema({
    slide_code: String,
    slide_name: String,
    slide_img: String,
    slide_status: String    
})

const Tb_Slide3Model = mongoose.model('tb_slide3', tb_slide3_Schema)

module.exports = Tb_Slide3Model