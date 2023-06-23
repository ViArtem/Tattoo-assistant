import { Router } from "express";
import imageController from "../controller/imageController.js";

const imageRouter = new Router();
// route for deleting a picture from the server
imageRouter.delete("/delete/image", imageController.deleteImage);

//route for checking whether the image is available on the server
imageRouter.post("/get/image", imageController.getImage);

export { imageRouter };

