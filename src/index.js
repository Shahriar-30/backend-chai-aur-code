import "dotenv/config";
import connectDB from "./datebase/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("server is connected at ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("server connection error", error);
  });
