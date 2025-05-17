const express = require('express');

const FormData = require('form-data');

const { exec } = require("child_process");


const yts = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ᏦᎽᎾᎿᎯᏦᎯ</title>
      </head>
      <body style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: green;">╾⸻⟡⟡ 『ᏦᎽᎾᎿᎯᏦᎯ』 ⟡⟡⸻╼ bot connecté avec  succès </h1>
        <p><b>Ton bot est actif...</b> 
Les ombres s’agitent.  
Les commandes attendent.  
Que le chaos commence</p>
      </body>
    </html>
  `);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Telegram Bot Connected');
});



const TelegramBot = 
require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Remplace 'ton token telegram bot' par le token de ton bot
const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', { polling: true });


bot.onText(/\/play(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const inputText = match[1];

    if (!inputText) {
        return bot.sendMessage(chatId, "🍿 💀 Indique le nom de la chanson... ou reste dans le silence éternel. 💀.\nExample: `/play le trio du code`");
    }

    try {
        
        await bot.sendMessage(chatId, "🔍 La traque de ta musique commence...🎶");

      
        const search = await yts(inputText);
        const video = search.all[0];

        if (!video) {
            return bot.sendMessage(chatId, "❌ Désolé, aucune trace de cette chanson... Le silence règne. Essaie un autre mot-clé et peut-être que la musique renaîtra... 🎶🔥");
        }

        
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const { success, result } = response.data;

        if (success && result) {
            const { title, thumbnail, download_url } = result;
            const filename = `./${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;

            
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎶 *lecteur de musique* 🎶\n\n` +
                    `🎵 *Titre:* ${video.title}\n` +
                    `🔗 [regarde sur youtube](${video.url})\n\n*Fait par le seul et unique ╾⸻⟡⟡ 『ᏦᎽᎾᎿᎯᏦᎯ』 ⟡⟡⸻╼*`,
                parse_mode: "Markdown",
            });

            
            const writer = fs.createWriteStream(filename);
            const { data } = await axios({
                url: download_url,
                method: "GET",
                responseType: "stream",
            });

            data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            
            await bot.sendAudio(chatId, filename, {
                caption: `🎧 *Voici ta musique :*\n🎵 *Titre:* ${video.title}\n\n*Fait par ╾⸻⟡⟡ 『ᏦᎽᎾᎿᎯᏦᎯ』 ⟡⟡⸻╼*`,
                parse_mode: "Markdown",
            });

            
            fs.unlink(filename, (err) => {
                if (err) console.error("Error deleting file:", err);
            });
        } else {
            bot.sendMessage(chatId, "❌ Impossible de télécharger la chanson... La connexion avec le son est rompue. 🎶💀");
        }
    } catch (error) {
        console.error("Error during /play command:", error);
        bot.sendMessage(chatId, "❌ Une erreur s'est produite lors du traitement de ta demande...Le système a trébuché. Réessaie plus tard et peut-être que tout reprendra son cours. 🔄🎶");
    }
});


bot.onText(/\/video (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1]?.trim();

    if (!query) {
        return bot.sendMessage(chatId, "❗ *Utilisation*: `/video <vidéo que tu veux>`", { parse_mode: 'Markdown' });
    }

    try {
        const searchMsg = await bot.sendMessage(chatId, "🔍 *patiente deux secondes je cherche la vidéo ...*", { parse_mode: "Markdown" });

       
        const search = await yts(query);
        const video = search.all[0]; 
        if (!video) {
            return bot.sendMessage(chatId, "❌ soit la vidéo n'hésite pas soit j'ai pas trouvé !");
        }

        
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4`;
        const response = await axios.get(apiUrl, { params: { url: video.url } });
        const { success, result } = response.data;

        if (success && result) {
            const { title, download_url } = result;
            const filePath = `./temp/${title.replace(/[^\w\s]/gi, '')}.mp4`;

           
            const writer = fs.createWriteStream(filePath);
            const videoStream = await axios({
                url: download_url,
                method: 'GET',
                responseType: 'stream'
            });

            videoStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

await bot.sendVideo(chatId, download_url, {
    caption: `🎬 *voici ta video:*`,
    parse_mode: "Markdown"
});
            
            fs.unlinkSync(filePath);
        } else {
            bot.sendMessage(chatId, "❌ Impossible de récupérer la vidéo...Un obstacle s'est dressé sur la route du son. Réessaie plus tard et peut-être que l'accès se débloquera. 🔄🎶");
        }

        await bot.deleteMessage(chatId, searchMsg.message_id);
    } catch (err) {
        console.error("une erreur erreur est survenue lors de la command /video:", err);
        bot.sendMessage(chatId, "❌ Le système a vacillé. Réessaie plus tard et vois si tout rentre dans l'ordre 🔄.");
    }
});