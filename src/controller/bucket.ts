import { Bucket } from "../interface/bucket";
import { Object } from "../interface/object";
import { getBucket, getBucketsService, insertBucketService } from "../service/bucket";
import { getObjectsService } from "../service/object";
import { deleteObjectCrontroller } from "./object";


export const getBucketsController = async (): Promise<Bucket[]> => {
    return getBucketsService()
}

export const getBucketController = async (bucket: string): Promise<Object[] | null> => {
    const bucketData = await getBucket(bucket)
    if (bucketData === null) {
        return null
    } else {
        return getObjectsService(bucketData.bid)
    }
}

export const insertBucketController = async (bucket: string) => {
    insertBucketService(bucket)
}

export const deleteBucketController = async (bucket: string): Promise<string> => {
    const bucketData = await getBucketController(bucket)
    if (bucketData === null) {
        return "Bucket not fount"
    }

    bucketData.forEach(async (object) => {
        await deleteObjectCrontroller(bucket, object.filename)
    });

    return `Deleted ${bucketData.length} objects with their versions`
}