const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const env = require('../env');
const tb_alert = require('../models/tb_alert');
const tb_agent_user = require('../models/tb_agent_user');
const tb_user = require('../models/tb_user');
const tb_games = require('../models/tb_games');

let message = 'Success';
let status = 2000;
const route = express.Router();

// คำสั่งเชื่อม MongoDB Atlas
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
       console.log(msg); 
    }    
}

function apiDebuglog(msg,result) {    
    if (env.showDebuglog === 1) {
        msg = msg + " result : " + result;
    }    
    console.log(msg);
}

function apiErrorlog(msg,err) {    
    if (env.showErrorlog === 1) {
        msg = msg + " ErrorMsg => " + err;
    }    
    console.log(msg);
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


//////////////////////// tb_alert ///////////////////
//////////////////// test OK BY TOM//////////////////
route.get("/alert", async (req, res) => {
    apilog('Get alert all');
    await tb_alert.find({}).then(
        function(result) {
            //apilog("fine alert result : " + result);
            apiDebuglog("fine alert result successfully",result)
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            apiErrorlog("fine alert error 2001" , err);
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
            function(result) {
                apiDebuglog("find alert id " + alertId + " successfully",result)
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find alert id " + alertId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find alert id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/alert", async (req, res) => {
    apilog('Post create alert');
    apilog('body::==' + req.body);
    //console.log('params::==', req.params);

    const alert = req.body;

    if (alert) {
        const Alert = new tb_alert(alert);
        await Alert.save().then(
            function(result) {
                apiDebuglog("alert save successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("alert save id " + alertId + " error 2001 : " + err);
                apiErrorlog("alert save error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("alert save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/alert/:id", async (req, res) => {
    apilog('Put Update alert');
    apilog('body::=='+ req.body);
    apilog('params::=='+ req.params);
    const alert = req.body;
    const alertId = req.params.id

    if (alert && alertId) {
        
        await tb_alert.findByIdAndUpdate(alertId,{ $set: alert}).then(
            function(result) {
                //console.log("alert update id " + alertId + " successfully result : " + result);
                apiDebuglog("alert update id " + alertId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("alert save id " + alertId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("alert update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/alert/:id", async (req, res) => {
    apilog('Delete alert by id');
    apilog('params::=='+ req.params);
    const alertId = req.params.id
    if (alertId) {
        await tb_alert.findByIdAndDelete({ _id: alertId }).then(
            function(result) {
                //console.log("delete alert id " + alertId + " successfully result : " + result);
                apiDebuglog("delete alert id " + alertId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("alert save id " + alertId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete alert error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_alert /////////////////////

//////////////////////// tb_agent_user /////////////////
//////////////////// test OK BY TOM//////////////////
route.get("/agent_user", async (req, res) => {
    apilog('Get agent user all');    
    await tb_agent_user.find({}).then(
        function(result) {
            apiDebuglog("fine agent user result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            //apiErrorlog("alert save id " + alertId + " error 2001" , err);
            apiErrorlog("fine agent user error 2001" , err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/agent_user/:id", async (req, res) => {
    apilog('Get agent user by id');
    apilog('params::=='+ req.params);
    const auId = req.params.id
    if (auId) {
        await tb_agent_user.find({ _id: auId }).then(
            function(result) {
                //console.log("find agent user id " + auId + " result : " + result);
                apiDebuglog("find agent user id " + auId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("find agent user id " + auId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find agent user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/agent_user", async (req, res) => {
    apilog('Post create agent user');
    apilog('body::=='+ req.body);
    const agent = req.body;

    if (agent) {
        //agent.user_pass = sha256Encrypt(agent.user_pass);
        const Agent = new tb_agent_user(agent);
        await Agent.save().then(
            function(result) {
                //console.log("agent user save successfully result : " + result);
                apiDebuglog("agent user save successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                apiErrorlog("agent user save error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent user save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/agent_user/:id", async (req, res) => {
    apilog('Put Update agent user');
    apilog('body::=='+ req.body);
    apilog('params::=='+ req.params);
    const agent = req.body;
    const auId = req.params.id

    if (agent && auId) {
        /* console.log('agent.user_pass : ' + agent.user_pass);        
        if (agent.user_pass &&  agent.user_pass != "") {
            console.log('gen password'); 
            agent.user_pass = sha256Encrypt(agent.user_pass);
        } */
        await tb_agent_user.findByIdAndUpdate(auId,{ $set: agent}).then(
            function(result) {
                //console.log("agent user update id " + auId + " successfully result : " + result);
                apiDebuglog("agent user update id " + auId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("agent user update id " + auId + " error 2001 : " + err);
                apiErrorlog("agent user update id " + auId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("agent user update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/agent_user/:id", async (req, res) => {
    apilog('Delete alert by id');
    apilog('params::=='+ req.params);
    const auId = req.params.id
    if (auId) {
        await tb_agent_user.findByIdAndDelete({ _id: auId }).then(
            function(result) {
                //console.log("delete agent user id " + auId + " successfully result : " + result);
                apiDebuglog("delete agent user id " + auId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
               // console.log("delete agent user id " + auId + " error 2001 : " + err);
               apiErrorlog("delete agent user id " + auId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete agent user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_agent_user /////////////////

//////////////////////// tb_user /////////////////////////////////////////////////
//////////////////// test OK BY TOM////////////////////
route.get("/user", async (req, res) => {
    apilog('Get user all');
    await tb_user.find({}).then(
        function(result) {
            //console.log("fine user result : " + result);
            apiDebuglog("fine user result successfully" + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            //console.log("fine user error 2001 : " + err);
            apiErrorlog("fine user error 2001" , err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/user/:id", async (req, res) => {
    apilog('Get user by id');
    apilog('params::=='+ req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user.find({ _id: uId }).then(
            function(result) {
                //console.log("find user id " + uId + " result : " + result);
                apiDebuglog("find user id " + uId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("find user id error 2001 : " + err);
                apiErrorlog("find user id " + uId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/user", async (req, res) => {
    apilog('Post create agent user');
    apilog('body::=='+ req.body);
    const user = req.body;

    if (user) {
        user.user_pass = sha256Encrypt(user.user_pass);
        const User = new tb_user(user);
        await User.save().then(
            function(result) {
                //console.log("user save successfully result : " + result);
                apiDebuglog("user save successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("user save error 2001 : " + err);
                apiErrorlog("user save error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("user save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/user/:id", async (req, res) => {
    apilog('Put Update user');
    apilog('body::=='+ req.body);
    apilog('params::=='+ req.params);
    const user = req.body;
    const uId = req.params.id

    if (user && uId) {
        
        if (user.user_pass &&  user.user_pass != "") {
            apilog('gen password'); 
            user.user_pass = sha256Encrypt(user.user_pass);
        }
        await tb_user.findByIdAndUpdate(uId,{ $set: user}).then(
            function(result) {
                //console.log("agent user update result : " + result);
                apiDebuglog("user update id " + uId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("agent user update error 2001 : " + err);
                apiErrorlog("user update id " + uId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("user update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/user/:id", async (req, res) => {
    apilog('Delete alert by id');
    apilog('params::=='+ req.params);
    const uId = req.params.id
    if (uId) {
        await tb_user.findByIdAndDelete({ _id: uId }).then(
            function(result) {
                //console.log("delete agent user id result : " + result);
                apiDebuglog("delete user id " + uId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("delete agent user id error 2001 : " + err);
                apiErrorlog("delete user id " + uId + " error 2001" , err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_user ///////////////////////////////////////////////

//////////////////////// tb_games ////////////////////////////////////////////////
////////////////////////TEST OK BY TOM  ////////////////////////////////////////////////

route.get("/games", async (req, res) => {
    apilog('Get games all');
    await tb_games.find({}).then(
        function (result) {
            //console.log("fine user result : " + result);
            apiDebuglog("fine games result successfully" , result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            //console.log("fine user error 2001 : " + err);
            apiErrorlog("fine games error 2001", err);
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
                //console.log("find user id " + uId + " result : " + result);
                apiDebuglog("find games id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("find user id error 2001 : " + err);
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
    apilog('games::==' + req.body);
    const games = req.body;

    if (games) {

        const Games = new tb_games(games);
        await Games.save().then(
            function (result) {
                //console.log("user save successfully result : " + result);
                apiDebuglog("games save successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("user save error 2001 : " + err);
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
                //console.log("agent user update result : " + result);
                apiDebuglog("games update id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("agent user update error 2001 : " + err);
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
                //console.log("delete agent user id result : " + result);
                apiDebuglog("delete games id " + gId + " successfully", result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                //console.log("delete agent user id error 2001 : " + err);
                apiErrorlog("delete games id " + gId + " error 2001", err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("delete games id error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }

});

///////////////////// end tb_games ///////////////////////////////////////////////

module.exports = route;