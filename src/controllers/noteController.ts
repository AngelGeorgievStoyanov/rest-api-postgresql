import express from "express";
import { Pool } from "pg";
import {
  completedNoteById,
  create,
  deleteNoteById,
  deleteNotesFromTable,
  getAllNotesByOwnerId,
  getNoteById,
  markTableNotesAsCompleted,
  updateNoteById,
} from "../services/noteService";
import { authenticateToken } from "../guard/jwt.middleware";
import { trimBody } from "../guard/trim.body.middleware";

export default function noteController(pool: Pool) {
  const router = express.Router();

  router.use(authenticateToken);
  router.use(trimBody);

  router.post("/create", async (req, res) => {
    try {
      const userId = req.body._ownerId;
      try {
        const note = await create(pool, req.body);
        res.status(201).json(note);
      } catch (err) {
        console.log(err.message);
        res.status(400).json(err.message);
      }
    } catch (err) {
      console.log(err.message);
      res.status(401).json(err.message);
    }
  });

  router.get(
    "/getNotesByOwnerId/:ownerId/page/:page/pageSize/:pageSize/sortOrder/:sortOrder",
    async (req, res) => {
      try {
        const ownerId = req.params.ownerId;
        const page = Number(req.params.page);
        const pageSize = Number(req.params.pageSize);
        const sortOrder = req.params.sortOrder;
        const notes = await getAllNotesByOwnerId(
          pool,
          ownerId,
          page,
          pageSize,
          sortOrder
        );
        res.status(200).json(notes);
      } catch (err) {
        console.log(err.message);
        res.status(400).json(err.message);
      }
    }
  );

  router.get("/getNoteById/:noteId", async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const note = await getNoteById(pool, noteId);
      res.status(200).json(note);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  router.post("/update/:noteId", async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.body._ownerId;
    const note = req.body.data;
    try {
      const updatedNote = await updateNoteById(pool, note, noteId);
      res.status(200).json(updatedNote);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  router.delete("/delete/:noteId", async (req, res) => {
    const noteId = req.params.noteId;
    try {
      const deletedNote = await deleteNoteById(pool, noteId);
      res.status(200).json(deletedNote);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  router.post("/completed/:noteId", async (req, res) => {
    const noteId = req.params.noteId;
    const note = req.body;
    try {
      const updatedNote = await completedNoteById(pool, note, noteId);
      res.status(200).json(updatedNote);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  router.post("/tableCompleted", async (req, res) => {
    const notes = req.body.data;
    const page = Number(req.body.paginationAndSorting.page);
    const pageSize = Number(req.body.paginationAndSorting.pageSize);
    const sortOrder = req.body.paginationAndSorting.sortOrder;
    const userId = req["user"]["_id"];

    try {
      const updatedNotes = await markTableNotesAsCompleted(
        pool,
        notes,
        userId,
        page,
        pageSize,
        sortOrder
      );
      res.status(200).json(updatedNotes);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  router.delete("/tableDeleteNotes", async (req, res) => {
    const notes = req.body.data;
    let page = Number(req.body.paginationAndSorting.page);
    const pageSize = Number(req.body.paginationAndSorting.pageSize);
    const sortOrder = req.body.paginationAndSorting.sortOrder;
    const userId = req["user"]["_id"];

    try {
      const result = await deleteNotesFromTable(
        pool,
        notes,
        userId,
        page=0,
        pageSize,
        sortOrder
      );
      res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

  return router;
}
