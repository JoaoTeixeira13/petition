const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
const { registerRedirection } = require("./registerRedirection");
const { urlVerification } = require("./urlVerification");

const { engine } = require("express-handlebars");

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//heroku https

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

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

// unassigned / route

app.get("/", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    } else if (req.session.signatureId) {
        return res.redirect("/petition/thanks");
    } else {
        return res.redirect("/petition");
    }
});

// /register route

app.get("/register", (req, res) => {
    //handle an already signed / register user
    if (req.session.signatureId) {
        return res.redirect("/petition/thanks");
    } else if (req.session.userId) {
        return res.redirect("/petition");
    }

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
                    req.body.fName.replace(/\s\s+/g, " ").trim(),
                    req.body.lName.replace(/\s\s+/g, " ").trim(),
                    req.body.email.trim(),
                    hashedPassword
                )
                .then((result) => {
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

    db.appeal(req.session.userId)
        .then((result) => {
            const userName = result.rows[0];

            res.render("profile", {
                title: "Profile",
                userName,
            });
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

app.post("/profile", (req, res) => {
    if (req.body.age === "" && req.body.city === "" && req.body.url === "") {
        return res.redirect("/petition");
    } else {

        req.body.url = urlVerification(req.body.url);

        db.addProfile(
            req.body.age,
            req.body.city.replace(/\s\s+/g, " ").trim(),
            req.body.url,
            req.session.userId
        )
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in db.add profile ", err);
                res.render("profile", {
                    title: "Profile",
                    error: true,
                });
            });
    }
});

// /profile/edit route

app.get("/profile/edit", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    db.completeProfile(req.session.userId)
        .then((result) => {
            const profile = result.rows[0];

            res.render("profileEdit", {
                title: "Profile Edit",
                profile,
            });
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

app.post("/profile/edit", (req, res) => {
    if (req.body.password === "") {
        db.updateReqParamsNoPass(
            req.body.fName.replace(/\s\s+/g, " ").trim(),
            req.body.lName.replace(/\s\s+/g, " ").trim(),
            req.body.email.trim(),
            req.session.userId
        )
            .then(() => {
                req.body.url = urlVerification(req.body.url);

                db.updateOptParams(
                    req.session.userId,
                    req.body.age,
                    req.body.city.replace(/\s\s+/g, " ").trim(),
                    req.body.url
                )
                    .then(() => {
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        console.log("error is ", err);
                    });
            })
            .catch((err) => {
                console.log("error in db. editing profile ", err);
            });
    } else {
        bcrypt
            .hash(req.body.password)
            .then(function (hash) {
                const hashedPassword = hash;

                return db
                    .updateReqParams(
                        req.body.fName.replace(/\s\s+/g, " ").trim(),
                        req.body.lName.replace(/\s\s+/g, " ").trim(),
                        req.body.email.trim(),
                        hashedPassword,
                        req.session.userId
                    )
                    .then(() => {
                        req.body.url = urlVerification(req.body.url);

                        db.updateOptParams(
                            req.session.userId,
                            req.body.age,
                            req.body.city.replace(/\s\s+/g, " ").trim(),
                            req.body.url
                        );

                        res.redirect("/petition");
                    });
            })
            .catch((err) => {
                console.log("error in db.add actor ", err);
            });
    }
});

// /login route

app.get("/login", (req, res) => {
    //handle an already signed / register user

    if (req.session.signatureId) {
        return res.redirect("/petition/thanks");
    } else if (req.session.userId) {
        return res.redirect("/petition");
    }
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

                        //is the user also signed?
                        if (result.rows[0].signers_id) {
                            req.session.signatureId = result.rows[0].signers_id;
                            return res.redirect("/petition/thanks");
                        } else {
                            res.redirect("/petition");
                        }
                    } else {
                        res.render("login", {
                            title: "Login",
                            error: true,
                        });
                    }
                });
        })
        .catch((err) => {
            console.log("error in db. loging user in ", err);
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

    if (req.session.signatureId) {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            title: "Petition",
        });
    }
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.signature, req.session.userId)
        .then((result) => {
            db.getSignatures();

            //id key from object inside an array x[0].id

            req.session.signatureId = result.rows[0].id;
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

    if (req.session.signatureId) {
        //get signature, then amount of signers, then render

        db.displaySignature(req.session.signatureId).then((result) => {
            const sendResults = result.rows[0];
            db.countSigners()
                .then((result) => {
                    const count = result.rows[0].count;

                    db.appeal(req.session.userId)
                        .then((result) => {
                            const userName = result.rows[0];

                            res.render("thanks", {
                                title: "Thanks",
                                sendResults,
                                count,
                                userName,
                            });
                        })
                        .catch((err) => {
                            console.log("error is ", err);
                        });
                })
                .catch((err) => {
                    console.log("error is ", err);
                });
        });
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition/thanks", (req, res) => {
    db.deleteSignature(req.session.signatureId)
        .then(() => {
            req.session.signatureId = null;

            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

// /petition/signers route

app.get("/petition/signers", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }

    if (req.session.signatureId) {
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

// /petition/signers/:city

app.get("/petition/signers/:city", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }

    if (req.session.signatureId) {
        db.getSignersByCity(req.params.city)
            .then((result) => {
                const sendResults = result.rows;

                res.render("signers", {
                    title: "Signers",
                    sendResults,
                    city: req.params.city,
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

// /profile/delete route

app.get("/profile/delete", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    db.appeal(req.session.userId)
        .then((result) => {
            const userName = result.rows[0];
            res.render("delete", {
                title: "Delete",
                userName,
            });
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

app.post("/profile/delete", (req, res) => {
    Promise.all([
        db.deleteSigners(req.session.userId),
        db.deleteProfiles(req.session.userId),
    ])
        .then(() => {
            db.deleteUsers(req.session.userId);
            req.session = null;
            res.redirect("/register");
        })
        .catch((err) => {
            console.log("error is ", err);
        });
});

//Port listening

app.listen(process.env.PORT || 8080, () => {
    console.log("Server listening...");
});
