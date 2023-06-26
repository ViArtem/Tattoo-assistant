import { Bot, InputFile, InlineKeyboard } from "grammy";

import telegramService from "../telegramService/telegramService.js";
import TextValidator from "../helpers/textValidator.js";
import dotenv from "dotenv";
dotenv.config();

class TelegramManager {
  constructor() {
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
  }

  // The function is triggered at the start of the server and the start of the bot.
  botStarted = async () => {
    try {
      await this.processingStartCommand();
      await this.processingSavedCommand();
      await this.processingInlineKeyboard();
      await this.processingUserPrompt();
      await this.processingTextForImage();
      this.bot.start();
    } catch (error) {
      console.log(error);
    }
  };

  // processes the "message" event
  processingUserPrompt = async () => {
    try {
      this.bot.on("message:text", async (ctx) => {
        const userPrompt = ctx.message.text.trim();
        const userId = ctx.update.message.from.id;

        // validation request
        const validatedText = await TextValidator.validateText(userPrompt);

        if (!validatedText) {
          return ctx.reply(
            "The text does not meet the requirements, all special characters except commas and periods are prohibited"
          );
        }
        //

        // if the validation is successful, respond to the user
        ctx.reply("Your request is being processed...");

        // Returns a generated photo to the user
        const photo = await telegramService.processUserPrompt(
          userId,
          userPrompt
        );

        if (
          photo.message &&
          photo.message ===
            "Subscription is over, please pay for photo generation"
        ) {
          return ctx.reply(photo.message);
        }

        const inlineKeyboardForSavingPhotos = new InlineKeyboard()
          .text("Add to favorites", "save")
          .text("Open in editor", "edit")
          .row();

        return await ctx.replyWithPhoto(new InputFile(photo), {
          reply_markup: inlineKeyboardForSavingPhotos,
        });
      });
    } catch (error) {
      console.log("ManagerError: " + error.message);
    }
  };

  // processes the "callback_query:data" event
  processingInlineKeyboard = async () => {
    try {
      this.bot.on("callback_query:data", async (ctx) => {
        try {
          const fileId = ctx.callbackQuery.message.photo[1].file_id;
          const userId = ctx.from.id;

          // saves the photo to the database if you click on the inlineKeyboard with the save value
          if (ctx.callbackQuery.data === "save") {
            const fileLink = await ctx.api.getFile(fileId);

            // processing and saving photos to the database
            await telegramService.processSavePhoto(
              userId,
              fileLink.file_id,
              fileLink.file_unique_id
            );

            return await ctx.reply("Photo saved!");
          }

          // deletes a photo from the database by clicking on the inlineKeyboard with the delete value
          if (ctx.callbackQuery.data === "delete") {
            const fileLink = await ctx.api.getFile(fileId);

            await telegramService.processDeletePhoto(
              userId,
              fileLink.file_unique_id
            );

            return await ctx.reply("Photo removed!");
          }

          // sends the photo id to send it to the client
          if (ctx.callbackQuery.data === "edit") {
            const imageId = await ctx.api.getFile(fileId);

            await telegramService.processEditPhoto(imageId.file_id);
            await ctx.reply(
              `Open url: ${process.env.CLIENT_URL}/?imageId=${imageId.file_id}`
            );

            return;
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // processes the "start" command
  processingStartCommand = async () => {
    try {
      this.bot.command("start", async (ctx) => {
        const userName = ctx.update.message.from.first_name;
        const chatId = ctx.update.message.from.id;

        await ctx.reply("Welcome! Up and running.");

        await telegramService.processStartNewBot(userName, chatId);
      });
    } catch (error) {
      console.log(error);
    }
  };

  // processes the "favorites" command
  processingSavedCommand = async () => {
    try {
      this.bot.command("favorites", async (ctx) => {
        const chatId = ctx.update.message.from.id;

        // retrieval of all photos saved by the user
        const allPhotoArray = await telegramService.processGetAllPhoto(chatId);

        // sends the user all their saved photos
        if (allPhotoArray) {
          const inlineKeyboardForRemovePhoto = new InlineKeyboard()
            .text("Remove from favorites", "delete")
            .text("Open in editor", "edit")
            .row();

          allPhotoArray.forEach(async (photo) => {
            await ctx.replyWithPhoto(photo.image, {
              reply_markup: inlineKeyboardForRemovePhoto,
            });
          });
          return;
        }
        ctx.reply("No saved images");
      });
    } catch (error) {
      console.log(error);
    }
  };

  // accepts text with a description overlays a description on the text
  processingTextForImage = async () => {
    try {
      this.bot.on("message:photo", async (ctx) => {
        const caption = ctx.update.message.caption;

        if (caption && caption.trim != "") {
          const photo = await telegramService.processTextForImage(
            ctx.update.message.photo[1],
            ctx.update.message.caption
          );
          await ctx.replyWithPhoto(new InputFile(photo.pngBufferFormat));
          return await ctx.replyWithDocument(
            new InputFile(photo.svgBufferFormat),
            {
              caption: "Save the file as svg",
            }
          );
        }

        return ctx.reply("Send a picture with the text");
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new TelegramManager();
