const { nginx_webhook, sharex_webhook, file_upload_dir, access_log_dir, access_method, domain } = require('./config.json')

// DISCORD WEBHOOK SETUP
const webhook = require("webhook-discord")
const sxHook = new webhook.Webhook(sharex_webhook)
const nxHook = new webhook.Webhook(nginx_webhook)

// Setup file watcher for ShareX uploads
const chokidar = require('chokidar');
const watcher = chokidar.watch(file_upload_dir, { persistent: true, awaitWriteFinish: true });


// Setup log watcher for access.log for NGINX requests
const Tail = require('tail').Tail;
tail = new Tail(access_log_dir);

//Watch for file uploads from ShareX and send to webhook here

watcher.on('ready', function(){
  console.log('Watcher started. Files loaded into memory. Waiting for new/deleted files.')

  //Start the watcher now that everything is loaded OK.
  watcher.on('add', function(path) {
      //Upload embed message.
      const uploadMsg = new webhook.MessageBuilder()
      .setName("ShareX")
      .setColor("#00ff1a")
      .setTime()
      .setImage(`${access_method}://${path.slice(9)}`)
      .setDescription(`File Added: ${access_method}://${path.slice(9)}`);

      //Send the embed
      sxHook.send(uploadMsg)
      console.log(`File added: ${path.slice(9)} \nURL: ${access_method}://${path.slice(9)}`)
    }).on('unlink', function(path) {
      //Upload embed message.
      const deleteMsg = new webhook.MessageBuilder()
      .setName("ShareX")
      .setColor("#ff0000")
      .setTime()
      .setDescription(`File Deleted: ${access_method}://${path.slice(9)}`);
    
      //Send the embed
      sxHook.send(deleteMsg)
    console.log(`File deleted: ${path.slice(9)} \nURL: ${access_method}://${path.slice(9)}`)
    return;
  })
})


//When new line is added to access.log then run this.
tail.on("line", function(dataAdded) {
  var ipReg = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  var objDataAdded = dataAdded.split(" ");
  
  //Log before the filtering.
  console.log(dataAdded)

  //This is optional since this is really for my personal use doesn't really affect anyone but this would ignore NETDATA and my custom webhook.
  if(objDataAdded[6].includes('/favicon.ico')) return;
  if(objDataAdded[6].includes('/dblhook')) return;
  if(objDataAdded[6].includes('/netdata')) return;
  if(objDataAdded[6].includes('x00')){
    console.log("Error, someone is attempting to escape a directory. Webhook Failed.")
    return;
  }
  
  //ignore discords caching IPs
  if(dataAdded.match(ipReg)[0].includes('45.') || dataAdded.match(ipReg)[0].includes('35.')) return;

  const sendNginxLog = new webhook.MessageBuilder()
    .setName("NGINX Logs")
    .setColor("#aabbcc")
    .setTitle(`${access_method}://${domain}${objDataAdded[6]}`)
    .setURL(`${access_method}://${domain}${objDataAdded[6]}`)
    .setTime()
    .setAuthor('NGINX Logs', 'https://stuggi.files.wordpress.com/2019/08/nginx-icon-outline-hex-rgb-266x302.png')
    .addField('Method', `\`${objDataAdded[3]+objDataAdded[4]}\``, false)
    .addField('Requested from:', `\`${dataAdded.match(ipReg)[0]}\``, true)
    .addField('Directory', `\`${objDataAdded[6]}\``, true)
    .addField('Request Type', `\`${objDataAdded[5].slice(1)}\``, true);
  
  //Send the embed
  try{
    nxHook.send(sendNginxLog)
  }catch(e){
    console.log("Error, someone is attempting to escape a directory. Webhook Failed.")
  }
  
});