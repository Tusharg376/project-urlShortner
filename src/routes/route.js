const express = require("express");
const router = express.Router()
const controller = require("../controllers/controller");



router.post('/url/shorten',controller.createUrl)


router.get('/:urlCode',controller.getUrl)


router.all('/*',function(req,res){
    res.status(400).send({status:false,message:"Invalid URL"}) 
})






module.exports = router;