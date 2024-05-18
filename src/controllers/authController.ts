import express from "express";
import { body, validationResult } from "express-validator";
import { create, findByEmail } from "../services/userService";
import { Pool } from "pg";
import { IUser } from "../interfaces/IUser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { trimBody } from "../guard/trim.body.middleware";

export const secret = "top secret!";

export default function authController(pool: Pool) {
  const router = express.Router();
  router.use(trimBody);

  router.post(
    "/register",
    body("email").isEmail().withMessage("Invalid email"),

    body("password")
      .matches(
        /^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/
      )
      .withMessage(
        "Password must contain 8 characters, at least one digit, and one character different from letter or digit"
      ),

    async (req, res) => {
      try {
        const errors = validationResult(req).array() as unknown as {
          path: string;
          msg: string;
        }[];
        if (errors.length > 0) {
          const errorMessage = errors
            .map((error) => `${error.path}: ${error.msg}`)
            .join("\n");
          console.log(errorMessage);
          throw new Error(errorMessage);
        }

        const existing = await findByEmail(pool, req.body.email);

        if (existing !== null && existing.email === req.body.email) {
          throw new Error("Email is taken");
        }

        const { email, firstName, lastName, password } = req.body;
        const user = await create(pool, email, firstName, lastName, password);
        const token = createToken(user);
        res.status(201).json(token);
      } catch (error) {
        console.log(error);
        res.status(400).json(error.message);
      }
    }
  );

  router.post("/login", async (req, res) => {
    try {
      const email = req.body.email;

      const user = await findByEmail(pool, email);

      if (!user || (user && user.email !== email)) {
        console.log(email);
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
