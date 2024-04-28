import express from "express";
import { body, validationResult } from "express-validator";
import { create, findByEmail } from "../services/userService";
import { Pool } from "pg";
import { IUser } from "../interfaces/IUser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const secret = "top secret!";

export default function authController(pool: Pool) {
  const router = express.Router();

  router.post(
    "/register",
    body("email").isEmail().withMessage("Invalid email"),

    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),

    async (req, res) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw errors;
        }
      } catch (error) {
        res.status(400).json(error.message);
      }
      try {
        const existing = await findByEmail(pool, req.body.email);

        if (existing !== null && existing.email === req.body.email) {
          throw new Error("Email is taken");
        }

        try {
          const { email, firstName, lastName, password } = req.body;
          const user = await create(pool, email, firstName, lastName, password);
          const token = createToken(user);
          res.status(201).json(token);
        } catch (err) {
          console.log(err);
          res.status(400).json(err.message);
        }
      } catch (err) {
        console.log(err);
        res.status(400).json(err.message);
      }
    }
  );

  router.post("/login", async (req, res) => {
    try {
      const email = req.body.email;

      const user = await findByEmail(pool, req.body.email);
      
      if (!user || (user && user.email !== req.body.email)) {
        console.log(req.body.email);
        throw new Error("Incorrect email or password");
      }

      const match = await bcrypt.compare(
        req.body.password,
        user.hashedPassword
      );

      if (!match) {
        throw new Error("Incorrect email or password");
      }

      const token = createToken(user);

      res.status(200).json(token);
    } catch (err) {
      console.log(err.message);
      res.status(401).json(err.message);
    }
  });

  return router;
}

function createToken(user: IUser) {
  const payload = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return {
    accessToken: jwt.sign(payload, secret),
  };
}
