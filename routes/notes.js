const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1:fetch all the notes of the user /api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);

  } catch (error) {
    res.status(500).send("Internal server error ocurred");
  }
});

//ROUTE 2:to create notes /api/notes/addnotes
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if error in filling the data it will return the bad request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const notes = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNotes = await notes.save();

      res.send("Note is saved");
    } catch (error) {
      res.status(500).send("Internal server error ocurred");
    }
  }
);

//ROUTE 3:to update notes /api/notes/updatenote
router.put(
  "/updatenote/:id",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // create a newnote object
      const newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }

      //find the note to be updated and update it
      let notes = await Notes.findById(req.params.id);
       //checking the note exist or not
      if (!notes) {
        return res.status(404).send("note not found");
      }
      //checking user is authorized or not
      if (notes.user.toString() !== req.user.id) {
        return res.status(401).send("unathorized access");
      }
      notes = await Notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.send("Note updated succesfully");
    } catch (error) {
      res.status(500).send("Internal server error ocurred");
      console.log(error);
    }
  }
);

//ROUTE 4:to delete notes /api/notes/deletenote
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    

    //find the note to be deleted and delete it
    let notes = await Notes.findById(req.params.id);
    //checking the note exist or not
    if (!notes) {
      return res.status(404).send("note not found");
    }
    //checking user is authorized or not
    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("unathorized access");
    }
    notes = await Notes.findByIdAndDelete(req.params.id,);
    res.send("Note deleted succesfully");
  } catch (error) {
    res.status(500).send("Internal server error ocurred");
    console.log(error);
  }
});

module.exports = router;
