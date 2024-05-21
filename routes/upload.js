const router = require('express').Router();
const { uploadFile, serveFile, getAllFiles } = require('../controllers/upload/upload')
const upload = require('../utils/utils');
const multer = require('multer');


router.get('/', (req, res) => {
    res.render('upload/upload', { message: null, error: null });
});

router.post('/', (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            let errorMsg = 'An error occurred while uploading the file.';
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                errorMsg = err.message;
            } else if (err.message) {
                // An unknown error occurred when uploading.
                errorMsg = err.message;
            }
            return res.render('upload/upload', { message: null, error: errorMsg });
        }
        // Everything went fine.
        next();
    });
}, uploadFile);

router.get(
    '/serverfile/:fileName',
    serveFile,
);

router.get(
    '/files',
    getAllFiles,
);

module.exports = router;