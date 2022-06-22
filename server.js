const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");

const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `I'm always angry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: false }));

// development aid middleware
app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

// /register route

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {});

// /login route

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {});

// /petition route

app.get("/petition", (req, res) => {
    if (req.session.signedPetition) {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            title: "Petition",
        });
    }
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.fName, req.body.lName, req.body.signature)
        .then((result) => {
            db.getSignatures();

            //id key from object inside an array x[0].id

            req.session.signatureId = result.rows[0].id;
            req.session.signedPetition = true;
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            console.log("error in db.add actor ", err);
            res.render("petition", {
                title: "Petition",
                error: true,
            });
        });
});

//  petition/thanks route

app.get("/petition/thanks", (req, res) => {
    if (req.session.signedPetition) {
        //get signature, then amount of signers, then render

        db.displaySignature(req.session.signatureId).then((result) => {
            const sendResults = result.rows[0];
            db.countSigners().then((result) => {
                const count = result.rows[0].count;

                res.render("thanks", {
                    title: "Thanks",
                    sendResults,
                    count,
                });
            });
        });
    } else {
        res.redirect("/petition");
    }
});

// /petition/signers route

app.get("/petition/signers", (req, res) => {
    if (req.session.signedPetition) {
        db.getSignatures()
            .then((result) => {
                const sendResults = result.rows;

                res.render("signers", {
                    title: "Signers",
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

// /logout route (resetting cookies)

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/petition");
});

app.listen(8080, () => {
    console.log("Server listening on port 8080.");
});
