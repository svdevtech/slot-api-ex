const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const env = require('../env');
const tb_alert = require('../models/tb_alert');
const tb_agent_user = require('../models/tb_agent_user');
const tb_user = require('../models/tb_user');

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
    apilog('body::==', req.body);
    //console.log('params::==', req.params);

    const alert = req.body;

    if (alert) {
        const Alert = new tb_alert(alert);
        await Alert.save().then(
            function(result) {
                apiDebuglog("alert save id " + alertId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("alert save id " + alertId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("alert save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/alert/:id", async (req, res) => {
    console.log('Put Update alert');
    console.log('body::==', req.body);
    console.log('params::==', req.params);
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
                console.log("alert update id " + alertId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("alert update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/alert/:id", async (req, res) => {
    console.log('Delete alert by id');
    console.log('params::==', req.params);
    const alertId = req.params.id
    if (alertId) {
        await tb_alert.find({ _id: alertId }).then(
            function(result) {
                //console.log("delete alert id " + alertId + " successfully result : " + result);
                apiDebuglog("delete alert id " + alertId + " successfully" , result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("delete alert id " + alertId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("delete alert error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_alert /////////////////////

//////////////////////// tb_agent_user /////////////////
route.get("/agent_user", async (req, res) => {
    console.log('Get agent user all');
    await tb_agent_user.find({}).then(
        function(result) {
            console.log("fine agent user result : " + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            console.log("fine agent user error 2001 : " + err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/agent_user/:id", async (req, res) => {
    console.log('Get agent user by id');
    console.log('params::==', req.params);
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
                console.log("find agent user id " + auId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("find agent user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/agent_user", async (req, res) => {
    console.log('Post create agent user');
    console.log('body::==', req.body);
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
                console.log("agent user save error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("agent user save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/agent_user/:id", async (req, res) => {
    console.log('Put Update agent user');
    console.log('body::==', req.body);
    console.log('params::==', req.params);
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
                console.log("agent user update id " + auId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("agent user update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/agent_user/:id", async (req, res) => {
    console.log('Delete alert by id');
    console.log('params::==', req.params);
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
                console.log("delete agent user id " + auId + " error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("delete agent user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_agent_user /////////////////

//////////////////////// tb_user ///////////////////////
route.get("/user", async (req, res) => {
    console.log('Get user all');
    await tb_user.find({}).then(
        function(result) {
            console.log("fine user result : " + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            console.log("fine user error 2001 : " + err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/user/:id", async (req, res) => {
    console.log('Get user by id');
    console.log('params::==', req.params);
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
                console.log("find user id error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("find user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/user", async (req, res) => {
    console.log('Post create agent user');
    console.log('body::==', req.body);
    const user = req.body;

    if (user) {
        user.user_pass = sha256Encrypt(user.user_pass);
        const User = new tb_agent_user(user);
        await User.save().then(
            function(result) {
                console.log("user save successfully result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("user save error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("agent user save error 2002 : No request body value." );
        return res.json(ReturnSuccess(2002, "No request body value."));
    }

});

route.put("/agent_user/:id", async (req, res) => {
    console.log('Put Update agent user');
    console.log('body::==', req.body);
    console.log('params::==', req.params);
    const agent = req.body;
    const auId = req.params.id

    if (agent && auId) {
        console.log('agent.user_pass : ' + agent.user_pass);        
        if (agent.user_pass &&  agent.user_pass != "") {
            console.log('gen password'); 
            agent.user_pass = sha256Encrypt(agent.user_pass);
        }
        await tb_agent_user.findByIdAndUpdate(auId,{ $set: agent}).then(
            function(result) {
                console.log("agent user update result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("agent user update error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("agent user update error 2002 : No request body & params value." );
        return res.json(ReturnSuccess(2002, "No request body & params value."));
    }

});

route.delete("/agent_user/:id", async (req, res) => {
    console.log('Delete alert by id');
    console.log('params::==', req.params);
    const auId = req.params.id
    if (auId) {
        await tb_agent_user.findByIdAndDelete({ _id: auId }).then(
            function(result) {
                console.log("delete agent user id result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("delete agent user id error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("delete agent user id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_agent_user /////////////////

module.exports = route;