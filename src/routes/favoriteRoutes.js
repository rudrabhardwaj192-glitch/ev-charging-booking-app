const express = require("express");

const router = express.Router();

const {
  add,
  getAll,
  remove,
} = require("../controllers/favoriteController");

router.post("/", add);

router.get("/:user_id", getAll);

router.delete("/", remove);

module.exports = router;