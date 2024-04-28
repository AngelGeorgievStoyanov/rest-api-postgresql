import express from "express";
import { Pool } from "pg";
import { create, getAllNotesByOwnerId } from "../services/noteService";

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

  return router;
}
