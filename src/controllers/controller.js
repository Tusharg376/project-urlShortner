const model = require("../models/urlModel");

const axios = require("axios");

const isValidUrl = require('url-validation')

const shortId = require("shortid");

const redis = require('redis');

const { promisify } = require('util');

const redisClient = redis.createClient(

    16948,

    'redis-16948.c305.ap-south-1-1.ec2.cloud.redislabs.com',

    { no_ready_check: true }

);

redisClient.auth(

    '6DLOlO0DrbeI2rubVd34Ipg74aQeXhdj',

    function (err) {

        if (err) throw err;

    }

);

redisClient.on("connect", async function () {

    console.log("Connected to Redis..");

});

const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);


const createUrl = async function (req, res) {

    try {

        let data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter valid URL" });

        data.longUrl = data.longUrl.trim();

        if (Object.values(data) == "") return res.status(400).send({ status: false, message: "Entry field is empty" });

        let alreadyCreated = await GET_ASYNC(data.longUrl);

        if (alreadyCreated) {

            return res.status(200).send({ status: true, data: JSON.parse(alreadyCreated) });

        }

        if (!isValidUrl(data.longUrl)) return res.status(400).send({ status: false, message: "invalid URL" });

        const uniqueUrl = await model.findOne(data).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

        if (uniqueUrl) {

            await SETEX_ASYNC(data.longUrl, 86400, JSON.stringify(uniqueUrl));

            return res.status(200).send({ status: true, data: uniqueUrl })

        }

        let genuineUrl = await axios.get(data.longUrl)

            .then(() => data.longUrl)

            .catch((err) => null)

        if (!genuineUrl) return res.status(404).send({ status: false, message: "Page not found" })

        data.urlCode = shortId.generate();

        data.urlCode = data.urlCode.toLowerCase().trim()

        data.shortUrl = `localhost:3000/${data.urlCode}`

        const shorterUrl = await model.create(data);

        let { urlCode, longUrl, shortUrl } = shorterUrl

        await SETEX_ASYNC(`${data.longUrl}`, 86400, JSON.stringify( { urlCode, longUrl, shortUrl } ))

        res.status(201).send({ status: true, data: { urlCode, longUrl, shortUrl } });

    } catch (err) {

        res.status(500).send({ status: false, message: err.message });

    }

}


const getUrl = async function (req, res) {

    try {
        let url = req.params.urlCode.trim().toLowerCase();

        let validUrlCode = shortId.isValid(url);

        if (!validUrlCode) return res.status(400).send({ status: false, message: "invalid urlCode" })

        let alreadyCreated = await GET_ASYNC(url);

        if (alreadyCreated) {

            let redirectUrl = alreadyCreated.replaceAll('"', '')

            return res.status(302).redirect(redirectUrl)

        }

        const longUrl = await model.findOne({ urlCode: url });

        if (!longUrl) return res.status(404).send({ status: false, message: "URL not found" });

        await SETEX_ASYNC(`${url}`, 86400, JSON.stringify(longUrl.longUrl));

        return res.status(302).redirect(longUrl.longUrl)

    } catch (err) {

        res.status(500).send({ status: false, message: err.message })

    }

}

module.exports.createUrl = createUrl;

module.exports.getUrl = getUrl;