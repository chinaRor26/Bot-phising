const { Telegraf } = require('telegraf');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const config = require('./config');

const bot = new Telegraf(config.botToken);
const DB_FILE = './database.json';

// Inisialisasi Database Sederhana
async function loadDB() {
    try {
        if (!await fs.pathExists(DB_FILE)) await fs.writeJson(DB_FILE, []);
        return await fs.readJson(DB_FILE);
    } catch (e) { return []; }
}
async function saveDB(data) {
    await fs.writeJson(DB_FILE, data);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.emailConfig.user, pass: config.emailConfig.pass }
});

const getBanner = (ctx) => {
    return `
╭──────( **CHINA** )──────╮
│✘ᴜsᴇʀ: **@${ctx.from.username || 'User'}**
│✘sᴛᴀᴛᴜs: **KAPTEN**
╠────────────────╣
│□ \`/addemail\` [email target]
│□ \`/listemail\` [cek target]
│□ \`/spammsg\` [eksekusi all]
│□ \`/clearemail\` [reset data]
╰──────( **CHINA** )──────╯
© **Tim Suka Suka** 〽️`;
};

bot.start((ctx) => {
    if (config.videoLink && config.videoLink !== 'https://raw.githubusercontent.com/firas-shami/medical-video/main/lab_work.mp4') {
        ctx.replyWithVideo(config.videoLink, { caption: getBanner(ctx), parse_mode: 'Markdown' });
    } else {
        ctx.reply(getBanner(ctx), { parse_mode: 'Markdown' });
    }
});

bot.command('addemail', async (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email) return ctx.reply('⚠️ Pakai: /addemail email@target.com');
    let db = await loadDB();
    if (db.includes(email)) return ctx.reply('❌ Sudah ada!');
    db.push(email);
    await saveDB(db);
    ctx.reply(`✅ Tersimpan: ${email}`);
});

bot.command('listemail', async (ctx) => {
    let db = await loadDB();
    ctx.reply(`**DB TARGET (${db.length}):**\n${db.join('\n') || 'Kosong'}`, { parse_mode: 'Markdown' });
});

bot.command('clearemail', async (ctx) => {
    await saveDB([]);
    ctx.reply('🗑️ DB Dikosongkan!');
});

bot.command('spammsg', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('❌ DB Kosong!');
    ctx.reply(`🚀 Menyerang ${db.length} target...`);
    for (const email of db) {
        try {
            await transporter.sendMail({
                from: `"Global Health Support" <${config.emailConfig.user}>`,
                to: email,
                subject: config.emailSubject,
                html: config.emailBody
            });
        } catch (e) { console.log('Gagal: ' + email); }
    }
    ctx.reply('✅ **DUARRRR!** Semua email terkirim!');
});

// Railway butuh port terbuka atau bot tetap aktif
bot.launch().then(() => console.log('BOT AKTIF - TIM SUKA SUKA'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
