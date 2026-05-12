const { Telegraf } = require('telegraf');
const nodemailer = require('nodemailer');
const config = require('./config');

const bot = new Telegraf(config.botToken);
let targetEmails = []; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.emailConfig.user, pass: config.emailConfig.pass }
});

const getBanner = (ctx) => {
    const user = ctx.from.username ? `@${ctx.from.username}` : 'User';
    const userId = ctx.from.id;
    return `
╭──────( **CHINA** )──────╮
│✘ᴜsᴇʀ: **${user}**
│✘ᴜsᴇʀɪᴅ: \`${userId}\`
│✘sᴛᴀᴛᴜs: **KAPTEN**
╠────────────────╣
┃
│□ \`/addemail\` [tambah email target]
│□ \`/addallemail\` [tambah email semua]
│□ \`/listemail\` [list email target]
╠────────────────╣
┃
│□ \`/spammsg\` [send pesan all]
╰──────( **CHINA** )──────╯
© **China Ror Executions** 〽️
    `;
};

bot.start((ctx) => {
    if (config.videoLink && config.videoLink !== 'DI_SINI_LINK_VIDEO_ABANG') {
        ctx.replyWithVideo(config.videoLink, { caption: getBanner(ctx), parse_mode: 'Markdown' });
    } else {
        ctx.reply(getBanner(ctx), { parse_mode: 'Markdown' });
    }
});

bot.command('addemail', (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email) return ctx.reply('⚠️ Contoh: /addemail target@mail.com');
    targetEmails.push(email);
    ctx.reply(`✅ 1 Email ditambahkan!`);
});

bot.command('addallemail', (ctx) => {
    const input = ctx.message.text.replace('/addallemail ', '');
    if (!input || input === '/addallemail') return ctx.reply('⚠️ Masukkan daftar email dipisah koma!');
    const list = input.split(',').map(e => e.trim());
    targetEmails = targetEmails.concat(list);
    ctx.reply(`✅ ${list.length} Email ditambahkan ke list tempur!`);
});

bot.command('listemail', (ctx) => {
    if (targetEmails.length === 0) return ctx.reply('Kosong Bang!');
    ctx.reply(`**TARGET LIST:**\n${targetEmails.join('\n')}`, { parse_mode: 'Markdown' });
});

bot.command('spammsg', async (ctx) => {
    if (targetEmails.length === 0) return ctx.reply('Target belum di-input!');
    ctx.reply('🚀 **EXECUTING...** Sending to all targets!');
    
    let ok = 0;
    for (const m of targetEmails) {
        try {
            await transporter.sendMail({
                from: `"Global Health Support" <${config.emailConfig.user}>`,
                to: m,
                subject: config.emailSubject,
                html: config.emailBody
            });
            ok++;
        } catch (e) { console.log("Error skip..."); }
    }
    ctx.reply(`✅ **DONE!** ${ok} Email terkirim.\n💰 **DUARRR CAIR!**`, { parse_mode: 'Markdown' });
});

bot.launch().then(() => console.log('TIM SUKA-SUKA AKTIF! 🚀'));
