import { RowDataPacket } from "mysql2"
import db from "../db"
import { Object, ObjectWithVersion } from "../interface/object"


export const getObjectsService = async (bucket_id: number): Promise<Object[]> => {
    const connection = await db.getConnection()
    try {
        const sql = 'SELECT * FROM `objects` WHERE `bucket` = ?'
        const [rows] = await connection.query(sql, [bucket_id])
        return rows as Object[]
    } catch (error) {
        return []
    } finally {
        connection.release()
    }
}

export const insertObjectService = async (bucketId: number, objectname: string): Promise<number> => {
    const connection = await db.getConnection()
    try {
        const sql = "INSERT INTO `objects`(`bucket`, `filename`) SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM `objects` WHERE `filename` = ? AND bucket = ?)"
        const [result]: [any, any] = await connection.query(sql, [bucketId, objectname, objectname, bucketId])
        return result.insertId as number
    } catch (error) {
        console.log(error)
        return 0
    } finally {
        connection.release()
    }
}

export const getObjectWithVersionService = async (bucket: string, object: string): Promise<ObjectWithVersion | null> => {

    const connection = await db.getConnection()
    try {
        const sql = "SELECT * FROM `versions` LEFT JOIN `objects` ON `versions`.`oid` = `objects`.`oid` LEFT JOIN `buckets` ON `buckets`.`bid` = `objects`.`bucket` WHERE `objects`.`filename` = ? AND `buckets`.`bucket_name` = ? ORDER BY `versions`.`vid` DESC LIMIT 1"
        const [result]: [RowDataPacket[], unknown] = await connection.query(sql, [object, bucket])
        return result.length > 0 ? result[0] as ObjectWithVersion : null
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
        const sql = 'DELETE objects FROM objects LEFT JOIN buckets ON objects.bucket = buckets.bid WHERE objects.filename = ? AND buckets.bucket_name = ?'
        await connection.query(sql, [filename, bucket])
    } catch (error) {
        console.log(error)
        return null
    } finally {
        connection.release()
    }
}