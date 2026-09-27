# Certificate Generator → WhatsApp

Certificates banao aur har person ko seedha unke WhatsApp pe bhejo.

## Setup (sirf pehli baar)

1. Node.js 18+ install hona chahiye.
2. Is folder mein terminal kholo aur chalao:
   ```
   npm install
   npm start
   ```
3. Browser mein kholo: http://localhost:3001/index.html

> **Purana version install kiya tha?** Pehle `node_modules` folder aur `package-lock.json` delete karo, phir `npm install` dobara chalao.
> `vendor/whatsapp-web.js` folder ko delete mat karna — isme WhatsApp library ka fixed version hai (July 2026 WhatsApp update ke baad wala fix).

## Kaise use karein

1. Certificate ki image drop karo (PNG/JPG).
2. Excel/CSV upload karo, jisme ek column mein phone numbers hon (jaise `Mobile`, `Phone`, `WhatsApp`).
3. Column chips ko certificate pe drag karke naam wagairah set karo.
4. **Connect WhatsApp (QR)** dabao, phir phone pe WhatsApp → Linked devices → Link a device → QR scan karo.
   (Ek baar scan karne ke baad dobara nahi karna padega.)
5. **Country code** check karo (India = 91) aur **Phone column** select karo.
6. **Write Message** mein caption likho, jaise `Hi {{firstName}}, congrats! 🎉`
7. **Send Certificates on WhatsApp** dabao.

## Dhyan rakhein

- Message aapke apne WhatsApp number se jaata hai. Har message ke beech 3–7 second ka gap rakha gaya hai.
- Bahut zyada (sainkdon) messages un logon ko ek saath mat bhejo jinke paas aapka number saved nahi hai, warna WhatsApp aapka number block kar sakta hai. Pehle chhote batch mein try karo.
- Jo number WhatsApp pe nahi hai, uska error log mein dikh jaata hai.
- Log out karna ho to Connect WhatsApp → **Log out** dabao.
