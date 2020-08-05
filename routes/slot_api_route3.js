const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
//const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const env = require('../env');
const multer = require('multer');
//const uuidv4 = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');

const tb_alert = require('../models/tb_alert');
const tb_agent_user = require('../models/tb_agent_user');
const tb_user = require('../models/tb_user');

const tb_brands = require('../models/tb_brands');
const tb_menu = require('../models/tb_menu');

const tb_game_list = require('../models/tb_game_list');
const tb_services = require('../models/tb_services');
const tb_agent = require('../models/tb_agent');
const tb_user_log = require('../models/tb_user_log');
const tb_user_level = require('../models/tb_user_level');

const tb_member = require('../models/tb_member');
const tb_move_credit = require('../models/tb_move_credit');
const tb_wallets = require('../models/tb_wallets');



let message = 'Success';
let status = 2000;
const route = express.Router();

// คำสั่งเชื่อม MongoDB
var mongo_uri = env.mongo_uri;
mongoose.Promise = global.Promise;
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
    () => {
        console.log("[success] task 2 : connected to the database ");
    },
    error => {
        console.log("[failed] task 2 " + error);
        process.exit();
    }
);

function apilog(msg) {
    if (env.showlog === 1) {
        console.log(moment().format('DD MMM YYYY HH:mm:ss') + " :: " + msg);
    }
}

function apiDebuglog(msg, result) {
    if (env.showDebuglog === 1) {
        msg = msg + " result : " + result;
    }
    console.log(moment().format('DD MMM YYYY HH:mm:ss') + " :: " + msg);
}

function apiErrorlog(msg, err) {
    if (env.showErrorlog === 1) {
        msg = msg + " ErrorMsg => " + err;
    }
    console.log(moment().format('DD MMM YYYY HH:mm:ss') + " :: " + msg);
}

function ReturnErr(err) {
    return {
        status: 2001,
        message: "Unsuccess",
        data: err
    };
}

function ReturnSuccess(status, data) {
    return {
        status: status,
        message: "Success",
        data: data
    };
}

function ReturnUnSuccess(status, data) {
    return {
        status: status,
        message: "Unsuccess",
        data: data
    };
}

function ReturnCustom(status, message, data) {
    return {
        status: status,
        message: message,
        data: data
    };
}

function sha256Encrypt(password) {
    return bcrypt.hashSync(password, 10);
}

function sha256Verify(password, hashed) {
    return bcrypt.compareSync(password, hashed);
}

route.get("/", (req, res) => {
    apilog('Get welcome');
    res.status(200).send("!!! Welcome to slot API world. !!!");
});


/////////////////////// common function ///////////////////

route.get('/backend', async (req, res) => {
    apilog('Get register ssl');
    //console.log('params::==', req.params);
    res.redirect(env.backendhost);
});

route.post('/login', async (req, res, next) => {
    console.log('body::==', req.body);
    console.log('params::==', req.params);
    const { username, password } = req.body;

    await tb_user.find({ user_name: username, user_status: 1 }).then(
        function (result) {
            apiDebuglog("found user:" + username + " in system.", result);
            if (result.length > 0) {
                const user_detail = result;
                const checkPassword = sha256Verify(password, user_detail[0].user_pass);

                if (checkPassword) {
                    const user = { last_login: moment().format('YYYY-MM-DD HH:mm:ss') };
                    tb_user.findByIdAndUpdate(user_detail[0]._id, { $set: user }).then(
                        function (result) {
                            apiDebuglog("user update login time id " + user_detail[0]._id + " successfully", result);
                            return res.json(ReturnSuccess(2000, { id: user_detail[0]._id, level: user_detail[0].user_level, username: username, email: user_detail[0].user_email }));
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("user update login time id " + user_detail[0]._id + " error 2001", err);
                            return res.json(ReturnErr(err));
                        }
                    );
                }
                else {
                    return res.json(ReturnCustom(1003, 'Username or Password is not correct.', []));
                }
            }
            else {
                return res.json(ReturnCustom(1003, 'User is not exist.', []));

            }
        }
    ).catch(
        function (err) {
            apiErrorlog("login user:" + username + " error 2001", err);
            return res.json(ReturnErr(err));
        }
    );

});

//////////////////// end common function //////////////////


//////////////////////// tb_alert ///////////////////
//////////////////// test OK BY TOM//////////////////
route.get("/alert", async (req, res) => {
    apilog('Get alert all');
    await tb_alert.find({}).then(
        function (result) {
            apiDebuglog("find alert result successfully", result)
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find alert error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/alert/:id", async (req, res) => {
    apilog('Get alert by id');
    apilog('params::==', req.params);
    const alertId = req.params.id
    if (alertId) {
        await tb_alert.find({ _id: alertId }).then(
            function (result) {
                apiDebuglog("find alert id " + alertId + " successfully", result)
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find alert id " + alertId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find alert id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/alert", async (req, res) => {
    apilog('Post create alert');
    apilog('body::==' + req.body);

    const alert = req.body;

    if (alert) {
        const Alert = new tb_alert(alert);
        await Alert.save().then(
            function (result) {
                apiDebuglog("alert save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("alert save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("alert save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/alert/:id", async (req, res) => {
    apilog('Put Update alert');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const alert = req.body;
    const alertId = req.params.id

    if (alert && alertId) {

        await tb_alert.findByIdAndUpdate(alertId, { $set: alert }).then(
            function (result) {
                apiDebuglog("alert update id " + alertId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("alert save id " + alertId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("alert update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/alert/:id", async (req, res) => {
    apilog('Delete alert by id');
    apilog('params::==' + req.params);
    const alertId = req.params.id
    if (alertId) {
        await tb_alert.findByIdAndDelete({ _id: alertId }).then(
            function (result) {
                apiDebuglog("delete alert id " + alertId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("alert save id " + alertId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete alert error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_alert /////////////////////

//////////////////////// tb_agent_user /////////////////
//////////////////// test OK BY TOM//////////////////
route.get("/agent_user", async (req, res) => {
    apilog('Get agent user all');
    await tb_agent_user.find({}).then(
        function (result) {
            apiDebuglog("find agent user result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find agent user error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/agent_user/:id", async (req, res) => {
    apilog('Get agent user by id');
    apilog('params::==' + req.params);
    const auId = req.params.id
    if (auId) {
        await tb_agent_user.find({ _id: auId }).then(
            function (result) {
                apiDebuglog("find agent user id " + auId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find agent user id " + auId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find agent user id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/agent_user", async (req, res) => {
    apilog('Post create agent user');
    apilog('body::==' + req.body);
    const agent = req.body;

    if (agent) {
        const Agent = new tb_agent_user(agent);
        await Agent.save().then(
            function (result) {
                apiDebuglog("agent user save successfully", { id: result._id });
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("agent user save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent user save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/agent_user/:id", async (req, res) => {
    apilog('Put Update agent user');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const agent = req.body;
    const auId = req.params.id

    if (agent && auId) {
        await tb_agent_user.findByIdAndUpdate(auId, { $set: agent }).then(
            function (result) {
                apiDebuglog("agent user update id " + auId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("agent user update id " + auId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent user update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/agent_user/:id", async (req, res) => {
    apilog('Delete alert by id');
    apilog('params::==' + req.params);
    const auId = req.params.id
    if (auId) {
        await tb_agent_user.findByIdAndDelete({ _id: auId }).then(
            function (result) {
                apiDebuglog("delete agent user id " + auId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete agent user id " + auId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete agent user id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_agent_user /////////////////

//////////////////////// tb_user ///////////////////////
//////////////////// test OK BY TOM////////////////////
route.get("/user", async (req, res) => {
    apilog('Get user all');
    await tb_user.find({}).then(
        function (result) {
            apiDebuglog("find user result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find user error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/user/:id", async (req, res) => {
    apilog('Get user by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user.find({ _id: uId }).then(
            function (result) {
                apiDebuglog("find user id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find user id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find user id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/user", async (req, res) => {
    apilog('Post create user');
    apilog('body::==' + JSON.stringify(req.body));
    const user = req.body;

    if (user) {
        await tb_user.find({ user_name: user.user_name }).then(
            function (result) {
                apiDebuglog("find user name :" + user.user_name + " successfully", result);
                apilog('user dup => ' + result.length);
                if (result.length > 0) {
                    //return res.json(ReturnUnSuccess(2002,{message:'Can not add because this user name is aleary in system.'})) 
                    return res.json(ReturnCustom(1003, 'Can not add because this user name is aleary in system.', []));
                }
                else {
                    user.user_pass = sha256Encrypt(user.user_pass);
                    user.add_date = moment().format('YYYY-MM-DD HH:mm:ss');
                    const User = new tb_user(user);
                    User.save().then(
                        function (result) {
                            apiDebuglog("user save successfully", result);
                            return res.json(ReturnSuccess(2000, { id: result._id }));
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("user save error 2001", err);
                            return res.json(ReturnErr(err));
                        }
                    );
                }
            }
        ).catch(
            function (err) {
                apiErrorlog("find user name : " + user.user_name + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );

    } else {
        apilog("user save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/user/:id", async (req, res) => {
    apilog('Put Update user');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const user = req.body;
    const uId = req.params.id

    if (user && uId) {

        if (user.user_pass && user.user_pass != "") {
            apilog('gen password');
            user.user_pass = sha256Encrypt(user.user_pass);
        }
        await tb_user.findByIdAndUpdate(uId, { $set: user }).then(
            function (result) {
                apiDebuglog("user update id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("user update id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("user update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/user/:id", async (req, res) => {
    apilog('Delete user by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user.findByIdAndDelete({ _id: uId }).then(
            function (result) {
                apiDebuglog("delete user id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete user id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete user id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_user ////////////////////////

//////////////////////// tb_games ///////////////////////
////////////////////////TEST OK BY TOM  //////////////////

route.get("/games", async (req, res) => {
    apilog('Get games all');
    await tb_games.find({}).then(
        function (result) {
            apiDebuglog("find games result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find games error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/games/:id", async (req, res) => {
    apilog('Get games by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_games.find({ _id: gId }).then(
            function (result) {
                apiDebuglog("find games id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find games id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find games id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/games", async (req, res) => {
    apilog('Post create games');
    apilog('body::==' + req.body);
    const games = req.body;

    if (games) {

        const Brands = new tb_games(games);
        await Brands.save().then(
            function (result) {
                apiDebuglog("games save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("games save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("games save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/games/:id", async (req, res) => {
    apilog('Put Update games');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const games = req.body;
    const gId = req.params.id

    if (games && gId) {

        await tb_games.findByIdAndUpdate(gId, { $set: games }).then(
            function (result) {
                apiDebuglog("games update id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("games update id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("games update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/games/:id", async (req, res) => {
    apilog('Delete games by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_games.findByIdAndDelete({ _id: gId }).then(
            function (result) {
                apiDebuglog("delete games id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete games id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete games id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_games ////////////////////////

//////////////////////// tb_game_list ///////////////////////

route.get("/gamelist", async (req, res) => {
    apilog('Get game list all');
    await tb_game_list.find({}).sort({ _id: -1 }).then(
        function (result) {
            apiDebuglog("find game list result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find game list error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/gamelist/:id", async (req, res) => {
    apilog('Get game list by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_game_list.find({ _id: gId }).then(
            function (result) {
                apiDebuglog("find game list id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find game list id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find game list id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.get("/gamelistwithbrand/:brand", async (req, res) => {
    apilog('Get game list by id');
    apilog('params::==' + JSON.stringify(req.params));
    const brand = req.params.brand
    if (brand) {
        await tb_game_list.find({ game_brand: brand }).then(
            function (result) {
                apiDebuglog("find game list brand " + brand + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find game list brand " + brand + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find game list brand error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/gamelist", async (req, res) => {
    apilog('Post create game list');
    apilog('body::==' + req.body);
    const games = req.body;

    if (games) {

        const Games = new tb_game_list(games);
        await Games.save().then(
            function (result) {
                apiDebuglog("game list save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("game list save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("game list save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/gamelist/:id", async (req, res) => {
    apilog('Put Update game list');
    apilog('body::==' + JSON.stringify(req.body));
    apilog('params::==' + req.params);
    const games = req.body;
    const gId = req.params.id

    if (games && gId) {

        await tb_game_list.findByIdAndUpdate(gId, { $set: games }).then(
            function (result) {
                apiDebuglog("game list update id " + gId + " successfully", result);
                apiDebuglog("original_game_img => " + games.original_game_img);
                apiDebuglog("game_img => " + games.game_img);
                if (games.original_game_img && games.game_img && games.game_img !== games.original_game_img) {
                    var fs = require('fs');
                    try {
                        if (fs.existsSync(path)) {
                            //file exists
                            fs.unlink(__dirname + '/public/' + games.original_game_img, function (err) {
                                if (err) throw err;
                                console.log('Image file deleted!');
                                //return res.json(ReturnSuccess(2000, { id: result._id }));
                                apiDebuglog("original_game_img_app => " + games.original_game_img_app);
                                apiDebuglog("game_img => " + games.game_img_app);
                                if (games.original_game_img_app && games.game_img_app && games.game_img_app !== games.original_game_img_app) {
                                    var fs = require('fs');
                                    try {
                                        if (fs.existsSync(path)) {
                                            //file exists
                                            fs.unlink(__dirname + '/public/' + games.original_game_img, function (err) {
                                                if (err) throw err;
                                                console.log('Image file deleted!');
                                                return res.json(ReturnSuccess(2000, { id: result._id }));
                                            });
                                        }
                                    } catch (err) {
                                        console.error(err)
                                    }

                                } else {
                                    return res.json(ReturnSuccess(2000, { id: result._id }));
                                }
                            });
                        }
                    } catch (err) {
                        console.error(err)
                    }

                } else {
                    return res.json(ReturnSuccess(2000, { id: result._id }));
                }
            }
        ).catch(
            function (err) {
                apiErrorlog("game list update id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("game list update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/gamelist/:id", async (req, res) => {
    apilog('Delete game list by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_game_list.findByIdAndDelete({ _id: gId }).then(
            function (result) {
                apiDebuglog("delete game list id " + gId + " successfully", result);
                if (result.game_img && result.game_img !== '') {
                    var fs = require('fs');
                    try {
                        if (fs.existsSync(path)) {
                            //file exists
                            fs.unlink(__dirname + '/public/' + result.game_img, function (err) {
                                if (err) throw err;
                                console.log('Image file deleted!');
                                //return res.json(ReturnSuccess(2000, { id: result._id }));
                                if (result.game_img_app && result.game_img_app !== '') {
                                    var fs = require('fs');
                                    try {
                                        if (fs.existsSync(path)) {
                                            //file exists
                                            fs.unlink(__dirname + '/public/' + result.game_img_app, function (err) {
                                                if (err) throw err;
                                                console.log('Image app file deleted!');
                                                return res.json(ReturnSuccess(2000, { id: result._id }));
                                            });
                                        }
                                    } catch (err) {
                                        console.error(err)
                                    }

                                } else {
                                    return res.json(ReturnSuccess(2000, { id: result._id }));
                                }
                            });
                        }
                    } catch (err) {
                        console.error(err)
                    }

                } else {
                    return res.json(ReturnSuccess(2000, { id: result._id }));
                }
                //return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete game list id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete game list id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_game_list ////////////////////////

//////////////////////// tb_services ///////////////////////

route.get("/services", async (req, res) => {
    apilog('Get services all');
    await tb_services.find({}).sort({ _id: -1 }).then(
        function (result) {
            apiDebuglog("find services result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find services error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/services/:id", async (req, res) => {
    apilog('Get services by id');
    apilog('params::==' + req.params);
    const sId = req.params.id
    if (sId) {
        await tb_services.find({ _id: sId }).then(
            function (result) {
                apiDebuglog("find services id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find services id " + sId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find services id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.get("/services_agent/:agcode", async (req, res) => {
    apilog('Get services by agent code');
    apilog('params::==' + JSON.stringify(req.params));
    const agcode = req.params.agcode
    if (agcode) {
        await tb_services.find({ agent_code: agcode }).then(
            function (result) {
                apiDebuglog("find services by agent code " + agcode + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find services by agent code " + agcode + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find services by agent code error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/services", async (req, res) => {
    apilog('Post create services');
    apilog('body::==' + JSON.stringify(req.body));
    const services = req.body;

    if (services) {

        const Services = new tb_services(services);
        await Services.save().then(
            function (result) {
                apiDebuglog("services save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("services save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("services save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/services/:id", async (req, res) => {
    apilog('Put Update services');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const services = req.body;
    const sId = req.params.id

    if (services && sId) {

        await tb_services.findByIdAndUpdate(sId, { $set: services }).then(
            function (result) {
                apiDebuglog("services update id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("services update id " + sId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("services update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/services/:id", async (req, res) => {
    apilog('Delete services by id');
    apilog('params::==' + req.params);
    const sId = req.params.id
    if (sId) {
        await tb_services.findByIdAndDelete({ _id: sId }).then(
            function (result) {
                apiDebuglog("delete services id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete services id " + sId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete services id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_services ////////////////////////


//////////////////////// tb_agent ///////////////////////

route.get("/agent", async (req, res) => {
    apilog('Get agent all');
    await tb_agent.find({}).sort({ _id: -1 }).then(
        function (result) {
            apiDebuglog("find agent result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find agent error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/agent/:id", async (req, res) => {
    apilog('Get agent by id');
    apilog('params::==' + req.params);
    const agId = req.params.id
    if (agId) {
        await tb_agent.find({ _id: agId }).then(
            function (result) {
                apiDebuglog("find agent id " + agId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find agent id " + agId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find agent id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/agent", async (req, res) => {
    apilog('Post create agent');
    apilog('body::==' + req.body);
    const agent = req.body;

    if (agent) {

        const Agent = new tb_agent(agent);
        await Agent.save().then(
            function (result) {
                apiDebuglog("agent save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("agent save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/agent/:id", async (req, res) => {
    apilog('Put Update agent');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const agent = req.body;
    const agId = req.params.id

    if (agent && agId) {

        await tb_agent.findByIdAndUpdate(agId, { $set: agent }).then(
            function (result) {
                apiDebuglog("agent update id " + agId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("agent update id " + agId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/agent/:id", async (req, res) => {
    apilog('Delete agent by id');
    apilog('params::==' + req.params);
    const agId = req.params.id
    if (agId) {
        await tb_agent.findByIdAndDelete({ _id: agId }).then(
            function (result) {
                apiDebuglog("delete agent id " + agId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete agent id " + agId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete agent id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_agent ////////////////////////

//////////////////////// tb_user_level ///////////////////////

route.get("/user_level", async (req, res) => {
    apilog('Get user level all');
    await tb_user_level.find({}).then(
        function (result) {
            apiDebuglog("find user level result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find user level error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/user_level/:id", async (req, res) => {
    apilog('Get user level by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user_level.find({ _id: uId }).then(
            function (result) {
                apiDebuglog("find user level id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find user level id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find user level id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/user_level", async (req, res) => {
    apilog('Post create user level');
    apilog('body::==' + req.body);
    const user_level = req.body;

    if (user_level) {
        const User_level = new tb_user_level(user_level);
        await User_level.save().then(
            function (result) {
                apiDebuglog("user level save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("user level save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("user level save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/user_level/:id", async (req, res) => {
    apilog('Put Update user level');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const user_level = req.body;
    const uId = req.params.id

    if (user_level && uId) {

        await tb_user_level.findByIdAndUpdate(uId, { $set: user_level }).then(
            function (result) {
                //console.log("agent user update result : " + result);
                apiDebuglog("user level update id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                //console.log("agent user update error 2001 : " + err);
                apiErrorlog("user level update id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("user level update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/user_level/:id", async (req, res) => {
    apilog('Delete user level by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user_level.findByIdAndDelete({ _id: uId }).then(
            function (result) {
                //console.log("delete agent user id result : " + result);
                apiDebuglog("delete user level id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                //console.log("delete agent user id error 2001 : " + err);
                apiErrorlog("delete user level id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete user level id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_user_level ////////////////////////

//////////////////////// tb_brands ///////////////////////

const DIR = __dirname + '/public/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, Date.now() + '-' + fileName)
    }
});

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

var upload = multer({
    storage: storage
});

var uploadlogo = multer({
    storage: storage2
});

route.get("/brands", async (req, res) => {
    apilog('Get brands all');
    await tb_brands.find({}).sort({ _id: -1 }).then(
        function (result) {
            apiDebuglog("find brands result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find brands error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/brands/:id", async (req, res) => {
    apilog('Get brands by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_brands.find({ _id: gId }).then(
            function (result) {
                apiDebuglog("find brands id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find brands id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find brands id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/upload", upload.single('file'), (req, res) => {
    return res.json(ReturnSuccess(2000, req.file));
    //return res.send(req.file);
});

route.post("/uploadlogo", uploadlogo.single('file'), (req, res) => {
    return res.json(ReturnSuccess(2000, req.file));
    //return res.send(req.file);
});

route.post("/brands", async (req, res, next) => {
    apilog('Post create brands');
    apilog('body::==' + req.body);
    const brands = req.body;
    if (brands) {
        const Brands = new tb_brands(brands);
        await Brands.save().then(
            function (result) {
                apiDebuglog("brands save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id, image: result.image }));
            }
        ).catch(
            function (err) {
                apiErrorlog("brands save error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("brands save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/brands/:id", async (req, res) => {
    apilog('Put Update brands');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const brands = req.body;
    const gId = req.params.id

    if (brands && gId) {

        await tb_brands.findByIdAndUpdate(gId, { $set: brands }).then(
            function (result) {
                apiDebuglog("brands update id " + gId + " successfully", result);
                apiDebuglog("original_brand_img => " + brands.original_brand_img);
                apiDebuglog("brand_img => " + brands.brand_img);
                if (brands.brand_img !== brands.original_brand_img) {
                    var fs = require('fs');
                    try {
                        if (fs.existsSync(path)) {
                            //file exists
                            fs.unlink(__dirname + '/public/' + brands.original_brand_img, function (err) {
                                if (err) throw err;
                                console.log('Image file deleted!');
                                return res.json(ReturnSuccess(2000, { id: result._id }));
                            });
                        }
                    } catch (err) {
                        console.error(err)
                    }

                } else {
                    return res.json(ReturnSuccess(2000, { id: result._id }));
                }
                //return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("brands update id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("brands update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/brands/:id", async (req, res) => {
    apilog('Delete brands by id');
    apilog('params::==' + req.params);
    const gId = req.params.id
    if (gId) {
        await tb_brands.findByIdAndDelete({ _id: gId }).then(
            function (result) {
                apiDebuglog("delete brands id " + gId + " successfully", result);
                if (result.brand_img && result.brand_img !== '') {
                    var fs = require('fs');
                    try {
                        if (fs.existsSync(path)) {
                            //file exists
                            fs.unlink(__dirname + '/public/' + result.brand_img, function (err) {
                                if (err) throw err;
                                console.log('Image file deleted!');
                                return res.json(ReturnSuccess(2000, { id: result._id }));
                            });
                        }
                    } catch (err) {
                        console.error(err)
                    }

                } else {
                    return res.json(ReturnSuccess(2000, { id: result._id }));
                }
            }
        ).catch(
            function (err) {
                apiErrorlog("delete brands id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete brands id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_brands ////////////////////////

//////////////////////// tb_menu ///////////////////////

route.get("/menu", async (req, res) => {
    apilog('Get menu all');
    await tb_menu.find({}).then(
        function (result) {
            apiDebuglog("find menu result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find menu error 2001", err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/menu/:id", async (req, res) => {
    apilog('Get menu by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_menu.find({ _id: uId }).then(
            function (result) {
                apiDebuglog("find menu id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find menu id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find menu id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/menu", async (req, res) => {
    apilog('Post create menu');
    apilog('body::==' + JSON.stringify(req.body));
    const menu = req.body;

    if (menu) {
        await tb_menu.find({ menu_name: menu.menu_name }).then(
            function (result) {
                apiDebuglog("find menu name :" + menu.menu_name + " successfully", result);
                apilog('menu dup => ' + result.length);
                if (result.length > 0) {
                    //return res.json(ReturnUnSuccess(2002,{message:'Can not add because this menu name is aleary in system.'})) 
                    return res.json(ReturnCustom(1003, 'Can not add because this menu name is aleary in system.', []));
                }
                else {
                    tb_menu.find({ menu_id: menu.menu_id }).then(
                        function (result) {
                            apiDebuglog("find menu id :" + menu.menu_id + " successfully", result);
                            apilog('menu dup => ' + result.length);
                            if (result.length > 0) {
                                //return res.json(ReturnUnSuccess(2002,{message:'Can not add because this menu name is aleary in system.'})) 
                                return res.json(ReturnCustom(1003, 'Can not add because this menu id is aleary in system.', []));
                            }
                            else {
                                const Menu = new tb_menu(menu);
                                Menu.save().then(
                                    function (result) {
                                        apiDebuglog("menu save successfully", result);
                                        return res.json(ReturnSuccess(2000, { id: result._id }));
                                    }
                                ).catch(
                                    function (err) {
                                        apiErrorlog("menu save error 2001", err);
                                        return res.json(ReturnErr(err));
                                    }
                                );
                            }
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("find menu name : " + menu.menu_name + " error 2001", err);
                            return res.json(ReturnErr(err));
                        }
                    );
                }
            }
        ).catch(
            function (err) {
                apiErrorlog("find menu name : " + menu.menu_name + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );

    } else {
        apilog("menu save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/menu/:id", async (req, res) => {
    apilog('Put Update menu');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const menu = req.body;
    const uId = req.params.id

    if (menu && uId) {
        await tb_menu.findByIdAndUpdate(uId, { $set: menu }).then(
            function (result) {
                apiDebuglog("menu update id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("menu update id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("menu update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/menu/:id", async (req, res) => {
    apilog('Delete menu by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_menu.findByIdAndDelete({ _id: uId }).then(
            function (result) {
                apiDebuglog("delete menu id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete menu id " + uId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete menu id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_menu ////////////////////////

//////////////////////// tb_member ///////////////////////

route.get("/member", async (req, res) => {
    apilog('Get services all');
    await tb_member.find({}).sort({ _id: -1 }).then(
        function (result) {
            apiDebuglog("find member result successfully", result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find member error 2001", err);
            //return res.json(ReturnErr(err));
            return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get inormation member" }));
        }
    );
});

route.get("/member/getBalance/:id", async (req, res) => {
    apilog('Get Balance by id');
    apilog('params::==' + req.params);
    const sId = req.params.id
    if (sId) {
        await tb_member.find({ _id: sId }).then(
            function (result) {
                apiDebuglog("Get Balance member id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { mem_balance: result[0].mem_balance }));

            }
        ).catch(
            function (err) {
                apiErrorlog("Get Balance member id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get balance member id: " + sId }));
            }
        );
    } else {
        apilog("Get Balance id error 2002 : No request params value.");
        return res.json(ReturnUnSuccess(2002, { message: "No request params value." }));
    }

});
route.get("/member/info/:id", async (req, res) => {
    apilog('Get info by id');
    apilog('params::==' + req.params);
    const sId = req.params.id
    if (sId) {
        await tb_member.find({ _id: sId }).then(
            function (result) {
                apiDebuglog("Get info member id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("Get info member id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get inormation member id: " + sId }));
            }
        );
    } else {
        apilog("Get info id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/member/register", async (req, res) => {
    apilog('Post create member');
    apilog('body::==' + JSON.stringify(req.body));
    const member = req.body;

    if (member) {
        apilog('Post create member mem_date_add : ' + member.mem_date_add);
        member.mem_date_add = moment().format('DD-MM-YYYY HH:mm:ss');
        const Member = new tb_member(member);
        await Member.save().then(
            function (result) {
                apiDebuglog("member save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("member save error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess register member" }));
            }
        );
    } else {
        apilog("member save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/member/:id", async (req, res) => {
    apilog('Put Update member');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const member = req.body;
    const sId = req.params.id

    if (member && sId) {

        await tb_member.findByIdAndUpdate(sId, { $set: member }).then(
            function (result) {
                apiDebuglog("member update id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("member update id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess update member id: " + sId }));
            }
        );
    } else {
        apilog("member update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.put("/member/deposit/:id", async (req, res) => {
    apilog('Put Update member');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const member = req.body;
    const sId = req.params.id

    if (member && sId) {
        const mem_balance = { mem_balance: member.mem_balance };
        await tb_member.findByIdAndUpdate(sId, { $set: mem_balance }).then(
            function (result) {
                apiDebuglog("member deposit id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("member deposit id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess deposit member id: " + sId }));
            }
        );
    } else {
        apilog("member deposit error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});


route.put("/member/WithdrawAll/:id", async (req, res) => {
    apilog('Put Update member');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const member = { mem_balance: '0' };
    const sId = req.params.id

    if (member && sId) {

        await tb_member.findByIdAndUpdate(sId, { $set: member }).then(
            function (result) {
                apiDebuglog("member WithdrawAll id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("member WithdrawAll id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess WithdrawAll member id: " + sId }));
            }
        );
    } else {
        apilog("member WithdrawAll error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/member/:id", async (req, res) => {
    apilog('Delete member by id');
    apilog('params::==' + req.params);
    const sId = req.params.id
    if (sId) {
        await tb_member.findByIdAndDelete({ _id: sId }).then(
            function (result) {
                apiDebuglog("delete member id " + sId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete member id " + sId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess delete member id: " + sId }));
            }
        );
    } else {
        apilog("delete member id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_member ////////////////////////

//////////////////////// tb_wallets ///////////////////////

route.get("/wallets", async (req, res) => {
    apilog('Get wallets all');
    await tb_wallets.find({}).then(
        function (result) {
            apiDebuglog("find wallets result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find wallets error 2001", err);
            //return res.json(ReturnErr(err));
            return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get wallets." }));
        }
    );
});

route.get("/wallets/:id", async (req, res) => {
    apilog('Get wallets by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_wallets.find({ _id: uId }).then(
            function (result) {
                apiDebuglog("find wallets id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find wallets id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get wallet id: " + sId }));
            }
        );
    } else {
        apilog("find wallets id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/wallets/get/", async (req, res) => {
    apilog('Get wallets');
    apilog('params::==' + req.params);
    apilog('body::==' + req.body);
    const walletdata = req.body;


    if (walletdata) {
        const mem_username = walletdata.mem_username;
        const brand_code = walletdata.brand_code;
        const agent_code = walletdata.agent_code;
        await tb_wallets.find({ mem_username: mem_username,brand_code: brand_code,agent_code: agent_code }).then(
            function (result) {
                apiDebuglog("find wallets successfully (", result.length + ")");
                if (result.length>0) {
                    return res.json(ReturnSuccess(2000, result));
                } else {
                    return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get wallet." }));
                }
                
            }
        ).catch(
            function (err) {
                apiErrorlog("find wallets error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get wallet." }));
            }
        );
    } else {
        apilog("find wallets error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/wallets/register", async (req, res) => {
    apilog('Post create wallets');
    apilog('body::==' + JSON.stringify(req.body));
    const wallets = req.body;

    if (wallets) {
        await tb_wallets.find({ mem_username: wallets.mem_username, brand_code: wallets.brand_code, agent_code: wallets.agent_code }).then(
            function (result) {
                apiDebuglog("find wallets membem name :" + wallets.mem_username + " successfully", result);
                apilog('wallets dup => ' + result.length);
                if (result.length > 0) {
                    //return res.json(ReturnUnSuccess(2002,{message:'Can not add because this menu name is aleary in system.'})) 
                    return res.json(ReturnCustom(1003, 'Can not add because this wallets is aleary in system.', []));
                }
                else {
                    const Wallets = new tb_wallets(wallets);
                    Wallets.save().then(
                        function (result) {
                            apiDebuglog("wallets save successfully", result);
                            return res.json(ReturnSuccess(2000, { id: result._id }));
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("save wallets error 2001", err);
                            //return res.json(ReturnErr(err));
                            return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for register wallet." }));
                        }
                    );

                }
            }
        ).catch(
            function (err) {
                apiErrorlog("save wallets error 2001 ", err);
                return res.json(ReturnErr(err));
            }
        );

    } else {
        apilog("wallets save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/wallets/:id", async (req, res) => {
    apilog('Put Update wallets');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const wallets = req.body;
    const uId = req.params.id

    if (wallets && uId) {
        await tb_wallets.findByIdAndUpdate(uId, { $set: wallets }).then(
            function (result) {
                apiDebuglog("wallets update id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("wallets update id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess update wallet id: " + uId}));
            }
        );
    } else {
        apilog("wallets update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});


route.delete("/wallets/:id", async (req, res) => {
    apilog('Delete wallets by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_wallets.findByIdAndDelete({ _id: uId }).then(
            function (result) {
                apiDebuglog("delete wallets id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("delete wallets id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess delete wallet id: " + uId}));
            }
        );
    } else {
        apilog("delete wallets id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_wallets ////////////////////////

//////////////////////// tb_move_credit ///////////////////////

route.get("/moveCredit", async (req, res) => {
    apilog('Get moveCredit all');
    await tb_move_credit.find({}).then(
        function (result) {
            apiDebuglog("find moveCredit result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("find moveCredit error 2001", err);
            //return res.json(ReturnErr(err));
            return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get moveCredit."}));
        }
    );
});

route.get("/moveCredit/:id", async (req, res) => {
    apilog('Get moveCredit by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_move_credit.find({ _id: uId }).then(
            function (result) {
                apiDebuglog("find moveCredit id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find moveCredit id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get moveCredit id: " + uId}));
            }
        );
    } else {
        apilog("find moveCredit id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

route.post("/moveCredit", async (req, res) => {
    apilog('Post create moveCredit');
    apilog('body::==' + req.body);
    const moveCredit = req.body;

    if (moveCredit) {
        moveCredit.move_date = moment().format('DD-MM-YYYY');
        moveCredit.move_time = moment().format('HH:mm:ss');
        const MoveCredit = new tb_move_credit(moveCredit);
        await MoveCredit.save().then(
            function (result) {
                apiDebuglog("moveCredit save successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                apiErrorlog("moveCredit save error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for add moveCredit."}));
            }
        );
    } else {
        apilog("moveCredit save error 2002 : No request body value.");
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/moveCredit/:id", async (req, res) => {
    apilog('Put Update moveCredit');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);
    const moveCredit = req.body;
    const uId = req.params.id

    if (moveCredit && uId) {

        await tb_move_credit.findByIdAndUpdate(uId, { $set: moveCredit }).then(
            function (result) {
                //console.log("agent user update result : " + result);
                apiDebuglog("moveCredit update id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                //console.log("agent user update error 2001 : " + err);
                apiErrorlog("moveCredit update id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for update moveCredit id: " + uId}));
            }
        );
    } else {
        apilog("moveCredit update error 2002 : No request body & params value.");
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/moveCredit/:id", async (req, res) => {
    apilog('Delete moveCredit by id');
    apilog('params::==' + req.params);
    const uId = req.params.id
    if (uId) {
        await tb_move_credit.findByIdAndDelete({ _id: uId }).then(
            function (result) {
                //console.log("delete agent user id result : " + result);
                apiDebuglog("delete moveCredit id " + uId + " successfully", result);
                return res.json(ReturnSuccess(2000, { id: result._id }));
            }
        ).catch(
            function (err) {
                //console.log("delete agent user id error 2001 : " + err);
                apiErrorlog("delete moveCredit id " + uId + " error 2001", err);
                //return res.json(ReturnErr(err));
                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for delete moveCredit id: " + uId}));
            }
        );
    } else {
        apilog("delete moveCredit id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_move_credit ////////////////////////

module.exports = route;