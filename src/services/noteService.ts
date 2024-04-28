import { Pool } from "pg";
import { INote } from "../interfaces/INote";
import { v4 as uuidv4 } from "uuid";

const createSql = `INSERT INTO notes (
    "_id",
    "title",
    "content",
    "createdAt",
    "editedAt",
    "complited",
    "complitedAt",
    "_ownerId"
  )
   VALUES ( $1, $2, $3, $4, $5, $6, $7, $8);`;

const selectNote = "SELECT * FROM notes WHERE _id = $1;";
const selectNoteByOwnerId = `SELECT * FROM notes WHERE "_ownerId" = $1;`;

export async function create(pool: Pool, note: INote): Promise<INote> {
  const _id = uuidv4();
  const createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    pool.query(
      createSql,
      [
        _id,
        note.title,
        note.content,
        createdAt,
        null,
        false,
        null,
        note._ownerId,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        if (result.rowCount === 1) {
          pool.query(selectNote, [_id], (err, result) => {
            if (err) {
              console.log(err);
              reject(err);
              return;
            }
            const note = result.rows[0];
            resolve(note);
          });
        } else {
          resolve(null);
        }
      }
    );
  });
}

export async function getAllNotesByOwnerId(
  pool: Pool,
  ownerId: string
): Promise<INote[]> {
  return new Promise((resolve, reject) => {
    pool.query(selectNoteByOwnerId, [ownerId], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      if (result.rows.length > 0) {
        resolve(result.rows);
      } else {
        resolve(null);
      }
    });
  });
}
