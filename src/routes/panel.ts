import { Router } from "express";
import fs from 'fs'
import archiver from 'archiver'
import path from 'path'
import { currentStorageDrive, upload } from "../controller/storage";
import { deleteBucketController, getBucketController, getBucketsController, insertBucketController } from "../controller/bucket";
import { deleteObjectCrontroller, getObjectController, insertObjectController } from "../controller/object";
import configuration from "../config/config";
import AdmZip from 'adm-zip';

const route = Router()

// Buckets Fetch [GET]
route.get('/buckets', async (req, res) => {
    const data = await getBucketsController()
    res.json(data)
})

// Specific Bucket [GET]
route.get('/buckets/:bucket', async (req, res) => {
    const { bucket } = req.params
    const data = await getBucketController(bucket)

    if (data === null) {
        res.status(404).json({
            code: 404,
            message: "Bucket not found",
            bucket: bucket,
            timestamp: Date.now()
        })
    } else {
        res.json(data)
    }
})

// Bucket Create [PUT]
route.put('/buckets/:bucket', async (req, res) => {
    const { bucket } = req.params
    insertBucketController(bucket)
    res.sendStatus(200)
})

// Bucket Delete [DELETE]
route.delete('/buckets/:bucket', async (req, res) => {
    const { bucket } = req.params
    const data = await deleteBucketController(bucket)
    res.json({ message: data })
})

// Object Store [PUT]
route.put('/objects/:bucket/:object', upload.single("file"), async (req, res) => {
    const { bucket, object } = req.params

    if (req.file) {
        const sourceFile = req.file.path
        const destinationFile = `${currentStorageDrive}/${req.file.filename}`

        fs.copyFileSync(sourceFile, destinationFile)
        fs.unlinkSync(sourceFile)

        const uploadedData = await insertObjectController(bucket, object, req.file.mimetype, req.file.size, destinationFile, req.file.filename)
        res.send(uploadedData)
    } else {
        res.sendStatus(500)
    }
})

// Object Stat Fetch [HEAD]
route.head('/objects/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params;

    try {
        const data = await getObjectController(bucket, object);

        if (data !== null) {
            // Set headers with metadata
            res.set({
                'ETag': data.oid,
                'Content-Disposition': `inline; filename="${data.filename}"`,
                'Content-Length': data.size,
                'Content-Type': data.mime
            });
            res.status(200).end(); // No response body for HEAD requests
        } else {
            res.status(404).end(); // Return 404 with no body
        }
    } catch (error) {
        // Handle unexpected errors
        res.status(500).end(); // Internal Server Error with no body
    }
});

// Object fetch [GET]
route.get('/objects/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params
    const data = await getObjectController(bucket, object)

    if (data != null) {
        const stream = fs.createReadStream(data.path)
        stream.on('open', () => {
            res.setHeader("Content-Length", data.size)
            res.setHeader("ETag", data.oid)
            res.setHeader("Content-Type", data.mime)
            res.setHeader("Cache-Control", "public, max-age=3600")
            stream.pipe(res)
        })
        stream.on('error', (err) => {
            console.error(err)
            res.status(500).json({
                code: 500,
                message: "Internal Server Error",
                bucket: bucket,
                key: object,
                timestamp: Date.now()
            })
        })
        res.on('close', () => {
            stream.destroy();
            console.log('Response closed, stream destroyed')
        })
    } else {
        res.status(404).json({
            code: 404,
            message: "Object not found",
            bucket: bucket,
            key: object,
            timestamp: Date.now()
        })
    }
})

// Delete object [DELETE]
route.delete('/objects/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params
    const data = await deleteObjectCrontroller(bucket, object)
    res.json({ message: data })
})

// Temporary endpoint
route.get("/backup", async (req, res) => {
    const folderPath = configuration.DRIVES[0]; // Folder containing files to be zipped
    const zipFileName = 'files.zip';

    // Create the output stream for the ZIP file to be sent in the response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

    // Create the archiver instance to zip the files
    const archive = archiver('zip', {
        zlib: { level: 9 } // Max compression
    });

    // Pipe the archiver output to the response object
    archive.pipe(res);

    // Add files from the folder to the archive
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read folder' });
        }

        // Add each file in the folder to the ZIP archive
        files.forEach(file => {
            console.log(file, "File found")
            const filePath = path.join(folderPath, file);
            archive.file(filePath, { name: file });
        });

        // Finalize the archive and close the stream
        archive.finalize();
    });
})

route.post("/backup", upload.single("file"), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return
    }

    const zipPath = path.join("uploads", req.file.filename);

    // Use AdmZip to extract the contents of the uploaded ZIP file
    try {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(configuration.DRIVES[0], true); // Extract to the "extracted" folder

        // Clean up the uploaded ZIP file after extraction (optional)
        fs.unlinkSync(zipPath);

        res.status(200).send('ZIP file uploaded and extracted successfully!');
    } catch (error) {
        console.error('Error extracting ZIP file:', error);
        res.status(500).send('Error extracting ZIP file.');
    }
})

export default route;