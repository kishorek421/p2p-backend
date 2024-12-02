const vision = require('@google-cloud/vision');
const path = require('path');

const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '../godeskmap-cd553715665f.json'), // Replace with your key file path
});

exports.findFace = async (req, res) => {
    try {
        try {
            const filePath = req.file.path;
            const [result] = await client.faceDetection(filePath);
            const faces = result.faceAnnotations;

            if (!faces || faces.length === 0) {
                return res.status(404).json({ msg: 'No faces detected.', status: 400, success: false });
            }

            // Extract liveliness details
            const response = faces.map((face, index) => ({
                face: index + 1,
                joyLikelihood: face.joyLikelihood,
                angerLikelihood: face.angerLikelihood,
                surpriseLikelihood: face.surpriseLikelihood,
                landmarkingConfidence: face.landmarkingConfidence,
            }));

            res.json({ data: response, success: true, status: 200 });
        } catch (error) {
            console.error('Error analyzing image:', error);
            res.status(400).json({ msg: 'Error analyzing image', status: 400, success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}