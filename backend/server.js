import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;  // fallback if PORT is undefined

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
