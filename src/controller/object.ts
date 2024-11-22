import { Object } from "../interface/object"
import { deleteObjectService, getObjectService, insertObjectService } from "../service/object"
import fs from 'fs'

export const insertObjectController = async (bucket: string, objectname: string, mime: string, size: number, location: string, objectId: string): Promise<string> => {
    await insertObjectService(bucket, objectname, mime, size, location, objectId)
    return objectId
}

export const getObjectController = async (bucket: string, object: string): Promise<Object | null> => {
    return getObjectService(bucket, object)
}

export const deleteObjectCrontroller = async (bucket: string, object: string): Promise<string> => {
    const objectData = await getObjectService(bucket, object)

    if (objectData != null) {
        fs.unlinkSync(objectData.path)
        await deleteObjectService(object, bucket)
    }
    return `Deleted ${object}`
}