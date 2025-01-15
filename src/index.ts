import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import configuration from './config/config'
import { auth } from './middleware/auth'
import route from './routes/app'
import panelRoute from './routes/panel'

const app = express()
const panel = express()

app.use(cors())
panel.use(cors())
app.use(morgan("short"))
panel.use(morgan("dev"))


app.use(auth)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '1024mb' }))

app.use('/', route)
panel.use("/", panelRoute)

app.listen(configuration.PORT, '0.0.0.0', () => {
    console.log('Server is running on', configuration.PORT)
})

panel.listen(configuration.CONSOLE, '0.0.0.0', () => {
    console.log('Console is running on', configuration.CONSOLE)
})