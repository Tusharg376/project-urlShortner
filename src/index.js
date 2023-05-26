const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config()
mongoose.set("strictQuery",true)
const route = require("./routes/route")
const cors = require('cors')
app.use(express.json());

app.use((err, req, res, next) => {
    if (err.message === "Unexpected end of JSON input") {
      return res.status(400).send({status: false,message: "ERROR Parsing Data, Please Provide a Valid JSON",
        });
    } else {
      next();
    }
  });

app.use(cors({origin:"*"}))

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser : true
})
.then(()=> console.log("DB is connected"))
.catch(err=> console.log(err.message))

app.use('/',route);

app.listen(process.env.PORT, function(){
    console.log("Server online on port 3001")
})

