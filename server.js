var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const env = require('./env');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3000;

const sl_route = require('./routes/slot_api_route');

app.use('/api', sl_route);

app.listen(port, () => {
  console.log("[success] task 1 : listening on port " + port);
});

app.use((req, res, next) => {
  var err = new Error("ไม่พบ path ที่คุณต้องการ");
  err.status = 404;
  next(err);
});