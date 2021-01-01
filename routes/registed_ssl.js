const express = require('express');
const env = require('../env');
const route = express.Router();
const moment = require('moment');
function apilog(msg) {
    if (env.showlog === 1) {
        console.log(moment().format('DD MMM YYYY HH:mm:ss') + " :: " + msg);
    }
}

route.get('/', async (req, res) => {
    apilog('Get register ssl');
    //console.log('params::==', req.params);
    res.redirect(env.backendhost);
});
module.exports = route;