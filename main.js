import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { promises as fs } from 'fs'
import { convertAndSaveAudio } from 'light-audio-converter';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.on(message('voice'), async (ctx) => {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const response = await fetch(link)
    if (!response.ok) {
        throw new Error(`Error downloading file ${response.status} : ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `voice_${Date.now()}`
    const originalFormat = '.oga'
    const originalFullName = fileName + originalFormat
    await fs.writeFile(originalFullName, buffer)
    console.log(`file saved ${fileName}`)
    const targetFormat = 'mp3'
    await convertAndSaveAudio(originalFullName, targetFormat, `${fileName}.${targetFormat}`)
    ctx.sendAudio({source: `${fileName}.${targetFormat}`})
})
bot.launch()
console.log("bot started")