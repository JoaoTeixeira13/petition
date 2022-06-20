const spicedPg = require("spiced-pg");
//below we have information that we need for our db connection
//which db do we talk to?
const database = "petition";

//which user is running our queries in the db?
const username = "postgres";

////whats the user's passwors?
const password = "postgres";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to: ", database);

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signers`);
};

module.exports.addSignature = (firstName, lastName, signature) => {
    console.log(
        "[db] first name, ",
        firstName,
        "[db] lastName",
        lastName,
        "signature",
        signature
    );
    const q = `INSERT INTO signers(first, last, signature) VALUES ($1, $2, $3)`;
    const param = [firstName, lastName, signature];
    return db.query(q, param);
};
