//import axios from 'axios';

const axios = require('axios');
const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const env = require('../env');
const multer = require('multer');
const moment = require('moment-timezone');
const { json } = require('body-parser');


const tb_alert = require('../models/tb_alert');
const tb_agent_user = require('../models/tb_agent_user');
const tb_user = require('../models/tb_user');

const tb_brands = require('../models/tb_brands');
const tb_menu = require('../models/tb_menu');
const tb_agent_menu = require('../models/tb_agent_menu');

const tb_game_list = require('../models/tb_game_list');
const tb_services = require('../models/tb_services');
const tb_agent = require('../models/tb_agent');
const tb_user_log = require('../models/tb_user_log');
const tb_user_level = require('../models/tb_user_level');

const tb_member = require('../models/tb_member');
const tb_move_credit = require('../models/tb_move_credit');
const tb_wallets = require('../models/tb_wallets');
const tb_member_runno = require('../models/tb_member_runno');

const tb_turnover = require('../models/tb_turnover');
const tb_transections = require('../models/tb_transections');
const { start } = require('repl');

var md5 = require('md5');
const { exception } = require('console');
const { resolve } = require('path');


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
        var tz = moment().tz('Asia/Bangkok').format('DD MMM YYYY HH:mm:ss');
        console.log(tz + " :: " + msg);
        //console.log(moment().format('DD MMM YYYY HH:mm:ss') + " :: " + msg);
    }
}

function apiDebuglog(msg, result) {
    if (env.showDebuglog === 1) {
        msg = msg + " result : " + result;
    }
    var tz = moment().tz('Asia/Bangkok').format('DD MMM YYYY HH:mm:ss');
    console.log(tz + " :: " + msg);
}

function apiErrorlog(msg, err) {
    if (env.showErrorlog === 1) {
        msg = msg + " ErrorMsg => " + err;
    }
    var tz = moment().tz('Asia/Bangkok').format('DD MMM YYYY HH:mm:ss');
    console.log(tz + " :: " + msg);
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

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function sortByKey(jsObj) {
    var sortedArray = [];

    // Push each JSON Object entry in array by [key, value]
    for (var i in jsObj) {
        sortedArray.push([i, jsObj[i]]);
    }

    // Run native sort function and returns sorted array.
    return sortedArray.sort();
}

function CreateParams(jsObj) {
    var result = "", i;
    var obj = sortByKey(jsObj);
    for (i = 0; i < obj.length; i++) {
        if (i == 0) {
            result += obj[i][0] + "=" + obj[i][1];
        } else {
            result += "&" + obj[i][0] + "=" + obj[i][1];
        }
    }
    if (result.length == 0) {
        result = "-";
    }
    return result;
}

function webAuthen(agent_code, api_name, params, MD5) {
    //hash description
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //md5 = agent_code + agent_api_user + agent_api_password + api_name + params_obj + agent_api_key
    //params must be sort by keys in Alphabetical order. ex: params = 'key1=value1&key2=value2&key3=value3'
    //if no params please insert '-'.
    apilog('Web Authen start.');
    apilog('Get agent by agent code');
    if (params) {
        const tmp = JSON.stringify(params)
        console.log('params : ' + JSON.stringify(params));
        var params_obj = CreateParams(params);
        console.log('params obj : ' + params_obj);
        return new Promise(function (resolve, reject) {
            tb_agent.find({ agent_code: agent_code }).then(
                function (result) {
                    if (result.length > 0) {
                        const agent_api_user = result[0].agent_api_user;
                        const agent_api_password = result[0].agent_api_password;
                        const agent_api_key = result[0].agent_api_key;
                        try {
                            console.log('md5 : ' + agent_code + result[0].agent_api_user + result[0].agent_api_password + api_name + params_obj + result[0].agent_api_key);
                            const checked_md5 = md5(agent_code + result[0].agent_api_user + result[0].agent_api_password + api_name + params_obj + result[0].agent_api_key);
                            console.log('md5 [1] : ' + checked_md5);
                            console.log('md5 [2] : ' + MD5);
                            if (checked_md5.toString() === MD5.toString()) {
                                apilog('md5 is authentications.');
                                resolve(1);
                            } else {
                                apilog('missing md5');
                                resolve(0);
                            }
                        } catch (err) {
                            apiErrorlog("hash md5 error", err);
                            resolve(4);
                        }

                    } else {
                        apilog('missing agent_code');
                        resolve(2);
                    }
                }
            ).catch(
                function (err) {
                    apiErrorlog("find agent for md5 authen error", err);
                    reject(3);
                }
            );
        })

    } else {
        apilog('no params');
        return 5;
    }
}

const loadbrand = async (agent_code) => {

    if (agent_code) {
        await tb_services.find({ agent_code: agent_code, ser_status: 'On' }).then(
            function (result) {
                if (result.length > 0) {
                    var i;
                    var brand = [];
                    var loadcomplete = false;
                    var mylength = result.length
                    for (i = 0; i < mylength; i++) {
                        brand.push({ 'brand_code': result[i].brand_code });
                    }
                    return brand;

                } else {
                    apilog("find brand list (Code:2009): No Data.");
                    return [-2];
                }
            }
        ).catch(
            function (err) {
                apiErrorlog("find brand list error 2001", err);
                return [err];
            }
        );
    } else {
        apilog("find  brand list  error 2002 : No request params value.");
        return [-1];
    }
};

const configHeader = (token = null) => {
    // const tokenData = token ? { token: token } : {};  

    const config = {
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
        },
    };

    return config;
};

function getAllData(URLs) {
    return Promise.all(URLs.map(fetchData));
}

function fetchData(URL) {
    return axios.get(URL).then((response) => {
        return {
            success: true,
            amount: response.data.amount
        };
    }).catch((err) => {
        return {
            success: false
        };
    });
}

/* route.get("/TestOutStand/:mem_username/:agent_code", async (req, res) => {
    apilog('Get TestOutStand');
    const agent_code = req.params.agent_code;
    const mem_username = req.params.mem_username;
    if (agent_code) {
        await tb_services.find({ agent_code: agent_code, ser_status: 'On' }).then(
            async function (result) {
                if (result.length > 0) {
                    var i;
                    var brand_arr = [];
                    var mylength = result.length
                    for (i = 0; i < mylength; i++) {
                        brand_arr.push(env.GAME_API + result[i].brand_code + '/getBalance/' + agent_code + "/" + mem_username);
                    }
                    console.log('brand_arr=' + JSON.stringify(brand_arr));
                    try {
                        getAllData(brand_arr).then(resp => {
                            var amount = 0;
                            resp.forEach(r => {
                                if (r.success) {
                                    console.log(r);
                                    amount += r.amount;
                                }
                            });
                        }).catch(err => {
                            return res.json(ReturnSuccess(2007, err));
                        })

                    } catch (err) {
                        console.log('Promise err: ' + error);
                        return res.json(ReturnErr(err));
                    }
                } else {
                    tb_agent.find({ agent_code: agent_code }).then(
                        function (result) {
                            apiDebuglog("find agent_code : " + agent_code + " successfully", result);
                            tb_services.find({ agent_code: result[0].agent_lineup, ser_status: 'On' }).then(
                                function (result) {
                                    if (result.length > 0) {
                                        var i;
                                        var brand = [];
                                        //var loadcomplete = false;
                                        var mylength = result.length
                                        for (i = 0; i < mylength; i++) {
                                            brand_arr.push(env.GAME_API + result[i].brand_code + '/getBalance/' + agent_code + "/" + mem_username);
                                        }
                                        console.log('brand_arr=' + JSON.stringify(brand_arr));
                                        try {
                                            getAllData(brand_arr).then(resp => {
                                                return res.json(ReturnSuccess(2000, resp));
                                            }).catch(err => {
                                                return res.json(ReturnSuccess(2007, err));
                                            })

                                        } catch (err) {
                                            console.log('Promise err: ' + error);
                                            return res.json(ReturnErr(err));
                                        }

                                    } else {
                                        apilog("find brand list (Code:2009): No Data.");
                                        return res.json(ReturnSuccess(2009, "No Data"));

                                    }
                                }
                            ).catch(
                                function (err) {
                                    apiErrorlog("find brand list error 2001", err);
                                    return res.json(ReturnErr(err));
                                }
                            );
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("find agent_code " + agent_code + " error 2001", err);
                            return res.json(ReturnErr(err));
                        }
                    );

                }
            }
        ).catch(
            function (err) {
                apiErrorlog("find brand list error 2001 :: ", err);

                return res.json(ReturnErr(err));
            }
        );
    } else {
        apilog("find brand list  error 2002 : No request params value.");
        return res.json(ReturnSuccess(2002, "No request params value."));
    }
}); */

route.get("/", (req, res) => {
    apilog('Get API External Integration welcome');
    res.status(200).send("!!! Welcome to slot API External Integration. !!!");
});

route.get("/MD5/:Msg", (req, res) => {
    apilog('Get MD5 for Msg : ' + req.params.Msg);
    apilog("Msg MD5 : " + md5(req.params.Msg));
    res.status(200).send(md5(req.params.Msg));
});

route.get("/getBalance/:mem_username/:agent_code/:hash", async (req, res) => {
    apilog('Get Balance by id');
    apilog('params::==' + req.params);
    const mem_username = req.params.mem_username
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    const check_authen = await webAuthen(agent_code, "getBalance", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);
    if (check_authen == 1) {
        if (mem_username) {
            await tb_member.find({ mem_username: mem_username, agent_code: agent_code }).then(
                async function (response) {
                    apiDebuglog("Get Balance member id " + mem_username + " successfully", response);
                    //return res.json(ReturnSuccess(2000, { mem_balance: result[0].mem_balance }));
                    await tb_services.find({ agent_code: agent_code, ser_status: 'On' }).then(
                        async function (result) {
                            if (result.length > 0) {
                                var i;
                                var brand_arr = [];
                                var mylength = result.length
                                for (i = 0; i < mylength; i++) {
                                    brand_arr.push(env.GAME_API + result[i].brand_code + '/getBalance/' + agent_code + "/" + mem_username);
                                }
                                console.log('brand_arr=' + JSON.stringify(brand_arr));
                                try {
                                    getAllData(brand_arr).then(resp => {
                                        var amount = 0;
                                        resp.forEach(r => {
                                            if (r.success) {
                                                console.log(r);
                                                amount += r.amount;
                                            }
                                        });
                                        if (!amount) {
                                            amount = 0;
                                        }
                                        return res.json(ReturnSuccess(2000, { 'mem_balance': response[0].mem_balance ,'OutStand' : amount.toString() }));
                                    }).catch(err => {
                                        return res.json(ReturnSuccess(2007, err));
                                    })

                                } catch (err) {
                                    console.log('Promise err: ' + error);
                                    return res.json(ReturnErr(err));
                                }
                            } else {
                                tb_agent.find({ agent_code: agent_code }).then(
                                    function (resp) {
                                        apiDebuglog("find agent_code : " + agent_code + " successfully", resp);
                                        //return res.json(ReturnSuccess(2000, result));
                                        tb_services.find({ agent_code: resp[0].agent_lineup, ser_status: 'On' }).then(
                                            function (result) {
                                                if (result.length > 0) {
                                                    var i;
                                                    var brand_arr = [];
                                                    var mylength = result.length
                                                    for (i = 0; i < mylength; i++) {
                                                        brand_arr.push(env.GAME_API + result[i].brand_code + '/getBalance/' + agent_code + "/" + mem_username);
                                                    }
                                                    console.log('brand_arr=' + JSON.stringify(brand_arr));
                                                    try {
                                                        getAllData(brand_arr).then(resp => {
                                                            var amount = 0;
                                                            resp.forEach(r => {
                                                                if (r.success) {
                                                                    console.log(r);
                                                                    amount += r.amount;
                                                                }
                                                            });
                                                            if (!amount) {
                                                                amount = 0;
                                                            }
                                                            return res.json(ReturnSuccess(2000, { 'mem_balance': response[0].mem_balance, 'OutStand' : amount.toString() }));
                                                        }).catch(err => {
                                                            return res.json(ReturnSuccess(2007, err));
                                                        })

                                                    } catch (err) {
                                                        console.log('Promise err: ' + error);
                                                        return res.json(ReturnErr(err));
                                                    }

                                                } else {
                                                    apilog("find brand list (Code:2009): No Data.");
                                                    return res.json(ReturnSuccess(2009, "No Data"));

                                                }
                                            }
                                        ).catch(
                                            function (err) {
                                                apiErrorlog("find brand list error 2001", err);
                                                return res.json(ReturnErr(err));
                                            }
                                        );
                                    }
                                ).catch(
                                    function (err) {
                                        apiErrorlog("find agent_code " + agent_code + " error 2001", err);
                                        return res.json(ReturnErr(err));
                                    }
                                );
                                /* apilog("find brand list (Code:2009): No Data.");
                                return res.json(ReturnSuccess(2009, "No Data")); */
                            }
                        }
                    ).catch(
                        function (err) {
                            apiErrorlog("find brand list error 2001 :: ", err);
                            //return [err];
                            return res.json(ReturnErr(err));
                        }
                    );
                }
            ).catch(
                function (err) {
                    apiErrorlog("Get Balance member id " + mem_username + " error 2001", err);
                    return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get balance member id: " + sId }));
                }
            );
        } else {
            apilog("Get Balance id error 2002 : No request params value.");
            return res.json(ReturnUnSuccess(2002, { message: "No request params value." }));
        }

    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }
});

route.post("/CreateUser/:agent_code/:hash", async (req, res) => {
    console.log('body::==', req.body);
    console.log('params::==', req.params);
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    const check_authen = await webAuthen(agent_code, "CreateUser", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);
    if (check_authen == 1) {
        //return res.json(ReturnSuccess(2000, { message: "Success" }));
        if (member) {
            console.log(agent_code);
            console.log(member.agent_code);
            if (member.agent_code == agent_code) {
                apilog('Post create member mem_date_add : ' + member.mem_date_add);
                await tb_agent.find({ agent_code: member.agent_code }).then(
                    function (result) {
                        apiDebuglog("find agent " + member.agent_code + " successfully", result);
                        if (result.length > 0) {
                            tb_member_runno.find({ agent_code: member.agent_code }).then(
                                function (result) {
                                    apiDebuglog("find memberRunno id " + 1 + " successfully", result);
                                    if (result.length > 0) {
                                        apilog("have agent runner");
                                        var tz = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
                                        member.mem_date_add = tz;
                                        apiDebuglog('result.running_number' + result[0].running_number);
                                        const num = result[0].running_number + 1;
                                        const uId = result[0]._id
                                        var num_str = num.toString();
                                        var tmp = '';
                                        if (num_str.length < 6) {
                                            var i;
                                            for (i = 0; i < 6 - num_str.length; i++) {
                                                tmp = tmp + '0';
                                            }
                                        }
                                        const memberRunno = { running_number: num };
                                        member.mem_username = member.agent_code + tmp + num_str;
                                        member.mem_password = sha256Encrypt(member.agent_code + tmp + num_str).substring(0, 8);
                                        member.register_type = "api";

                                        //console.log('member : ' + member);
                                        //return res.json(ReturnSuccess(2000, member));

                                        const Member = new tb_member(member);
                                        Member.save().then(
                                            function (result2) {
                                                apiDebuglog("member save successfully", result);
                                                const id = result2._id;
                                                tb_member_runno.findByIdAndUpdate(uId, { $set: memberRunno }).then(
                                                    function (result) {
                                                        apiDebuglog("memberRunno update id " + uId + " successfully", result);
                                                        return res.json(ReturnSuccess(2000, result2));
                                                    }
                                                ).catch(
                                                    function (err) {
                                                        //console.log("agent user update error 2001 : " + err);
                                                        apiErrorlog("memberRunno update id " + uId + " error 2001", err);
                                                        //return res.json(ReturnErr(err));
                                                        return res.json(ReturnUnSuccess(20014, { message: "Unsuccess for update memberRunno id: " + uId }));
                                                    }
                                                );

                                            }
                                        ).catch(
                                            function (err) {
                                                apiErrorlog("member save error 2001", err);
                                                //return res.json(ReturnErr(err));
                                                return res.json(ReturnUnSuccess(20013, { message: "Unsuccess register member" }));
                                            }
                                        );
                                    } else {
                                        apilog("don't have agent runner");
                                        const memberRunno = { agent_code: member.agent_code, running_number: 0 };
                                        const MemberRunno = new tb_member_runno(memberRunno);
                                        MemberRunno.save().then(
                                            function (result) {
                                                apiDebuglog("memberRunno save successfully", result);
                                                //return res.json(ReturnSuccess(2000, { id: result }));
                                                var tz = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
                                                member.mem_date_add = tz;
                                                apiDebuglog('result.running_number' + result.running_number);
                                                const num = result.running_number + 1;
                                                const uId = result._id
                                                var num_str = num.toString();
                                                var tmp = '';
                                                if (num_str.length < 6) {
                                                    var i;
                                                    for (i = 0; i < 6 - num_str.length; i++) {
                                                        tmp = tmp + '0';
                                                    }
                                                }
                                                const memberRunno = { running_number: num };
                                                member.mem_username = member.agent_code + tmp + num_str;
                                                member.mem_password = sha256Encrypt(member.agent_code + tmp + num_str).substring(0, 8);
                                                member.register_type = "api";
                                                //console.log('member : ' + member);
                                                //return res.json(ReturnSuccess(2000, member));

                                                const Member = new tb_member(member);
                                                Member.save().then(
                                                    function (result2) {
                                                        apiDebuglog("member save successfully", result);
                                                        const id = result2._id;
                                                        tb_member_runno.findByIdAndUpdate(uId, { $set: memberRunno }).then(
                                                            function (result) {
                                                                apiDebuglog("memberRunno update id " + uId + " successfully", result);
                                                                return res.json(ReturnSuccess(2000, result2));
                                                            }
                                                        ).catch(
                                                            function (err) {
                                                                //console.log("agent user update error 2001 : " + err);
                                                                apiErrorlog("memberRunno update id " + uId + " error 2001", err);
                                                                //return res.json(ReturnErr(err));
                                                                return res.json(ReturnUnSuccess(20014, { message: "Unsuccess for update memberRunno id: " + uId }));
                                                            }
                                                        );

                                                    }
                                                ).catch(
                                                    function (err) {
                                                        apiErrorlog("member save error 2001", err);
                                                        //return res.json(ReturnErr(err));
                                                        return res.json(ReturnUnSuccess(20013, { message: "Unsuccess register member" }));
                                                    }
                                                );
                                            }
                                        ).catch(
                                            function (err) {
                                                apiErrorlog("memberRunno save error 2001", err);
                                                //return res.json(ReturnErr(err));
                                                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for add memberRunno." }));
                                            }
                                        );
                                    }

                                }
                            ).catch(
                                function (err) {
                                    apiErrorlog("find memberRunno id " + uId + " error 2001", err);
                                    //return res.json(ReturnErr(err));
                                    return res.json(ReturnUnSuccess(20012, { message: "Unsuccess for register member " }));
                                }
                            );
                        } else {
                            return res.json(ReturnUnSuccess(20011, { message: "Unsuccess for register member " }));
                        }
                    }

                ).catch(
                    function (err) {
                        apiErrorlog("find agent error 2001", err);
                        return res.json(ReturnUnSuccess(2001, { message: "con not find agent code " + member.agent_code + " in system." }));
                    }
                );
            } else {
                return res.json(ReturnUnSuccess(20010, { message: "Unsuccess Please check agent Code" }));
            }


        } else {
            apilog("member save error 2002 : No request body value.");
            return res.json(ReturnUnSuccess(2002, "No request body value."));
        }
    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }
});

route.get("/info/:mem_username/:agent_code/:hash", async (req, res) => {
    apilog('Get info by id');
    apilog('params::==' + req.params);

    const sId = req.params.mem_username
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    const check_authen = await webAuthen(agent_code, "info", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);
    if (check_authen == 1) {
        if (sId) {
            await tb_member.find({ mem_username: sId, agent_code: agent_code }).then(
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

    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }
    //const sId = req.params.id    
});

/* route.get("/getBalance/:mem_username/:agent_code/:hash", async (req, res) => {
    apilog('Get Balance by id');
    apilog('params::==' + req.params);
    const sId = req.params.mem_username
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    const check_authen = await webAuthen(agent_code, "getBalance", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);
    if (check_authen == 1) {
        if (sId) {
            await tb_member.find({ mem_username: sId }).then(
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
        
    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }   

}); */


route.put("/Deposit/:mem_username/:agent_code/:hash", async (req, res) => {
    apilog('Put Update member');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);

    const sId = req.params.mem_username
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    var trans_type = "api";

    const check_authen = await webAuthen(agent_code, "Deposit", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);
    if (check_authen == 1) {
        if (member && sId) {
            if (member.trans_type) {
                trans_type = member.trans_type;
            }
            await tb_member.find({ mem_username: sId }).then(
                function (result) {
                    apiDebuglog("Get info member id " + sId + " successfully", result);
                    //return res.json(ReturnSuccess(2000, result));
                    if (result.length > 0) {
                        const before_balance = result[0].mem_balance;
                        const agent_code = result[0].agent_code;
                        apilog('member.mem_balance :' + member.mem_balance);
                        apilog('before_balance :' + before_balance);
                        var balance = (parseFloat(before_balance) + parseFloat(member.mem_balance)).toString();
                        const mem_balance = { mem_balance: balance };
                        apilog('balance :' + balance);
                        tb_member.findByIdAndUpdate(result[0]._id, { $set: mem_balance }).then(
                            function (result) {
                                apiDebuglog("member " + sId + " deposit successfully", result);
                                var tz = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
                                const trans = {
                                    amount: member.mem_balance,
                                    type: "deposit",
                                    username: sId,
                                    before_balance: before_balance,
                                    after_balance: balance,
                                    agent_code: agent_code,
                                    ts: Number(new Date(tz)),
                                    tran_date_time: tz,
                                    note: member.note,
                                    user_admin: member.user_admin,
                                    tran_type: trans_type
                                };

                                const Transections = new tb_transections(trans);
                                Transections.save().then(
                                    function (result) {
                                        apiDebuglog("transections save successfully", result);
                                        return res.json(ReturnSuccess(2000, { id: result._id, mem_username: result.mem_username, before_balance: before_balance, deposit_balance: member.mem_balance, amount: balance }));
                                    }
                                ).catch(
                                    function (err) {
                                        apiErrorlog("transections save error 2001", err);
                                        //return res.json(ReturnErr(err));
                                        //return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for deposit member id: " + sId + " => add transections." }));
                                        return res.json(ReturnSuccess(2000, { id: result._id, mem_username: result.mem_username, before_balance: before_balance, deposit_balance: member.mem_balance, amount: balance }));
                                    }
                                );


                            }
                        ).catch(
                            function (err) {
                                apiErrorlog("member " + sId + " deposit  error 2001", err);
                                //return res.json(ReturnErr(err));
                                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess deposit member id: " + sId }));
                            }
                        );
                    } else {
                        return res.json(ReturnUnSuccess(2001, { message: "can not find member : " + sId + "in system." }));
                    }

                }
            ).catch(
                function (err) {
                    apiErrorlog("member " + sId + " deposit error 2001", err);
                    //return res.json(ReturnErr(err));
                    return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for member : " + sId + " deposit" }));
                }
            );

        } else {
            apilog("member deposit error 2002 : No request body & params value.");
            return res.json(ReturnSuccess(2002, "No request body & params value."));
        }

    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }
});

route.put("/WithdrawAll/:mem_username/:agent_code/:hash", async (req, res) => {
    apilog('Put Update member');
    apilog('body::==' + req.body);
    apilog('params::==' + req.params);

    const sId = req.params.mem_username
    const agent_code = req.params.agent_code;
    const hash = req.params.hash;
    const member = req.body;

    var trans_type = "api";

    const check_authen = await webAuthen(agent_code, "WithdrawAll", member, hash)
    //result value 0=false,1=true,2=missing agent_code,3=get tb_agent error,4=hash md5 error
    //console.log(check_authen);


    if (check_authen == 1) {
        if (member && sId) {
            if (member.trans_type) {
                trans_type = member.trans_type;
            }
            const mem_balance = { mem_balance: '0' };

            await tb_member.find({ mem_username: sId }).then(
                function (result) {
                    apiDebuglog("Get info member id " + sId + " successfully", result);
                    //return res.json(ReturnSuccess(2000, result));
                    if (result.length > 0) {
                        const myresult = result;
                        tb_member.findByIdAndUpdate(result[0]._id, { $set: mem_balance }).then(
                            function (result) {
                                apiDebuglog("member WithdrawAll id " + sId + " successfully", result);
                                const before_balance = myresult[0].mem_balance;
                                const balance = "0";
                                //return res.json(ReturnSuccess(2000, { id: result._id, mem_username: result.mem_username, before_balance: myresult[0].mem_balance, after_balance: "0" }));
                                var tz = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
                                const trans = {
                                    amount: mem_balance.mem_balance,
                                    type: "withdraw",
                                    username: sId,
                                    before_balance: before_balance,
                                    after_balance: balance,
                                    agent_code: agent_code,
                                    ts: Number(new Date(tz)),
                                    tran_date_time: tz,
                                    note: member.note,
                                    user_admin: member.user_admin,
                                    tran_type: trans_type
                                };

                                const Transections = new tb_transections(trans);
                                Transections.save().then(
                                    function (result) {
                                        apiDebuglog("transections save successfully", result);
                                        return res.json(ReturnSuccess(2000, { id: result._id, mem_username: result.mem_username, before_balance: myresult[0].mem_balance, after_balance: "0" }));
                                    }
                                ).catch(
                                    function (err) {
                                        apiErrorlog("transections save error 2001", err);
                                        return res.json(ReturnSuccess(2000, { id: result._id, mem_username: result.mem_username, before_balance: myresult[0].mem_balance, after_balance: "0" }));
                                    }
                                );
                            }
                        ).catch(
                            function (err) {
                                apiErrorlog("member WithdrawAll id " + sId + " error 2001", err);
                                return res.json(ReturnUnSuccess(2001, { message: "Unsuccess WithdrawAll member id: " + sId }));
                            }
                        );
                    } else {
                        return res.json(ReturnUnSuccess(2001, { message: "can not find member : " + sId + "in system." }));
                    }

                }
            ).catch(
                function (err) {
                    apiErrorlog("Get info member id " + sId + " error 2001", err);
                    //return res.json(ReturnErr(err));
                    return res.json(ReturnUnSuccess(2001, { message: "Unsuccess for get inormation member id: " + sId }));
                }
            );
        } else {
            apilog("member deposit error 2002 : No request body & params value.");
            return res.json(ReturnSuccess(2002, "No request body & params value."));
        }

    } else {
        switch (check_authen) {
            case 0:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
                break;
            case 2:
                return res.json(ReturnUnSuccess(20011, { message: "Missing agent code" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Cannot get agent in system" }));
                break;
            case 3:
                return res.json(ReturnUnSuccess(20011, { message: "Missing Hash Md5" }));
                break;
            default:
                return res.json(ReturnUnSuccess(20011, { message: "UnAutorize Hash Md5" }));
        }
    }
});

module.exports = route;