import translatte from "translatte";

class Translator {
  constructor() {}

  /**
   * Generates a picture based on text
   * @param {string} text description for generating the image
   * @returns an object with image parameters
   */
  async translateUserText(text) {
    try {
      return await translatte(text, { to: "en" });
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export default new Translator();
