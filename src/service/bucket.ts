import { RowDataPacket } from "mysql2"
import db from "../config/db"
import { Bucket } from "../interface/bucket"



export const getBucketsService = async (): Promise<Bucket[]> => {
    try {
        const sql = 'SELECT * FROM `buckets`'
        const [rows] = await db.query(sql)
        return rows as Bucket[]
    } catch (error) {
        return []
    }
}


export const getBucket = async (bucket: string): Promise<Bucket | null> => {
    try {
        const sql = 'SELECT * FROM `buckets` WHERE `bucket_id` = ?'
        const [rows]: [RowDataPacket[], unknown] = await db.query(sql, [bucket])
        return rows.length > 0 ? rows[0] as Bucket : null
    } catch (error) {
        return null
    }
}


export const insertBucketService = async (bucket: string) => {
    try {
        const sql = "INSERT INTO `buckets`(`bucket_id`) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM `buckets` WHERE `bucket_id` = ?)"
        const [result]: [any, any] = await db.query(sql, [bucket, bucket])
    } catch (error) {
        console.log(error)
    }
}


export const deleteBucketService = async (bucket: string) => {
    try {
        const sql = "DELETE FROM `buckets` WHERE `bucket_id` = ?"
        const [result]: [any, any] = await db.query(sql, [bucket])
    } catch (error) {
        console.log(error)
    }
}