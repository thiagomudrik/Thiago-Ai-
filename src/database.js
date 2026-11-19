const mongoose = require("mongoose")
const User = mongoose.model("User", new mongoose.Schema({ phone: String, name: String, lastChat: Date }))
async function saveUser(phone, name, updateTime = false) {
    let u = await User.findOne({ phone })
    if (!u) u = new User({ phone, name, lastChat: new Date() })
    else { u.name = name; if (updateTime) u.lastChat = new Date() }
    await u.save(); return u
}
async function getUser(phone) { return await User.findOne({ phone }) }
module.exports = { saveUser, getUser }
