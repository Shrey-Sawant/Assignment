import dotenv from "dotenv";
import app from "./app.js";

dotenv.config()

app.listen(process.env.PORT || 3000,()=>{
   console.log("Server started"+process.env.PORT)
})