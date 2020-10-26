exports.help = () => {
    return `CrushBot adalah bot yang digunakan untuk mengobrol secara anonim dengan orang asing di WhatsApp. Bot ini masih dalam tahap pengembangan dan saat ini hanya mendukung pesan teks, foto, voice note dan stiker saja (tidak dengan stiker bergerak).

*Peringatan*
Jika kamu mengirimkan stiker mungkin sedikit lambat untuk sampai ke pasangan!
Media seperti video, document, location, audio, dan vcard (kontak) tidak akan diterima pasangan!

*Harap selalu cek info kontak WhatsApp Bot ini yaa :D*`
}

exports.commands = () => {
    return `*/search* — Temukan pasangan baru
*/next* — Hentikan percakapan ini dan temukan pasangan baru
*/stop* — Hentikan percakapan ini
*/sharecontact* — Kirim kontak WhatsApp kamu kepasangan
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
    return `*CrushBot*

Dikelola dan Dikembangkan oleh @suluh_s
Dipublikasikan pada tanggal 31 Oktober 2020

Server yang digunakan
2 Core - 4GB RAM

Silahkan donasi untuk perpanjangan server dan peningkatan spesifikasi server

Statistik Bot
Personal Chat : ${data.chatroom}
Pesan Termuat : ${data.messages}`
}

exports.donate = () => {
    return `Apabila kamu menyukai dan merasa terbantu oleh adanya bot ini, kamu bisa donasi seikhlasnya menggunakan salah satu link dibawah agar bot dapat terus aktif dan dirawat dengan baik

*GLOBAL*
[buymeacoffee] https://buymeacoffee.com/sdev
[ko-fi] https://ko-fi.com/sprodev

*INDONESIA*
[saweria] https://saweria.co/sprodev
[trakteer] https://trakteer.id/sprodev`
}