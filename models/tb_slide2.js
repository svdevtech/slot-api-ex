const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_slide2_Schema = new Schema({
    slide_code: String,
    slide_name: String,
    slide_img: String,
    slide_status: String    
})

const Tb_Slide2Model = mongoose.model('tb_slide2', tb_slide2_Schema)

module.exports = Tb_Slide2Model