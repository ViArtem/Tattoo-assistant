import * as fs from "node:fs/promises";
import path from "node:path";

class ImageService {
  constructor() {}

  // deleting a picture from the server
  deleteImage = async (imageId) => {
    try {
      await fs.rm(path.resolve("images", `${imageId}.png`));
    } catch (error) {
      console.log(error);
    }
  };

  // checking whether the image is available on the server
  getImage = async (imageId) => {
    try {
      const filePath = path.resolve("images", `${imageId}.png`);

      await fs.access(filePath);

      return { message: "The file exists" };
    } catch (error) {
      if (error.code === "ENOENT") {
        return { message: "The file does not exist" };
      } else {
        console.error("File validation error:", error);
      }
    }
  };
}

export default new ImageService();
