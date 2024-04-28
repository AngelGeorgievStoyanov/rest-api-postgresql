import express from "express";
import { Pool } from "pg";
import {
  create,
  getAllNotesByOwnerId,
  getNoteById,
  updateNoteById,
} from "../services/noteService";

export default function noteController(pool: Pool) {
  const router = express.Router();

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

  router.get("/getNotesByOwnerId/:ownerId", async (req, res) => {
    try {
      const ownerId = req.params.ownerId;
      const notes = await getAllNotesByOwnerId(pool, ownerId);
      res.status(200).json(notes);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  });

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
  return router;
}
