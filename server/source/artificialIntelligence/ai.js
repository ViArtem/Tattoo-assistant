import { Configuration, OpenAIApi } from "openai";
import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

class AI {
  constructor() {
    this.apiKey = process.env.OPENAI_KEY;
    this.pictureSize = process.env.PICTURE_SIZE;
    this.configuration = new Configuration({ apiKey: this.apiKey });
    this.openai = new OpenAIApi(this.configuration);
  }

  /**
   * Generates a picture based on the description (main artificial intelligence)
   * @param {string} prompt description of the picture to be generated
   * @returns object generated image
   */
  generatePictureWhithDallE = async (prompt) => {
    try {
      const photo = await this.openai.createImage({
        prompt,
        n: 1,
        size: this.pictureSize,
      });

      return photo.data.data[0].url;
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Generates a picture based on the description (free artificial intelligence)
   * @param {string} prompt description of the picture to be generated
   * @returns object generated image
   */
  generatePictureWhithFreeAI = async (prompt) => {
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const model = `laion-ai/erlich:${process.env.KEY_TO_FREE_AI}`;
      const input = {
        prompt,
      };
      const output = await replicate.run(model, { input });

      return output[0];
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Generates a picture based on the description (backup artificial intelligence)
   * @param {string} prompt description of the picture to be generated
   * @returns object generated image
   */
  generatePictureWhithStableDeffusionalAPI = async (prompt) => {
    try {
      const response = await fetch(
        "https://stablediffusionapi.com/api/v3/text2img",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: process.env.STABLE_DEFFUSIONAL_KEY,
            prompt,
          }),
        }
      );

      return await response.json().output[0];
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
}

export default new AI();
