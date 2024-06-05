const path = require('path');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

exports.saveRecording = async (req, res) => {
    try {
        if (!req.files || !req.files.recording) {
            return res.status(400).send('No recording uploaded.');
        }

        const { caller, receiver, duration } = req.body;
        const recording = req.files.recording;
        const recordingPath = path.join(__dirname, '../recordings', `${Date.now()}-${recording.name}`);

        recording.mv(recordingPath, async (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            const newCall = await Call.create({
                caller,
                receiver,
                duration,
                recordingPath
            });

            res.json(newCall);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving recording.');
    }
};