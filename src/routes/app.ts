import { Router } from "express";
import fs from 'fs'
import { currentStorageDrive, upload } from "../controller/storage";
import { deleteObjectCrontroller, getObjectController, insertObjectController } from "../controller/object";

const route = Router()


// Object Store [PUT]
route.put('/:bucket/:object', upload.single("file"), async (req, res) => {
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
route.head('/:bucket/:object', async (req, res) => {
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
route.get('/:bucket/:object', async (req, res) => {
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
route.delete('/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params
    const data = await deleteObjectCrontroller(bucket, object)
    res.json({ message: data })
})

export default route;
