  DROP TABLE IF EXISTS signers;
  DROP TABLE IF EXISTS users;

  CREATE TABLE signers (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signature VARCHAR NOT NULL CHECK (signature != ''),
       user_id INT NOT NULL CHECK (user_id != ''),
   );

   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       email VARCHAR NOT NULL CHECK (signature != '') UNIQUE,
       password VARCHAR NOT NULL CHECK (signature != ''),
   );


   INSERT INTO signers (first, last, signature) VALUES ('Miss A', 'Antonia', 'hahahahhha');