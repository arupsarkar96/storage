import { RowDataPacket } from "mysql2"
import db from "../db"
import { Bucket } from "../interface/bucket"



export const getBucketsService = async (): Promise<Bucket[]> => {
    const connection = await db.getConnection()
    try {
        const sql = 'SELECT * FROM `buckets`'
        const [rows] = await connection.query(sql)
        return rows as Bucket[]
    } catch (error) {
        return []
    } finally {
        connection.release()
    }
}


export const getBucket = async (bucket: string): Promise<Bucket | null> => {
    const connection = await db.getConnection()
    try {
        const sql = 'SELECT * FROM `buckets` WHERE `bucket_name` = ?'
        const [rows]: [RowDataPacket[], unknown] = await connection.query(sql, [bucket])
        return rows.length > 0 ? rows[0] as Bucket : null
    } catch (error) {
        return null
    } finally {
        connection.release()
    }
}


export const insertBucketService = async (bucket: string) => {
    const connection = await db.getConnection()
    try {
        const sql = "INSERT INTO `buckets`(`bucket_name`) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM `buckets` WHERE `bucket_name` = ?)"
        const [result]: [any, any] = await connection.query(sql, [bucket, bucket])
    } catch (error) {
        console.log(error)
    } finally {
        connection.release()
    }
}