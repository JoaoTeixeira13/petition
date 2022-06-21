const express = require("express");
const app = express();
const db = require("./db");

const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");


const cookieSession = require("cookie-session");

app.use(cookieSession({
    secret:`I'm always angry`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
}))

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: false }));

//

app.get("/petition", (req, res) => {
    res.render("petition");
});

//

app.get("/petition/thanks", (req, res) => {
    res.render("thanks");
});

app.get("/petition/signers", (req, res) => {
    console.log("running GET/ signers");
    // console.log("requested body is ", req.body);
    db.getSignatures()
        .then((result) => {
            // console.log("result object is ", result);
            // console.log("result from getSignatures:", result.rows);
            const sendResults = result.rows;

            res.render("signers", {
                title: "signers",
                sendResults,
            });
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

app.post("/petition", (req, res) => {
    console.log("running POST /petition");
    console.log("requested body is ", req.body);
    db.addSignature(req.body.fName, req.body.lName, req.body.signature)
        .then(() => {
            db.getSignatures();
            console.log("yay it worked");
            // res.render("thanks");
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            console.log("error in db.add actor ", err);
            res.render("petition", {
                title: "petition",
                error: true,
            });
        });
});

app.listen(8080, () => {
    console.log("Server listening on port 8080.");
});
