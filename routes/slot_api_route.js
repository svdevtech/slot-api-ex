const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const env = require('../env');
const tb_alert = require('../models/tb_alert');
const tb_agent_user = require('../models/tb_agent_user');

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
    console.log('Get welcome');
    res.status(200).send("!!! Welcome to slot API world. !!!");
});


//////////////////////// tb_alert ///////////////////
route.get("/alert", async (req, res) => {
    console.log('Get alert all');
    await tb_alert.find({}).then(
        function(result) {
            console.log("fine alert result : " + result);
            return res.json(ReturnSuccess(2000, result));
        }
    ).catch(
        function (err) {
            console.log("fine alert error 2001 : " + err);
            return res.json(ReturnErr(err));
        }
    );
});

route.get("/alert/:id", async (req, res) => {
    console.log('Get alert by id');
    console.log('params::==', req.params);
    const alertId = req.params.id
    if (alertId) {
        await tb_alert.find({ _id: alertId }).then(
            function(result) {
                console.log("find alert id result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("find alert id error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("find alert id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

route.post("/alert", async (req, res) => {
    console.log('Post create alert');
    console.log('body::==', req.body);
    //console.log('params::==', req.params);

    const alert = req.body;

    if (alert) {
        const Alert = new tb_alert(alert);
        await Alert.save().then(
            function(result) {
                console.log("alert save result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("alert save error 2001 : " + err);
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
                console.log("alert update result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("alert update error 2001 : " + err);
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
                console.log("delete alert id result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("delete alert id error 2001 : " + err);
                return res.json(ReturnErr(err));
            }
        );
    } else {
        console.log("delete alert id error 2002 : No request params value." );
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
    
});

///////////////////// end tb_alert /////////////////

//////////////////////// tb_agent_user ///////////////////
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
                console.log("find agent user id result : " + result);
                return res.json(ReturnSuccess(2000, result));
            }
        ).catch(
            function (err) {
                console.log("find agent user id error 2001 : " + err);
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
        agent.user_pass = sha256Encrypt(agent.user_pass);
        const Agent = new tb_agent_user(agent);
        await Agent.save().then(
            function(result) {
                console.log("agent user save result : " + result);
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