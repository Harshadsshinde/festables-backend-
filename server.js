// server.js
import app from "./app.js";
import { config } from "dotenv";
import { User } from "./models/userSchema.js";


// Load environment variables (if not already loaded in app.js)
config({ path: "./config.env" });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
