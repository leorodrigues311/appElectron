<<<<<<< HEAD
const express = require("express")
const app = express()



app.set("view engine", "ejs")

app.get("/", (req, res) => {
        console.log("olá")
        res.render("index")

})

=======
const express = require("express")
const app = express()



app.set("view engine", "ejs")

app.get("/", (req, res) => {
        console.log("olá")
        res.render("index")

})

>>>>>>> ba342149c0495e68cccbde4e8d65f3dc0d1d993c
app.listen(3000)