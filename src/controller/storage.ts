import fs from 'fs'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import configuration from '../config/config'


const storageDrives = configuration.DRIVES
// Ensure storage directories exist
storageDrives.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
})

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true })
}


export const currentStorageDrive = storageDrives[0]

// Configure Multer storage with size limit
export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {
            cb(null, uuidv4())
        }
    }),
    limits: { fileSize: 1 * 1024 * 1024 * 1024 } // Set file size limit (e.g., 1GB)
})