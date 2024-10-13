import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("Public"));
app.use(cookieParser());


//Routes import
import userRouter from "./routes/user.route.js"


//Routes Declaration
// app.get("/", (req, res) => {
//     res.send("Welcome to the API");
// })

app.use("/api/v1/users", userRouter);


export { app };