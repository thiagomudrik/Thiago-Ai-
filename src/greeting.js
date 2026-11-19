function getGreeting(phone, name) {
    const n = name ? name.split(" ")[0] : "Boss"
    const h = new Date().getHours()
    const t = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
    return `${t} ${n} 🌍\n\nWelcome to THIAGO AI 🚀\nI'm your smart assistant - Ask me anything!\n\nHow may I help you today?`
}
module.exports = { getGreeting }
