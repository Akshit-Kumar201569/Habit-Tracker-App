const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");

// Get all habits
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new habit
router.post("/", async (req, res) => {
  try {
    const habit = new Habit({ text: req.body.text });
    const savedHabit = await habit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle habit completion
router.put("/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    habit.completed = !habit.completed;
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete habit
router.delete("/:id", async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
