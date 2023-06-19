import mysql from "mysql2";
import CreateTables from "./createTables.js";
import dotenv from "dotenv";
dotenv.config();

class Database {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL;
    this.connection = mysql.createConnection(this.databaseUrl).promise();

    console.log("CONNECTED TO DATABASE");
  }

  createTables = async () => {
    await CreateTables.createImagesTables(this.connection);
    await CreateTables.createPromptTables(this.connection);
    await CreateTables.createUsersTables(this.connection);
  };

  /**
   * Executes the function and handles errors, if any
   * @param {function} promise asynchronous function
   * @returns result of the function performed
   */
  handleErrors = async (promise) => {
    try {
      const result = await promise;
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  /**
   * Request to add information about new user to database
   * @param {string} name name of the new user
   * @param {number} chatId unique id of the new user
   * @returns object with the details of the operation
   */
  addInformationAboutNewUserToDatabase = async (name, chatId) => {
    return await this.handleErrors(
      this.connection.query("INSERT INTO users (name, chatId) VALUES (?, ?)", [
        name,
        chatId,
      ])
    );
  };

  /**
   * Request to add user prompt to database
   * @param {number} owner unique id of the user
   * @param {string} prompt description of the picture to be generated
   * @returns object with the details of the operation
   */
  addUserPromptToDatabase = async (owner, prompt) => {
    return await this.connection.query(
      "INSERT INTO prompt (owner, prompt) VALUES (?, ?)",
      [owner, prompt]
    );
  };

  /**
   * Request to add imageId to database
   * @param {number} owner unique id of the user
   * @param {string} imageId picture id
   * @param {string} uniqueImageId unchangeable picture id
   * @returns object with the details of the operation
   */
  addSavedImageIdToDatabase = async (owner, imageId, uniqueImageId) => {
    return await this.handleErrors(
      this.connection.query(
        "INSERT INTO images (owner, image, uniqueImageId) VALUES (?, ?, ?)",
        [owner, imageId, uniqueImageId]
      )
    );
  };

  /**
   * Request to remove saved imageId from database
   * @param {number} owner unique id of the user
   * @param {string} imageId unchangeable picture id
   * @returns object with the details of the operation
   */
  removeSavedImageIdFromDatabase = async (owner, imageId) => {
    return await this.handleErrors(
      this.connection.query(
        "DELETE FROM images WHERE owner = ? AND uniqueImageId = ?",
        [owner, imageId]
      )
    );
  };

  /**
   * Request to receive all photo
   * @param {number} userId unique id of the user
   * @returns array with objects of all saved pictures
   */
  getAllSavedPhoto = async (userId) => {
    const allImages = await this.handleErrors(
      this.connection.query("SELECT * FROM images WHERE owner = ?", [userId])
    );
    if (allImages[0].length === 0) {
      return null;
    }

    return allImages[0];
  };

  /**
   * Checks the availability of the user in the database
   * @param {number} userId unique id of the user
   * @returns null if such a user does not exist, or a user object if it exists
   */
  checkUser = async (chatId) => {
    const candidate = await this.handleErrors(
      this.connection.query("SELECT * FROM users WHERE chatId = ?", [chatId])
    );

    if (candidate[0].length === 0) {
      return null;
    }

    return candidate[0];
  };

  /**
   * Updates the number of available requests for image generation
   * @param {string} chatId unique id of the user
   * @param {string} messages number of available messages
   */
  updateMessageCount = async (chatId, messages) => {
    await this.handleErrors(
      this.connection.query(`UPDATE users SET messages = ? WHERE chatId = ?`, [
        messages,
        chatId,
      ])
    );
  };

  /**
   * Checks the availability of the image in the database
   * @param {string} imageId unchangeable picture id
   * @returns null if such a image does not exist, or a image object if it exists
   */
  checkPhoto = async (imageId) => {
    const candidate = await this.handleErrors(
      this.connection.query("SELECT * FROM images WHERE uniqueImageId = ?", [
        imageId,
      ])
    );

    if (candidate[0].length === 0) {
      return null;
    }

    return candidate[0][0];
  };
}

export default new Database();
