export const tableUsers = `CREATE TABLE IF NOT EXISTS users (
    "_id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(45) NOT NULL,
    "firstName" VARCHAR(45) NOT NULL,
    "lastName" VARCHAR(45) NOT NULL,
    "hashedPassword" VARCHAR(85) NOT NULL,          
    PRIMARY KEY (_id)
    );`


export const tableNotes =`CREATE TABLE  IF NOT EXISTS notes (
    "_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "createdAt" VARCHAR(45) NULL DEFAULT NULL,
    "editedAt" VARCHAR(45) NULL DEFAULT NULL,
    "completed" BOOLEAN NULL DEFAULT FALSE,
    "completedAt" VARCHAR(45) NULL DEFAULT NULL,
    "_ownerId" VARCHAR(36) NOT NULL,
    PRIMARY KEY (_id));`