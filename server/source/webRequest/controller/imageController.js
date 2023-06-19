import imageService from "../service/imageService.js";

class ImageController {
  constructor() {}

  // deleting a picture from the server
  deleteImage = async (req, res) => {
    try {
      if (req.body.imageId) {
        await imageService.deleteImage(req.body.imageId);
        return res.json({ status: "message deleted" });
      }
      res.json({ status: "message deleted" });
    } catch (error) {
      console.log(error);
    }
  };

  // checking whether the image is available on the server
  getImage = async (req, res) => {
    try {
      if (req.body.imageId) {
        const checkPhoto = await imageService.getImage(req.body.imageId);
        return res.json({ status: checkPhoto.message });
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export default new ImageController();
