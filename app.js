import express from "express";
import auth from "./routes/auth/index.js";
import profil from "./routes/profil/index.js";
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", auth);
// app.use("/", profil);
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
