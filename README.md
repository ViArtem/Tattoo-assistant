## Tattoo assistant project

This project combines the interaction of three components: a Telegram bot, a React application, and a Node.js server that facilitates communication between all components and provides additional functionality.

---

### Stacks

The application server uses `Node.js` in combination with the `Express` framework.

The `grammy` library facilitates the interaction between the server and the Telegram bot.

`mysql2` is used for managing SQL queries to the PlanetScale database.

`openai` is utilized for generating images based on provided descriptions by sending requests to the `DALL-E 2 AI` API.

`translatte` provides text translation capabilities.

`axios` is used for making requests to retrieve information and facilitate client-server interactions.

`sharp` converts PNG images to SVG format.

---

### Functionality

The bot is designed to create images based on descriptions. It supports multiple languages and automatically translates your request into English. After generating an image, you have the option to add it to your "favorites" for quick reference later. You can also open the image in an editor for quick editing. By sending the bot a photo with a caption, it will automatically combine the text and photo and send you two versions: PNG and SVG.

---

### Quick start

Open the server folder in the terminal and enter the following command:

```JS
npm install
```

```JS
node application.js
```
