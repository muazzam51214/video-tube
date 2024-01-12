import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js";
dotenv.config({path: "./.env"})
connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`App is listening on Port ${process.env.PORT}`)
  })
})
.catch((error) => {
  console.log("MongoDB Connection Failed! ", error);
});