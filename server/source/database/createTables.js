class CreateTables {
  constructor() {}
  // request to create tables with images
  createImagesTables = async (connection) => {
    await connection.query(`CREATE TABLE IF NOT EXISTS images (
        _id int NOT NULL AUTO_INCREMENT,
        owner varchar(255) NOT NULL,
        image varchar(255) NOT NULL,
        uniqueImageId varchar(255) NOT NULL
    )`);
  };

  // request to create tables with prompts
  createPromptTables = async (connection) => {
    await connection.query(`CREATE TABLE IF NOT EXISTS prompt (
        _id int NOT NULL AUTO_INCREMENT,
        owner varchar(255) NOT NULL,
        prompt varchar(255) NOT NULL
    )`);
  };

  // request to create tables with users
  createUsersTables = async (connection) => {
    await connection.query(`CREATE TABLE IF NOT EXISTS users (
        _id int NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        chatId varchar(255) NOT NULL
    )`);
  };
}

export default new CreateTables();
