
import { Router } from "express";
import osu from 'node-os-utils'
var netstat = osu.netstat
var drive = osu.drive
var mem = osu.mem

const panelRoute = Router()

panelRoute.get('/', async (req, res) => {

    const info = await mem.info()
    res.send(info)
})


export default panelRoute