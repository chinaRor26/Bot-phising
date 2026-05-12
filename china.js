const { Telegraf } = require('telegraf');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const config = require('./config');

const bot = new Telegraf(config.botToken);
const DB_FILE = './database.json';

// Fungsi Baca & Simpan Database
async function loadDB() {
    if (!await fs.pathExists(DB_FILE)) await fs.writeJson(DB_FILE, []);
    return await fs.readJson(DB_FILE);
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
│✘ᴜsᴇʀɪᴅ: \`${ctx.from.id}\`
│✘sᴛᴀᴛᴜs: **KAPTEN**
╠────────────────╣
┃
│□ \`/addemail\` [tambah email target]
│□ \`/addallemail\` [tambah email semua]
│□ \`/listemail\` [list email target]
│□ \`/clearemail\` [hapus semua database]
╠────────────────╣
┃
│□ \`/spammsg\` [send pesan all]
╰──────( **CHINA** )──────╯
© **China Ror Executions** 〽️`;
};

bot.start((ctx) => {
    if (config.videoLink) {
        ctx.replyWithVideo(config.videoLink, { caption: getBanner(ctx), parse_mode: 'Markdown' });
    } else {
        ctx.reply(getBanner(ctx), { parse_mode: 'Markdown' });
    }
});

// Tambah satu email ke database
bot.command('addemail', async (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email) return ctx.reply('⚠️ Format: /addemail email@target.com');
    let db = await loadDB();
    if (db.includes(email)) return ctx.reply('❌ Email sudah ada di database!');
    db.push(email);
    await saveDB(db);
    ctx.reply(`✅ Berhasil simpan: ${email}`);
});

// Tambah banyak email sekaligus (Pake Koma)
bot.command('addallemail', async (ctx) => {
    const input = ctx.message.text.replace('/addallemail ', '');
    if (!input || input === '/addallemail') return ctx.reply('⚠️ Masukkan email dipisah koma!');
    const list = input.split(',').map(e => e.trim());
    let db = await loadDB();
    let count = 0;
    list.forEach(e => {
        if (!db.includes(e)) { db.push(e); count++; }
    });
    await saveDB(db);
    ctx.reply(`✅ Berhasil nambah ${count} email baru ke database!`);
});

// Cek isi database
bot.command('listemail', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('📭 Database kosong!');
    ctx.reply(`**DATABASE TARGET (${db.length}):**\n\n${db.join('\n')}`, { parse_mode: 'Markdown' });
});

// Hapus semua database
bot.command('clearemail', async (ctx) => {
    await saveDB([]);
    ctx.reply('🗑️ Database berhasil dikosongkan!');
});

// Eksekusi Spam
bot.command('spammsg', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('❌ Gak ada target di database!');
    
    ctx.reply(`🚀 **EXECUTING...** Mengirim ke ${db.length} target!`);
    let success = 0;
    for (const email of db) {
        try {
            await transporter.sendMail({
                from: `"Global Health Support" <${config.emailConfig.user}>`,
                to: email,
                subject: config.emailSubject,
                html: config.emailBody
            });
            success++;
        } catch (e) { console.log(`Gagal ke ${email}`); }
    }
    ctx.reply(`✅ **MISSION COMPLETE!**\nTotal: ${success} Email terkirim.\n💰 **DUARRRR CAIR!**`, { parse_mode: 'Markdown' });
});

bot.launch().then(() => console.log('TIM SUKA-SUKA MODE DATABASE AKTIF! 🚀'));
