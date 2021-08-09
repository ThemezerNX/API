const discord = require("discord.js");

export const packMessage = () =>
    new discord.Webhook
        .setName("Packs")
        .setText("New Pack submission!")
        .setColor("#b40a86")
        .setTime();

export const themeMessage = () =>
    new webhook.MessageBuilder()
        .setName("Themes")
        .setText("New Theme submission!")
        .setColor("#0ab379")
        .setTime();

export const reportMessage = () =>
    new webhook.MessageBuilder()
        .setName("Reports")
        .setText("New report")
        .setColor("#C62828")
        .setTime();
