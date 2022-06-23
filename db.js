const spicedPg = require("spiced-pg");
//below we have information that we need for our db connection
//which db do we talk to?
const database = "petition";

//which user is running our queries in the db?
const username = "postgres";

////whats the user's passwors?
const password = "postgres";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

// signature queries

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.addSignature = (signature, userId) => {
    const q = `INSERT INTO signers(signature, user_id) VALUES ($1, $2)
    RETURNING id`;
    const param = [signature, userId];
    return db.query(q, param);
};

module.exports.displaySignature = (id) => {
    return db.query(`SELECT * FROM signers WHERE id = $1`, [id]);
};

module.exports.countSigners = () => {
    return db.query(`SELECT COUNT (*) FROM signers`);
};

// user queries

module.exports.addUser = (firstName, lastName, email, password) => {
    const q = `INSERT INTO users(first, last, email, password) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [firstName, lastName, email, password];
    return db.query(q, param);
};

module.exports.matchEmail = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

// profiles queries

module.exports.addProfile = (age, city, url, userId) => {
    const q = `INSERT INTO profiles(age, city, url, user_id) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [age, city, url, userId];
    return db.query(q, param);
};

//SELECT users.*, signatures.id AS "signatureID"
//FROM users
// JOIN signatures
//ON signatures.user_id = users.id
// WHERE email = $1
