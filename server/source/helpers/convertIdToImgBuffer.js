import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export default async function convertImageIdToBuffer(photo) {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo}`
    );

    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${response.data.result.file_path}`;

    const bufferResponse = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    return bufferResponse.data;
  } catch (error) {
    console.log(error.data);
  }
}
