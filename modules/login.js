const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
// const mysql = require('mysql2');
const joi = require('joi');
const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'publicproject',
    },
  });
const newUserObj = joi.object({
    fullname: joi.string().required(),
    email: joi.string().email().required(),
    username: joi.string().min(5).max(50).required(),
    password: joi.string().min(5).max(50).required()
})
const loginObj = joi.object({
    username: joi.string().min(5).max(50).required(),
    password: joi.string().min(5).max(50).required()
})
//get Single Record
router.get('/', async (req, res) => {
    let receivedObj = req.body;
    try{
        let validate = loginObj.validate(receivedObj);
        if(validate.error){
            res.send({msg: validate.error.message}); 
        }else{
            let result = await getObj(receivedObj);
            if(result.msg.id){
                jwt.sign(result, process.env.SECRETKEY, (err, token) => {
                    if(!err) res.send({token});
                });                
            } 
        }
    }catch (err){
        res.send(err);
    }
});
const getObj = (receivedObj) => {
    return new Promise(async (resolve, reject) => {
        let {username, password} = receivedObj;
        try{
            let result = await knex('users').where('username', username);
            if(result[0]){
                result[0].passcode == password ? 
                resolve({msg: result[0]}) : 
                reject({msg: 'Password is not matching..'});
            }else{
                reject({msg: 'User not found..'});
            }
        }catch (err){
            reject({msg: err});
        }
    })
}
//get all Records
//put Record
//post Record
router.post('/', async(req, res) => {
    let receivedObj = req.body;
    try{
        let validate = newUserObj.validate(receivedObj);
        if(validate.error){
            res.send({msg: validate.error.message});
        }else{
            let result = await insertObj(receivedObj);
            if(result.msg == 'Row Created') res.send(result);
        }
    }catch (e){
        res.send(e);
    }
});

const insertObj = (receivedObj) => {
    return new Promise(async(resolve, reject) => {
        let {fullname, email, username, password} = receivedObj;
        try{
            let result = await knex('users').insert({fullname: fullname, email: email,
            username: username, passcode: password});
            if(result[0] > 0){
                resolve({msg: 'Row Created'});
            }else{
                reject({msg: 'Row Not Created'});
            }
        }catch (err){
            reject({msg: err.sqlMessage});
        }
    })
}


//delete Record

module.exports = router;

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
        //throw createError.InternalServerError()
    }
}