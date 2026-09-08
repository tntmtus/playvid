const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Buat folder uploads jika belum ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Konfigurasi penyimpanan file menggunakan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Mengambil judul kustom dari form jika ada, atau fallback ke nama asli
        const customTitle = req.body.title ? req.body.title.replace(/[^a-zA-Z0-9-_]/g, '_') : '';
        const ext = path.extname(file.originalname);
        const filename = customTitle ? `${customTitle}-${Date.now()}${ext}` : `${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

// Middleware dengan batasan ukuran file besar (500MB)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Rute untuk menyajikan file statis (HTML dan video)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint untuk Upload Video (Mendukung Judul Kustom)
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah!' });
    }
    res.json({ message: 'Video berhasil diunggah!', filename: req.file.filename });
});

// Endpoint untuk Mengambil Daftar Video
app.get('/videos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal membaca direktori video' });
        }
        const videoList = files.map(file => {
            return {
                name: file,
                url: `/uploads/${file}`
            };
        });
        res.json(videoList);
    });
});

// Endpoint untuk Menghapus Video
app.delete('/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal menghapus file video' });
            }
            res.json({ message: 'Video berhasil dihapus!' });
        });
    } else {
        res.status(404).json({ message: 'File video tidak ditemukan' });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
