const model = require("../models/urlModel");

const isValidUrl = require("url-validation");

const shortId = require("shortid");


const createUrl = async function (req, res) {
    try {

        let data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter URL" });

        //data = data.longUrl.trim();

        if(Object.values(data)=="") return res.status(400).send({ status: false, message: "please enter URL" });

        if (!isValidUrl(data.longUrl)) return res.status(400).send({ status: false, message: "invalid URL" });

        const uniqueUrl = await model.findOne(data).select({_id:0,__v:0,createdAt:0,updatedAt:0});

        if (uniqueUrl) return res.status(200).send({ status: true, data: uniqueUrl });

        data.urlCode = shortId.generate();

        data.urlCode = data.urlCode.toLowerCase().trim()

        data.shortUrl = `localhost:3000/${data.urlCode}`

        const shorterUrl = await model.create(data);

        let {urlCode,longUrl,shortUrl} = shorterUrl

        res.status(201).send({ status: true, data: {urlCode,longUrl,shortUrl} });

    } catch (err) {

        res.status(500).send({ status: false, message: err.message });

    }

}


const getUrl = async function (req, res) {
    try {
        let url = req.params.urlCode;

       url =  url.trim();

        let validUrlCode = shortId.isValid(url);

        if(!validUrlCode) return res.status(400).send({status:false,message:"invalid urlCode"})

        const longUrl = await model.findOne({ urlCode: url.toLowerCase().trim() });

        if (!longUrl) return res.status(404).send({ status: false, message: "URL not found" });

        return res.status(302).redirect(longUrl.longUrl) // 302 for found

    } catch (err) {

        res.status(500).send({ status: false, message: err.message })

    }

}


module.exports.createUrl = createUrl;

module.exports.getUrl = getUrl;