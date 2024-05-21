const fs = require('fs');
const path = require('path');
const File = require('../../models/File');

const uploadFile = async (req, res) => {

    try {
        const file = req.file;
        const relativePath = path.relative(path.join(__dirname, '../../public'), file.path).replace(/\\/g, '/');
        const originalName = file.filename;
        const mimetype = file.mimetype;

        const uploadedFile = await File.create({ name: originalName, path: relativePath, mimetype });
        res.render('upload/upload', { message: 'File uploaded successfully', error: null, data: uploadedFile });
    } catch (error) {
        console.error(error);
        res.render('upload/upload', { message: null, error: 'Internal server error' });
    }
}

const serveFile = (req, res) => {

    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../../public/uploads', fileName);

    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        const fileExtension = path.extname(fileName).toLowerCase();

        const mimeTypeMap = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            // Add other MIME types as needed
        };

        const contentType = mimeTypeMap[fileExtension];

        if (!contentType) {
            return res.status(400).send('Unsupported file type');
        }

        if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(filePath, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                };
                res.writeHead(200, head);
                fs.createReadStream(filePath).pipe(res);
            }
        } else {
            res.setHeader('Content-Type', contentType);
            fs.createReadStream(filePath).pipe(res);
        }
    } else {
        res.status(404).send('File not found');
    }
}

const getAllFiles = async (req, res) => {
    /* try {
        const files = await File.findAll();
        res.render('upload/files', { files, error: null });
    } catch (error) {
        console.error(error);
        res.render('upload/files', { files: [], error: 'Internal server error' });
    } */

    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const { count, rows: files } = await File.findAndCountAll({
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']]
        });

        // Retrieve total count of files for pagination
        const totalCount = await File.count();

        // Determine the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        // Check if the requested page is within the available range
        if (page > totalPages) {
            // Redirect to the last available page
            // return res.redirect(`/files?page=${totalPages}&pageSize=${pageSize}`);
            return res.redirect(`/files`);
        } else if (page < 1) {
            // Redirect to the first page
            // return res.redirect(`/files?page=1&pageSize=${pageSize}`);
            return res.redirect(`/files`);
        }

        res.render('upload/files', { 
            files, 
            req,
            totalCount: count, 
            currentPage: page, 
            pageSize, 
            error: null 
        });
    } catch (error) {
        console.error(error);
        res.render('upload/files', { 
            files: [], 
            error: 'Error fetching files', 
            req, 
            currentPage: 1, 
            totalCount: 1  
        });
    }
}

module.exports = { uploadFile, serveFile, getAllFiles }