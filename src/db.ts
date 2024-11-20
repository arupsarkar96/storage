import mysql from 'mysql2/promise'
import configuration from './config'

const db = mysql.createPool({ multipleStatements: true, uri: configuration.MYSQL })


export default db