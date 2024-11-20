import { Object, ObjectWithVersion } from "../interface/object"
import { getBucket } from "../service/bucket"
import { deleteObjectService, getObjectWithVersionService, insertObjectService } from "../service/object"
import { getAllVersionService, insertVersionService } from "../service/version"
import { v4 as uuidv4 } from "uuid"
import fs from 'fs'

export const insertObjectController = async (bucketname: string, objectname: string, mime: string, size: number, location: string) => {
    const bucketData = await getBucket(bucketname)
    const bucketId = bucketData?.bid
    const objectId = await insertObjectService(bucketId!, objectname)
    const ouuid = uuidv4()
    insertVersionService(objectId, ouuid, mime, size, location)
    return { etag: ouuid }
}

export const getObjectController = async (bucket: string, object: string): Promise<ObjectWithVersion | null> => {
    return getObjectWithVersionService(bucket, object)
}

export const deleteObjectCrontroller = async (bucket: string, object: string): Promise<string> => {
    const versions = await getAllVersionService(bucket, object)
    versions.forEach(async (v) => {
        fs.unlinkSync(v.path)
    })
    await deleteObjectService(object, bucket)
    return `Deleted ${object} with ${versions.length} versions`
}