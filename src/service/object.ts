import { RowDataPacket } from "mysql2"
import db from "../db"
import { Object } from "../interface/object"
import { v4 as uuid } from 'uuid'

export const getObjectsService = async (bucket_id: string): Promise<Object[]> => {
    const connection = await db.getConnection()
    try {
        const sql = 'SELECT * FROM `objects` WHERE `bucket_id` = ? ORDER BY `timestamp` DESC'
        const [rows] = await connection.query(sql, [bucket_id])
        return rows as Object[]
    } catch (error) {
        return []
    } finally {
        connection.release()
    }
}

export const insertObjectService = async (bucketId: string, objectname: string, mime: string, size: number, path: string, objectId: string) => {
    const connection = await db.getConnection()
    try {
        const sql = "INSERT INTO `objects`(`oid`, `bucket_id`, `filename`, `mime`, `size`, `path`) VALUES (?,?,?,?,?,?)"
        const [result]: [any, any] = await connection.query(sql, [objectId, bucketId, objectname, mime, size, path])
    } catch (error) {
        console.log(error)
    } finally {
        connection.release()
    }
}

export const getObjectService = async (bucket: string, object: string): Promise<Object | null> => {

    const connection = await db.getConnection()
    try {
        const sql = "SELECT * FROM `objects` WHERE `filename` = ? AND `bucket_id` = ?"
        const [result]: [RowDataPacket[], unknown] = await connection.query(sql, [object, bucket])
        return result.length > 0 ? result[0] as Object : null
    } catch (error) {
        console.log(error)
        return null
    } finally {
        connection.release()
    }
}

export const deleteObjectService = async (filename: string, bucket: string) => {
    const connection = await db.getConnection()
    try {
        const sql = 'DELETE FROM objects WHERE filename = ? AND bucket_id = ?'
        await connection.query(sql, [filename, bucket])
    } catch (error) {
        console.log(error)
    } finally {
        connection.release()
    }
}