import { Router } from "express";
import fs from 'fs'
import { currentStorageDrive, upload } from "../controller/storage";
import { deleteBucketController, getBucketController, getBucketsController, insertBucketController } from "../controller/bucket";
import { deleteObjectCrontroller, getObjectController, insertObjectController } from "../controller/object";


const appRoute = Router()

// Buckets Fetch [GET]
appRoute.get('/buckets', async (req, res) => {
    const data = await getBucketsController()
    res.json(data)
})

// Specific Bucket [GET]
appRoute.get('/buckets/:bucket', async (req, res) => {
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

// Bucket Create [POST]
appRoute.post('/buckets/:bucket', async (req, res) => {
    const { bucket } = req.params
    insertBucketController(bucket)
    res.sendStatus(200)
})

// Bucket Delete [DELETE]
appRoute.delete('/buckets/:bucket', async (req, res) => {
    const { bucket } = req.params
    const data = await deleteBucketController(bucket)
    res.json({ message: data })
})

// Object Store [POST]
appRoute.post('/:bucket/:object', upload.single("file"), async (req, res) => {
    const { bucket, object } = req.params
    const sourceFile = req.file?.path
    const destinationFile = `${currentStorageDrive}/${req.file?.filename}`

    fs.copyFileSync(sourceFile!, destinationFile)
    fs.unlinkSync(sourceFile!)

    const uploadedData = await insertObjectController(bucket, object, req.file?.mimetype!, req.file?.size!, destinationFile)
    res.send(uploadedData)
})

// Object Stat Fetch [HEAD]

appRoute.head('/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params;

    try {
        const data = await getObjectController(bucket, object);

        if (data !== null) {
            // Set headers with metadata
            res.set({
                'ETag': data.uuid,
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
appRoute.get('/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params
    const data = await getObjectController(bucket, object)

    if (data != null) {
        const stream = fs.createReadStream(data.path)
        stream.on('open', () => {
            res.setHeader("Content-Length", data.size)
            res.setHeader("ETag", data.uuid)
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
appRoute.delete('/:bucket/:object', async (req, res) => {
    const { bucket, object } = req.params
    const data = await deleteObjectCrontroller(bucket, object)
    res.json({ message: data })
})

export default appRoute;