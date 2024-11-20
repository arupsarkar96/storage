import db from "../db"
import { Version } from "../interface/version"


export const insertVersionService = async (objectId: number, objectUUID: string, mime: string, size: number, path: string) => {
    const connection = await db.getConnection()
    try {
        const sql = "INSERT INTO `versions` (`oid`, `uuid`, `mime`, `size`, `path`) VALUES (?,?,?,?,?)"
        const [result] = await connection.query(sql, [objectId, objectUUID, mime, size, path])
    } catch (error) {
        console.log(error)
    } finally {
        connection.release()
    }
}

export const getAllVersionService = async (bucket: string, object: string): Promise<Version[]> => {

    const connection = await db.getConnection()
    try {
        const sql = "SELECT * FROM `versions` LEFT JOIN `objects` ON `versions`.`oid` = `objects`.`oid` LEFT JOIN `buckets` ON `buckets`.`bid` = `objects`.`bucket` WHERE `objects`.`filename` = ? AND `buckets`.`bucket_name` = ? ORDER BY `versions`.`vid` ASC"
        const [result] = await connection.query(sql, [object, bucket])
        return result as Version[]
    } catch (error) {
        console.log(error)
        return []
    } finally {
        connection.release()
    }
}