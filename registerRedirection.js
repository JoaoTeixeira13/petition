// redirect module -- asynchronous

module.exports.registerRedirection = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
};
