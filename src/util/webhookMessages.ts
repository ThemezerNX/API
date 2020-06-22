import webhook from 'webhook-discord'

export const packMessage = new webhook.MessageBuilder()
	.setName('Packs')
	.setText('New Pack submission!')
	.setColor('#b40a86')
	.setTime()

// .setTitle(name)
// .setDescription(description)
// .setAuthor(name, iconurl, creator_page_url)
// .addField('Themes in this pack:', string)
// .setThumbnail(thumbnailURL)
// .setURL(url)

export const themeMessage = new webhook.MessageBuilder()
	.setName('Themes')
	.setText('New Theme submission!')
	.setColor('#0ab379')
	.setTime()

// .setTitle(name)
// .setDescription(description)
// .setAuthor(name, iconurl, creator_page_url)
// .setThumbnail(thumbnailURL)
// .setURL(url)
