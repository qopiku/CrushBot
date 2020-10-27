const { create, client, Client } = require('@open-wa/wa-automate')
const { color } = require('./utils')
const options = require('./utils/options')

const start = (client = new Client()) => {
    console.log('[DEV]', color('sProDev', 'yellow'))
    console.log('[CLIENT] CLIENT Started!')

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT') client.forceRefocus()
    })

    client.getAllChats()
    .then((res) => {
        for (var i = 0; i < res.length; i++) {
            var nomer = res[i].id
            client.sendLinkWithAutoPreview(nomer, `https://crush.suluh.my.id`, `Halo semua pengguna FROBOT😄\nApa kabar kalian? semoga tetap sehat selalu yaa.. Kangen FROBOT nggak nihh?\n\nSayang banget ya FROBOT udah nggak beroperasi lagi dan udah bukan bot serba guna lagi buat kamu yang mau bikin stiker, cari gambar doi lewat pinterest, ataupun download video tiktok sampe download video youtube jadi file musik.\n\nTapi nih tapi, ada kabar gembira loh buat kalian. Sekarang FROBOT udah ganti nama jadi *CrushBot*, hah? lalu apa kegunaan CrushBot?\nKalian pasti nggak asing dong sama Anonymous Chat? ituloh, bot yang bisa chattingan sama orang nggak dikenal (anonymous) di platform Telegram.\n\nNAH!!!!!\nCrushBot adalah bot WhatsApp pertama yang menerapkan Anonymous Chat dari Telegram ke platform WhatsApp loh! Bangga nggak bangga nggak? hehe\n\nAyo ikut sebarin nomor WhatsApp bot ini, biar cari pasangan chatnya makin gampang, support CrushBot terus yaa... Kalian yang punya aplikasi dan akun tiktok nya sedikit aktif, boleh banget loh bikin bot ini jadi konten\n\nLink yg harus disebar mana nih kak? tenang aja udah disediaiin kok, tinggal disebar aja, nih linknya:\nhttps://crush.suluh.my.id\n\nTerimakasih semuanya🤗`)
        }
    })
}

create('sProDev', options(true, start))
    .then((client) => start(client))
    .catch((err) => new Error(err))