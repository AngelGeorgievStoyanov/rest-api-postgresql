import { Pool } from "pg";
import { INote } from "../interfaces/INote";
import { v4 as uuidv4 } from "uuid";

const createSql = `INSERT INTO notes (
    "_id",
    "title",
    "content",
    "createdAt",
    "editedAt",
    "completed",
    "completedAt",
    "_ownerId"
  )
   VALUES ( $1, $2, $3, $4, $5, $6, $7, $8);`;

const selectNote = "SELECT * FROM notes WHERE _id = $1;";
const selectNoteById = `SELECT * FROM notes WHERE "_id" = $1;`;
const updateNote = `UPDATE notes SET "title" = $1, "content" = $2, "editedAt" = $3 WHERE _id = $4`;
const completedNote = `UPDATE notes SET "completedAt" = $1, "completed" = $2 WHERE _id = $3`;
const deleteOne = `DELETE from notes WHERE _id = $1`;

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
  ownerId: string,
  page: number,
  pageSize: number,
  sortOrder: string
): Promise<{ totalCount: number; notes: INote[] }> {
  let sortField: string;
  let sortDirection: string;

  const [field, direction] = sortOrder.split("_");
  switch (field) {
    case "created":
      sortField = '"createdAt"';
      break;
    case "edited":
      sortField = '"editedAt"';
      break;
    case "completed":
      sortField = '"completedAt"';
      break;
    default:
      sortField = '"createdAt"';
      break;
  }
  sortDirection = direction === "asc" ? "ASC" : "DESC";

  const offset = page * pageSize;

  let selectNoteByOwnerId = `SELECT * FROM notes WHERE "_ownerId" = $1`;

  if (field === "edited" || field === "completed") {
    selectNoteByOwnerId += ` AND ${sortField} IS NOT NULL`;
  }

  selectNoteByOwnerId += ` ORDER BY ${sortField} ${sortDirection}`;

  if (field === "edited" || field === "completed") {
    selectNoteByOwnerId += `, "createdAt" ${sortDirection}`;
  }

  selectNoteByOwnerId += ` LIMIT $2 OFFSET $3`;
  const countQuery = `SELECT COUNT(*) FROM notes WHERE "_ownerId" = $1 AND ${sortField} IS NOT NULL`;
  return new Promise((resolve, reject) => {
    pool.query(countQuery, [ownerId], (err, countResult) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      const totalCount = parseInt(countResult.rows[0].count, 10);

      pool.query(
        selectNoteByOwnerId,
        [ownerId, pageSize, offset],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          const notes = result.rows;

          resolve({ totalCount, notes });
        }
      );
    });
  });
}

export async function getNoteById(
  pool: Pool,
  noteId: string
): Promise<INote[]> {
  return new Promise((resolve, reject) => {
    pool.query(selectNoteById, [noteId], (err, result) => {
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

export async function updateNoteById(
  pool: Pool,
  note: INote,
  noteId: string
): Promise<INote> {
  const editedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    if (note.title !== null) {
      pool.query(
        updateNote,
        [note.title, note.content, editedAt, noteId],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          if (result.rowCount === 1) {
            pool.query(selectNote, [noteId], (err, result) => {
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
    }
  });
}

export async function deleteNoteById(
  pool: Pool,
  noteId: string
): Promise<INote> {
  return new Promise((resolve, reject) => {
    pool.query(selectNoteById, [noteId], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      const note = result.rows[0];
      pool.query(deleteOne, [noteId], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        if (result) {
          resolve(note);
        } else {
          resolve(note);
        }
      });
    });
  });
}

export async function completedNoteById(
  pool: Pool,
  note: INote,
  noteId: string
): Promise<INote> {
  const completedAt = note.completed ? null : new Date().toISOString();
  return new Promise((resolve, reject) => {
    if (note.title !== null) {
      pool.query(
        completedNote,
        [completedAt, !note.completed, noteId],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          if (result.rowCount === 1) {
            pool.query(selectNote, [noteId], (err, result) => {
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
    }
  });
}

export async function markTableNotesAsCompleted(
  pool: Pool,
  ids: string[],
  ownerId: string,
  page: number,
  pageSize: number,
  sortOrder: string
): Promise<{ totalCount: number; notes: INote[] }> {
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
  const queryText = `UPDATE notes SET "completedAt" = NOW(), "completed" = true WHERE "_id" IN (${placeholders})`;

  const queryParams = ids;

  const query = {
    text: queryText,
    values: queryParams,
  };

  return new Promise<{ totalCount: number; notes: INote[] }>(
    (resolve, reject) => {
      pool.query(query, (err, result) => {
        if (err) {
          console.error(err.stack);
          reject(err);
        } else {
          const notesAndCount = getAllNotesByOwnerId(
            pool,
            ownerId,
            page,
            pageSize,
            sortOrder
          );
          resolve(notesAndCount);
        }
      });
    }
  );
}

export async function deleteNotesFromTable(
  pool: Pool,
  ids: string[],
  ownerId: string,
  page: number,
  pageSize: number,
  sortOrder: string
): Promise<{ totalCount: number; notes: INote[] }> {
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
  const queryText = `DELETE from notes WHERE "_id" IN (${placeholders})`;

  const queryParams = ids;

  const query = {
    text: queryText,
    values: queryParams,
  };

  return new Promise<{ totalCount: number; notes: INote[] }>(
    (resolve, reject) => {
      pool.query(query, (err, result) => {
        if (err) {
          console.error(err.stack);
          reject(err);
        } else {
          const notesAndCount = getAllNotesByOwnerId(
            pool,
            ownerId,
            page,
            pageSize,
            sortOrder
          );
          resolve(notesAndCount);
        }
      });
    }
  );
}
