const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tb_menu_Schema = new Schema({
    menu_id: String,
    menu_name: String,
})

const Tb_MenuModel = mongoose.model('tb_menus', tb_menu_Schema)

module.exports = Tb_MenuModel