const express = require("express");
const app = express();
const db = require("./db");

const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: false }));

//
app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

app.get("/petition", (req, res) => {
    if (req.session.signedPetition) {
        res.redirect("/petition/thanks");
    } else {
        console.log("No cookies found here. Be gone.");
        res.render("petition");
    }
});

//

app.get("/petition/thanks", (req, res) => {
    if (req.session.signedPetition) {
        console.log("thanks session signature is,", req.session.signatureId);

        //get signature, then amount of rows

        db.displaySignature(req.session.signatureId).then((result) => {
            // const count = db.countSigners();
            // console.log("count is ", count);
            const sendResults = result.rows[0];
            db.countSigners().then((result) => {
                console.log(
                    "result from Count singers is ",
                    result.rows[0].count
                );
                const count = result.rows[0].count;

                res.render("thanks", {
                    title: "thanks",
                    sendResults,
                    count,
                });
            });
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/petition/signers", (req, res) => {
    console.log("running GET/ signers");
    // console.log("requested body is ", req.body);

    if (req.session.signedPetition) {
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
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition", (req, res) => {
    console.log("running POST /petition");
    console.log("requested body is ", req.body);
    db.addSignature(req.body.fName, req.body.lName, req.body.signature)
        .then((result) => {
            db.getSignatures();
            console.log("yay it worked");
            console.log("session status before signature: ", req.session);

            //id key from object inside an array x[0].id

            req.session.signatureId = result.rows[0].id;
            req.session.signedPetition = true;
            console.log("session status after signature: ", req.session);
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

app.get("/logout", (req, res) => {
    console.log(
        "cookies about to be erased, session before erasing: ",
        req.session
    );
    req.session = null;
    console.log("cookies after erasure, ", req.session);
    res.redirect("/petition");
});

app.listen(8080, () => {
    console.log("Server listening on port 8080.");
});
