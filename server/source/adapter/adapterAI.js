import AI from "../artificialIntelligence/ai.js";
import dotenv from "dotenv";
dotenv.config();

class adapterAI {
  constructor() {
    this.config = {
      pro: AI.generatePictureWhithDallE,
      free: AI.generatePictureWhithFreeAI,
      backup: AI.generatePictureWhithStableDeffusionalAPI,
    };
  }
  usingAI = async (prompt) => {
    return this.config[process.env.AI_CONFIGURATION](prompt);
  };
}

export default new adapterAI();
