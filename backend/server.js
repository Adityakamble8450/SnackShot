import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv"
dotenv.config()
const PORT = 3000 || process.env.PORT ;
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
