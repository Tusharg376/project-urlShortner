const model = require("../models/urlModel");

const isValidUrl = require("url-validation");

const shortId = require("shortid");


const createUrl = async function (req, res) {
    try {

        let data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter URL" });

        if (!isValidUrl(data.url)) return res.status(400).send({ status: false, message: "invalid URL" });

        const uniqueUrl = await model.findOne({ longUrl: data.url });

        if (uniqueUrl) return res.status(200).send({ status: true, data: uniqueUrl });

        data.longUrl = data.url;

        data.urlCode = shortId.generate();

        data.shortUrl = `localhost:3000/${data.urlCode}`

        const shorterUrl = await model.create(data);

        res.status(201).send({ status: true, data: shorterUrl });

    } catch (err) {

        res.status(500).send({ status: false, message: err.message });

    }

}


const getUrl = async function (req, res) {
    try {
        const url = req.params.urlCode

        let validUrlCode = shortId.isValid(url);
        if(!validUrlCode) return res.status(400).send({status:false,message:"invalid urlCode"})

        const longUrl = await model.findOne({ urlCode: url });

        if (!longUrl) return res.status(404).send({ status: false, message: "URL not found" });

        return res.status(302).redirect(longUrl.longUrl) // 302 for found

    } catch (err) {

        res.status(500).send({ status: false, message: err.message })

    }

}


module.exports.createUrl = createUrl;

module.exports.getUrl = getUrl;