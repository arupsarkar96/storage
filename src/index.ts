import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import configuration from './config'
import { auth } from './middleware/auth'
import appRoute from './routes/app'
import panelRoute from './routes/panel'


const app = express()
const panel = express()
app.use(cors())
app.use(morgan("short"))
panel.use(cors())
panel.use(morgan("short"))


app.use(auth)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '1024mb' }))

app.use('/', appRoute)
panel.use('/storage', appRoute)
panel.use('/panel', panelRoute)


app.listen(configuration.PORT, '0.0.0.0', () => {
    console.log('Server is running on', configuration.PORT)
})

panel.listen(configuration.CONSOLE_PORT, '0.0.0.0', () => {
    console.log('Panel is running on', configuration.CONSOLE_PORT)
})
