  DROP TABLE IF EXISTS signers;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS profiles;


   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       email VARCHAR NOT NULL CHECK (email != '') UNIQUE,
       password VARCHAR NOT NULL CHECK (password != '')
   );

   CREATE TABLE signers (
       id SERIAL PRIMARY KEY,
       signature VARCHAR NOT NULL CHECK (signature != ''),
       user_id INT NOT NULL REFERENCES users(id) UNIQUE   
   );

   CREATE TABLE profiles (
       id SERIAL PRIMARY KEY,
       age INT,
       city VARCHAR,
       url VARCHAR,
       user_id INT NOT NULL REFERENCES users(id) UNIQUE
   );


