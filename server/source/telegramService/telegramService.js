import Database from "../database/bd.js";
import Translator from "../translator/translator.js";
import convertImageIdToBuffer from "../helpers/convertIdToImgBuffer.js";
import adapterAI from "../adapter/adapterAI.js";

import axios from "axios";
import sharp from "sharp";
import potrace from "potrace";

import * as fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

class TelegramService {
  constructor() {}

  /**
   * process information about new user
   * @param {string} name name of the new user
   * @param {number} chatId unique id of the new user
   * @returns object with the details of the operation
   */
  processStartNewBot = async (name, chatId) => {
    try {
      const newUser = await Database.checkUser(chatId);

      if (newUser) {
        return null;
      }

      return await Database.addInformationAboutNewUserToDatabase(name, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Processes the description and returns the created image
   * @param {string} prompt description of the photo to be generated
   * @returns buffer of the generated photo
   */
  processUserPrompt = async (userId, prompt) => {
    try {
      const userInfo = await Database.checkUser(userId);

      if (userInfo[0].messages > 0) {
        await Database.updateMessageCount(userId, userInfo[0].messages - 1);
      }

      if (userInfo[0].messages > 0 || userInfo[0].role === "admin") {
        const translatedText = await Translator.translateUserText(prompt);

        await Database.addUserPromptToDatabase(userId, translatedText.text);

        // generates a image based on the description
        const photo = await adapterAI.usingAI(translatedText.text);

        const bufferImmage = await axios({
          url: photo,
          responseType: "arraybuffer",
        });

        return bufferImmage.data;
      }

      return {
        message: "Subscription is over, please pay for photo generation",
      };
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Saves information about the image and the user who saved it to the database
   * @param {string} ownerId unique id of the user
   * @param {string} imageId general photo identifier
   * @param {string} uniqueImageId unchangeable picture id
   * @returns -
   */
  processSavePhoto = async (ownerId, imageId, uniqueImageId) => {
    try {
      // checking whether the photo you want to save in the database is available
      const checkPhoto = await Database.checkPhoto(uniqueImageId);

      if (!checkPhoto) {
        return await Database.addSavedImageIdToDatabase(
          ownerId,
          imageId,
          uniqueImageId
        );
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Deletes a photo from the database
   * @param {number} ownerId unique id of the user
   * @param {string} imageId unchangeable picture id
   * @returns object with the details of the operation
   */
  processDeletePhoto = async (ownerId, imageId) => {
    try {
      return await Database.removeSavedImageIdFromDatabase(ownerId, imageId);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Saves photos on the server
   * @param {string} imageId
   * @returns
   */
  processEditPhoto = async (imageId) => {
    try {
      const imagePath = path.resolve("images", `${imageId}.png`);

      const imageBuffer = await convertImageIdToBuffer(imageId);

      await fs.writeFile(imagePath, imageBuffer);

      return;
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Request to receive all photo
   * @param {number} ownerId unique id of the user
   * @returns array with objects of all saved pictures
   */
  processGetAllPhoto = async (ownerId) => {
    try {
      return await Database.getAllSavedPhoto(ownerId);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Сombines text with a picture
   * @param {Object} photoObject object with photo parameters
   * @param {string} caption the inscription you want to add to the text
   * @returns an object with two fields: an svg photo buffer and a png photo buffer
   */
  processTextForImage = async (photoObject, caption) => {
    try {
      // get a link to the photo
      const imageUrl = await convertImageIdToBuffer(photoObject.file_id);

      const params = {
        background: "#ffffff",
        color: "#000000",
        threshold: 0,
        turdSize: 0,
        turnPolicy: "black",
      };

      // converts to svg format
      function traceToSVG(pngBuffer) {
        return new Promise((resolve, reject) => {
          potrace.trace(pngBuffer, params, function (err, svg) {
            if (err) reject(err);
            resolve(svg);
          });
        });
      }

      // add text to a picture
      async function addTextOnImage(
        caption = "Enter Text",
        width = 512,
        height = 512,
        fontSize = 48,
        fontWeight = "bold",
        textPositionX = 50,
        textPositionY = 50,
        color = "red",
        fontFamily = "arial"
      ) {
        try {
          // creates text as an image
          const svgImage = `
          <svg width="${width}" height="${height}">
          <style>
          .title { fill: ${color}; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-family: ${fontFamily} }
          </style>
          <text x="${textPositionX}%" y="${textPositionY}%" text-anchor="middle" class="title">${caption}</text>
          </svg>
          `;

          // converts svg to a buffer
          const svgBuffer = Buffer.from(svgImage);

          const image = await sharp(imageUrl)
            .resize(width, height)
            .composite([
              {
                input: svgBuffer,
                top: 0,
                left: 0,
              },
            ]);

          // buffer of a picture combined with text
          const pngBuffer = await image.png().toBuffer();

          // an svg buffer of a picture combined with text
          const svg = Buffer.from(await traceToSVG(pngBuffer));

          return { svgBufferFormat: svg, pngBufferFormat: pngBuffer };
        } catch (error) {
          console.log(error);
        }
      }

      if (caption.includes(",")) {
        const textParameters = caption.split(",").map((elm) => {
          const num = parseInt(elm.trim());

          if (!isNaN(num)) {
            Number(num);
            return num;
          }
          return elm.trim();
        });
        const photo = await addTextOnImage(...textParameters);

        return photo;
      }

      const photo = await addTextOnImage(caption);
      return photo;
    } catch (error) {
      console.log(error);
    }
  };
}

export default new TelegramService();
