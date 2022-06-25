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

// signers queries

module.exports.getSignatures = () => {
    return db.query(`SELECT users.*, signers.id AS signers_id, profiles.age AS age, profiles.city AS city, profiles.url AS url
        FROM users
        JOIN signers
        ON users.id = signers.user_id
        LEFT JOIN profiles
        ON users.id = profiles.user_id`);
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, signers.id, profiles.age, profiles.url
        FROM users
        JOIN signers
        ON users.id = signers.user_id
        LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
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

module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signers WHERE id = $1`, [id]);
};

// user queries

module.exports.addUser = (firstName, lastName, email, password) => {
    const q = `INSERT INTO users(first, last, email, password) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [firstName, lastName, email, password];
    return db.query(q, param);
};

module.exports.matchEmail = (email) => {
    return db.query(
        `SELECT users.*, signers.id AS signers_id 
    FROM users
    LEFT JOIN signers
    ON users.id = signers.user_id
    WHERE email = $1`,
        [email]
    );
};

//get user's first name
module.exports.appeal = (id) => {
    return db.query(
        `SELECT first 
    FROM users 
    WHERE id = $1`,
        [id]
    );
};

// deleting user account (dependent tables must be deleted first)

module.exports.deleteSigners = (UserId) => {
    return db.query(`DELETE FROM signers WHERE user_id = $1`, [UserId]);
};
module.exports.deleteProfiles = (UserId) => {
    return db.query(`DELETE FROM profiles WHERE user_id = $1`, [UserId]);
};

module.exports.deleteUsers = (id) => {
    return db.query(`DELETE FROM users WHERE id = $1`, [id]);
};

// profiles queries

module.exports.addProfile = (age, city, url, userId) => {
    const q = `INSERT INTO profiles(age, city, url, user_id) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [age || null, city || null, url || null, userId];
    return db.query(q, param);
};

// profile edit queries
//get users complete profile:

module.exports.completeProfile = (userId) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.email, users.password, profiles.age, profiles.city, profiles.url, profiles.user_id
        FROM users
        LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE users.id = $1
     `,
        [userId]
    );
};

//UPSERT profiles table
module.exports.updateUser = (name, surname, email, userId) => {
    const q = `UPDATE users
    SET name = $1, surname = $2, email = $3  
    WHERE id = $4`;

    // RETURNING all
    const param = [name, surname, email, userId];
    return db.query(q, param);
};

module.exports.updateReqParams = (
    firstName,
    lastName,
    email,
    password,
    userId
) => {
    const q = `UPDATE users
    SET first = $1, last = $2, email = $3, password = $4
    WHERE id = $5`;

    const param = [firstName, lastName, email, password, userId];
    return db.query(q, param);
};

module.exports.updateReqParamsNoPass = (firstName, lastName, email, userId) => {
    const q = `UPDATE users
    SET first = $1, last = $2, email = $3
    WHERE id = $4`;

    const param = [firstName, lastName, email, userId];
    return db.query(q, param);
};

module.exports.updateOptParams = (user_id, age, city, url) => {
    const q = ` INSERT INTO profiles (user_id, age, city, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age=$2, city=$3, url=$4`;
    const param = [user_id, age || null, city || null, url || null];

    return db.query(q, param);
};
