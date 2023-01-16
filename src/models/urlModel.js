const { Schema , model } = require("mongoose");
const shortId = require("shortid");


const urlSchema = new Schema({
    urlCode: {
        type: String,
        require: true,
        unique: true
    },
    longUrl: {
        type: String, // valid url
        require: true
    },
    shortUrl: {
        type: String,
        require: true,
        unique: true
    }
}, {timestamps:true});

module.exports = model("shortUrl", urlSchema)