const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
const { registerRedirection } = require("./registerRedirection");

const { engine } = require("express-handlebars");

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
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
    res.render("register", {
        title: "Register",
    });
});

app.post("/register", (req, res) => {
    bcrypt
        .hash(req.body.password)
        .then(function (hash) {
            const hashedPassword = hash;

            // db.add user must be returned in order to be handled in the catch

            return db
                .addUser(
                    req.body.fName,
                    req.body.lName,
                    req.body.email,
                    hashedPassword
                )
                .then((result) => {
                    console.log("Inside addUser");
                    req.session.userId = result.rows[0].id;
                    res.redirect("/profile");
                });
        })
        .catch((err) => {
            console.log("error in db.add actor ", err);
            res.render("register", {
                title: "Register",
                error: true,
            });
        });
});

// /profile route

app.get("/profile", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    res.render("profile", {
        title: "Profile",
    });
});

// /login route

app.get("/login", (req, res) => {
    res.render("login", {
        title: "Login",
    });
});

app.post("/login", (req, res) => {
    db.matchEmail(req.body.email)
        .then((result) => {
            return bcrypt
                .compare(req.body.password, result.rows[0].password)
                .then(function (hashComparison) {
                    if (hashComparison) {
                        req.session.userId = result.rows[0].id;
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            title: "Login",
                            error: true,
                        });
                    }
                });
        })
        .catch((err) => {
            console.log("error in db.add actor ", err);
            res.render("login", {
                title: "Login",
                error: true,
            });
        });
});

// /petition route

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }

    if (req.session.signedPetition) {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            title: "Petition",
        });
    }
});

app.post("/petition", (req, res) => {
    db.addSignature(
        req.body.fName,
        req.body.lName,
        req.body.signature,
        req.session.userId
    )
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
    if (!req.session.userId) {
        return res.redirect("/register");
    }

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
    if (!req.session.userId) {
        return res.redirect("/register");
    }

    // registerRedirection(req, res);

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
    res.redirect("/register");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server listening...");
});
