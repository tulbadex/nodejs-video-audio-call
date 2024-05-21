const multer = require('multer');
const config = require('../config/config');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../' + config.UPLOAD_DIR))
    },
    filename: function (req, file, cb) {
        /* const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); */
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, `${timestamp}-${sanitizedOriginalName}`);
    }
});

// File filter to restrict the types of files that can be uploaded
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav',
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only videos, audios, images, PDFs, and office documents are allowed.'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024  // 50 MB
    }
});


module.exports = upload;