const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_brands_Schema = new Schema({
    brand_code: String,
    brand_name: String,
    brand_banner: String,
    brand_key: String,
    brand_img: String,
    brand_status: String,
    play_type: String,
    play_url: String
})

const Tb_BrandsModel = mongoose.model('tb_brand', tb_brands_Schema)

module.exports = Tb_BrandsModel