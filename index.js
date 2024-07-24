const connectToMongo = require("./db.js");
const express = require("express");
const cors = require('cors')
const app = express();
app.use(cors());
app.use(express.json())
connectToMongo();
const port = 5000;

//Available routes yani ki apis
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.listen(port, () => {
  console.log(`iNoteBook backend listening at http://localhost:${port}`);
});
