const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")
const P = require("pino")
const mongoose = require("mongoose")
require("dotenv").config()
const { getGreeting } = require("./greeting")
const { askQwen } = require("./ai")
const { setProfile } = require("./profile")
const { saveUser, getUser } = require("./database")

async function startThiago() {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("✅ MongoDB connected")
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")
    const sock = makeWASocket({ auth: state, logger: P({ level: "silent" }), browser: ["THIAGO AI", "Chrome", "1.0.0"] })
    if (!sock.authState.creds.registered) {
        const num = process.env.BOT_PHONE_NUMBER
        setTimeout(async () => {
            if (num) {
                try {
                    const code = await sock.requestPairingCode(num)
                    console.log(`\n🔑 PAIRING CODE FOR ${num}: ${code}\nCopy am go WhatsApp > Linked Devices > Link with phone number`)
                } catch(e){ console.log("Pairing error:", e.message) }
            } else console.log("❌ Add BOT_PHONE_NUMBER in .env")
        }, 3000)
    }
    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("connection.update", async (u) => {
        const { connection, lastDisconnect } = u
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startThiago()
        } else if (connection === "open") {
            console.log("✅ THIAGO AI ONLINE - bot-hosting.net ready!")
            await setProfile(sock)
        }
    })
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return
        const jid = m.key.remoteJid
        const phone = jid.split("@")[0]
        const pushName = m.pushName || "Boss"
        const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
        if (!text) return
        let user = await getUser(phone)
        if (!user) await saveUser(phone, pushName)
        const isGreet = /^(hi|hello|hey|good morning|afternoon|evening|yo|sup)$/i.test(text.trim())
        if (!user || isGreet) {
            await sock.sendMessage(jid, { text: getGreeting(phone, pushName) })
            await saveUser(phone, pushName, true)
            if (!user && isGreet) return
        }
        const reply = await askQwen(text, pushName)
        await sock.sendMessage(jid, { text: reply })
        await saveUser(phone, pushName, true)
    })
}
startThiago()
