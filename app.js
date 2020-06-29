const webhook = require("webhook-discord");
const chokidar = require('chokidar');
const { sharex_webhook, file_upload_dir, access_method } = require('./config.json');
const { addEmbed, delEmbed } = require('./resource/embeds.js');
const watcher = chokidar.watch(file_upload_dir, { persistent: true, awaitWriteFinish: true });
const sxHook = new webhook.Webhook(sharex_webhook);

watcher.on('ready', () => {
  watcher.on('add', (path) => {
    sxHook.send(addEmbed(path, access_method, webhook))
    console.log(`File added: ${path.slice(9)} \nURL: ${access_method}://${path.slice(9)}`)
    return;
  })
  .on('unlink', (path) => {
    sxHook.send(delEmbed(path, access_method, webhook))
    console.log(`File deleted: ${path.slice(9)} \nURL: ${access_method}://${path.slice(9)}`)
    return;
  })
})