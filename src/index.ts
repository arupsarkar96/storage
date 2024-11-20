import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import configuration from './config'
import { auth } from './middleware/auth'
import appRoute from './routes/app'


const app = express()
const panel = express()
app.use(cors())
panel.use(cors())

app.use(auth)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '1024mb' }))

app.use('/', appRoute)
panel.use('/', appRoute)


app.listen(configuration.PORT, '0.0.0.0', () => {
    console.log('Server is running on', configuration.PORT)
})

panel.listen(configuration.CONSOLE_PORT, '0.0.0.0', () => {
    console.log('Panel is running on', configuration.CONSOLE_PORT)
})
