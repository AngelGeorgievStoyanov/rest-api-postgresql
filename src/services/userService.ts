import { Pool } from "pg";
import { IUser } from "../interfaces/IUser";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const createSql = `INSERT INTO users (
    "_id",
    "email",
    "firstName",
    "lastName",
    "hashedPassword"
  )
  VALUES ($1, $2, $3, $4, $5);`;

const selectUser = "SELECT * FROM users WHERE email = $1;";

export async function findByEmail(pool: Pool, email: string): Promise<IUser> {
  return new Promise((resolve, reject) => {
    pool.query(selectUser, [email], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      if (result.rows.length === 1) {
        const user = result.rows[0];
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}

export async function create(
  pool: Pool,
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<IUser> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const _id = uuidv4();
  return new Promise((resolve, reject) => {
    pool.query(
      createSql,
      [_id, email, firstName, lastName, hashedPassword],
      (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        pool.query(selectUser, [email], (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          if (result.rows.length === 1) {
            const user = result.rows[0];
            resolve(user);
          }
        });
      }
    );
  });
}
