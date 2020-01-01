const Telegraf = require('telegraf')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

function mimic (ctx, target) {
  return Promise.all([
    ctx.getChatMember(target).then(res => {
      let description = ''
      let title = ''
      if (res.user.username) {
        description = `@${res.user.username}`
      }
      if (res.user.last_name) {
        title = `${res.user.first_name} ${res.user.last_name}`
      } else {
        title = res.user.first_name
      }
      return Promise.all([
        ctx.setChatTitle(title),
        ctx.setChatDescription(description).catch(() => { return this })
      ])
    }),
    ctx.telegram.getUserProfilePhotos(target)
      .then(res => ctx.telegram.getFileLink(res.photos[0][res.photos[0].length - 1].file_id))
      .then(file => ctx.setChatPhoto({
        url: file,
        filename: 'avatar.jpg'
      }))
  ]).catch(err => ctx.reply(err.description))
}

bot.command('mimic', ctx => {
  const targetUserId = ctx.message.text.split(' ', 2)[1]
  if (!targetUserId || typeof parseInt(targetUserId, 10) !== 'number') {
    return ctx.reply('Invalid argument!')
  }

  return mimic(ctx, targetUserId)
})

function beMimic (str) {
  bot.hears(str, ctx => {
    return Promise.all([
      ctx.pinChatMessage(ctx.message.message_id).catch(err => ctx.reply(err.description)),
      mimic(ctx, ctx.from.id)
    ])
  })
}

[
 '草', '噗', '艸', '艹', 'mdzz'
].forEach(s => beMimic(s))
bot.launch().catch(console.error)
