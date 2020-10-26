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
            client.sendLinkWithAutoPreview(nomer, `https://instagram.com/suluh_s`, `Selamat sore semua pengguna CrushBot😄\nSebelumnya kenalin saya Suluh Sulistiawan, author dari bot ini.\n\nCrushBot adalah bot pertama yang menerapkan Anonymous Chat dari platform Telegram ke WhatsApp.\nBot ini dibangun hanya dalam kurun waktu satu setengah hari, tepatnya pada hari Sabtu 24 Oktober sampai hari Minggu 25 Oktober 2020. CrushBot sendiri dijadwalkan rilis pada tanggal 31 Oktober, namun karena banyaknya permintaan untuk cepat-cepat di rilis, maka saya mencoba mempublikasikan "versi uji coba" hari Minggu sekitar pukul 22.00 WIB.\n\nPagi tadi teman saya mencoba menjadikan bot ini konten di video tiktoknya, dan tidak disangka ternyata viewer yang didapat hingga 9K lebih hanya dalam beberapa jam (masuk FYP yeyy). Permintaan pengguna yang tiba-tiba melonjak ini membuat server yang dipakai menjadi overload dan mengalami down. Saat ini server tidak dapat diakses dan pesan ini dikirim melalui laptop kentanq yang saya gunakan.\n\nSaya minta maaf atas ketidaknyamanannya, mungkin CrushBot akan kembali dalam beberapa hari kedepan :)\n\nServer yang dipakai:\n1 Core - 2GB RAM\n\n*FAQ*\nKOK RESPON BOT NYA LAMBAT?\nBeberapa faktor yang menyebabkan respon bot lambat antara lain seperti: kecepatan koneksi host atau koneksi server yang lambat, permintaan pengguna yang terlalu banyak, atau automator yang kecapean dan kebingungan akan merespon yang mana lebih dulu.\n\nKOK DI TELEGRAM LANCAR-LANCAR AJA?\nTelegram merupakan platform sosial media yang sangat mendukung developernya berkembang, salah satu buktinya adalah menyediakan layanan official bot. sedangkan WhatsApp? WhatsApp hanya menyediakan layanan bot untuk pebisnis dimana pengembang harus memiliki budget senilai 20 juta dengan aturan yang sangat ketat. Saya membuat bot ini dengan platform _unofficial_ dan tentunya rawan akan banned dari pihak facebook.\n\nJika ada pertanyaan atau ingin donasi dengan sedikit uang silahkan bisa dm instagram saya di https://instagram.com/suluh_s`)
            // client.sendLinkWithAutoPreview(nomer, `https://crush.suluh.my.id`, `Halo semua pengguna FROBOT😄\nApa kabar kalian? semoga tetap sehat selalu yaa.. Kangen FROBOT nggak nihh?\n\nSayang banget ya FROBOT udah nggak beroperasi lagi dan udah bukan bot serba guna lagi buat kamu yang mau bikin stiker, cari gambar doi lewat pinterest, ataupun download video tiktok sampe download video youtube jadi file musik.\n\nTapi nih tapi, ada kabar gembira loh buat kalian. Sekarang FROBOT udah ganti nama jadi *CrushBot*, hah? lalu apa kegunaan CrushBot?\nKalian pasti nggak asing dong sama Anonymous Chat? ituloh, bot yang bisa chattingan sama orang nggak dikenal (anonymous) di platform Telegram.\n\nNAH!!!!!\nCrushBot adalah bot WhatsApp pertama yang menerapkan Anonymous Chat dari Telegram ke platform WhatsApp loh! Bangga nggak bangga nggak? hehe\n\nAyo ikut sebarin nomor WhatsApp bot ini, biar cari pasangan chatnya makin gampang, support CrushBot terus yaa... Kalian yang punya aplikasi dan akun tiktok nya sedikit aktif, boleh banget loh bikin bot ini jadi konten\n\nLink yg harus disebar mana nih kak? tenang aja udah disediaiin kok, tinggal disebar aja, nih linknya:\nhttps://crush.suluh.my.id\n\nTerimakasih semuanya🤗`)
        }
    })
}

create('sProDev', options(true, start))
    .then((client) => start(client))
    .catch((err) => new Error(err))