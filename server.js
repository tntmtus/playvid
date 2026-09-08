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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute untuk menyajikan file statis (HTML dan video)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint untuk Upload Video
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
        const videoList = files.map(file => ({
            name: file,
            url: `/uploads/${file}`
        }));
        res.json(videoList);
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
