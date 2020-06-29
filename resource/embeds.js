module.exports = {
  addEmbed(path, access_method, webhook){
    const a = new webhook.MessageBuilder()
      .setName("ShareX")
      .setColor("#00ff1a")
      .setTime()
      .setAvatar('https://getsharex.com/img/ShareX_Logo.png')
      .setImage(`${access_method}://${path.slice(9)}`)
      .setDescription(`File Added: ${access_method}://${path.slice(9)}`);
    return a;
  },
  delEmbed(path, access_method, webhook){
    const d = new webhook.MessageBuilder()
      .setName("ShareX")
      .setColor("#ff0000")
      .setTime()
      .setAvatar('https://getsharex.com/img/ShareX_Logo.png')
      .setDescription(`File Deleted: ${access_method}://${path.slice(9)}`);
    return d;
  }
};