const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('request');
const AuthModel = mongoose.model('AuthModel');
const logger = require('../libs/loggerLib');
const responseLib = require('../libs/responseLib');
const token = require('../libs/tokenLib');
const check = require('../libs/checkLib');
 

let isAuthorized = (req,res,next)=>{
    if(req.params.authToken || req.query.authToken 
        || req.body.authToken || req.header('authToken')){
        AuthModel.findOne({authToken:req.header('authToken') 
        || req.params.authToken || req.query.authToken || req.body.authToken },(err,authDetails)=>{
            if(err){
              console.log(err);
              logger.error(err.message,'AuthorizationMiddleware',10);
              let response = responseLib.generateResponse(true,'Failed to Authorized',500,null);
              res.send(response);
            }else if(check.isEmpty(authDetails)){
              logger.error('No Authrizationkey is Present','AuthorizationMiddleware',10);
              let response = responseLib.generateResponse(true,'Invalid or Expired AuthorizationKey',404,null);
              res.send(response);
            }else{
                token.verifyClaim(authDetails.authToken,authDetails.tokenSecret,(err,decoded)=>{
                    if(err){
                       logger.error(err.message,'Authorization Middleware',10);
                       let response = responseLib.generateResponse(true,'Failed to Authorized',500,null);
                       res.send(response);
                    }else{
                        req.user = {userId:decoded.data.userId};
                        next();
                    }
                });
            }
        });

    }else{
        logger.error('AuthorizationToken Missing','AuthorizationMiddleware',5);
        let response = responseLib.generateResponse(true,'Authorization token is missing in req',400,null);
        res.send(response);
    }
}


module.exports = {
    isAuthorized:isAuthorized
}