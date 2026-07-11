const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fs = require('fs')

app.use(express.static(path.join(__dirname, '')));
app.use(express.json({limit: '5mb'}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`)
})
