exports.start = () => {
    return `Hai! selamat datang di CrushBot.
` + this.help()
}

exports.help = () => {
    return `*CrushBot* adalah bot yang digunakan untuk mengobrol secara anonim dengan orang asing di WhatsApp. Bot ini masih dalam tahap pengembangan dan saat ini hanya mendukung pesan teks, foto, voice note dan stiker saja (tidak dengan stiker bergerak).

*PERINGATAN!*
Jika kamu mengirimkan stiker mungkin sedikit lambat untuk sampai ke partner!
*Jadi tolong jangan bebani bot ini dengan stiker🙂*
Media seperti video, document, location, audio, dan vcard (kontak) tidak akan diterima partner!
*Harap selalu cek info kontak WhatsApp Bot ini yaa😊*

Gunakan perintah-perintah berikut.
`+ this.commands()
}

exports.commands = () => {
    return `*/search* — Temukan partner baru
*/next* — Hentikan percakapan ini dan temukan partner baru
*/stop* — Hentikan percakapan ini
*/sharecontact* — Kirim kontak WhatsApp kamu kepartner
*/about* — Baca sekilas informasi tentang CrushBot
*/donate* — Donasi ke CrushBot`
}

exports.terms = () => {
    return ``
}

exports.rules = () => {
    return ``
}

exports.about = (data) => {
    return `*CrushBot v0.1.0*
Dikelola dan Dikembangkan oleh @suluh_s

Tanggal publikasi
[v0.0.1] 26 Oct 2020
[v0.1.0] 28 Dec 2020

Server yang digunakan
4 Core - 8GB RAM

Jika kamu merasa terbantu dan memiliki sedikit rezeki untuk dibagikan, boleh banget dong donasi buat perpanjangan server dan peningkatan spesifikasi server😊

Statistik Bot
Personal Chat : ${data.chatroom}
Pesan Termuat : ${data.messages}`
}

exports.donate = () => {
    return `Apabila kamu merasa terbantu oleh adanya bot ini dan memiliki sedikit rezeki untuk dibagikan, kamu bisa memberikan dukungan berupa donasi seikhlasnya menggunakan salah satu link dibawah agar bot dapat terus aktif dan dirawat dengan baik

*GLOBAL*
[buymeacoffee] https://buymeacoffee.com/sdev
[ko-fi] https://ko-fi.com/sprodev

*INDONESIA*
[saweria] https://saweria.co/sprodev
[trakteer] https://trakteer.id/sprodev`
}