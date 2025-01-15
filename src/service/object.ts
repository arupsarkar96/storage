import { RowDataPacket } from "mysql2"
import database from "../config/db"
import { Object } from "../interface/object"

export const getObjectsService = async (bucket_id: string): Promise<Object[]> => {
    try {
        const sql = 'SELECT * FROM `objects` WHERE `bucket_id` = ? ORDER BY `timestamp` DESC'
        const [rows] = await database.query(sql, [bucket_id])
        return rows as Object[]
    } catch (error) {
        return []
    }
}

export const insertObjectService = async (bucketId: string, objectname: string, mime: string, size: number, path: string, objectId: string) => {
    try {
        const sql = "INSERT INTO `objects`(`oid`, `bucket_id`, `filename`, `mime`, `size`, `path`) VALUES (?,?,?,?,?,?)"
        const [result]: [any, any] = await database.query(sql, [objectId, bucketId, objectname, mime, size, path])
    } catch (error) {
        console.log(error)
    }
}

export const getObjectService = async (bucket: string, object: string): Promise<Object | null> => {
    try {
        const sql = "SELECT * FROM `objects` WHERE `filename` = ? AND `bucket_id` = ?"
        const [result]: [RowDataPacket[], unknown] = await database.query(sql, [object, bucket])
        return result.length > 0 ? result[0] as Object : null
    } catch (error) {
        console.log(error)
        return null
    }
}

export const deleteObjectService = async (filename: string, bucket: string) => {
    try {
        const sql = 'DELETE FROM objects WHERE filename = ? AND bucket_id = ?'
        await database.query(sql, [filename, bucket])
    } catch (error) {
        console.log(error)
    }
}