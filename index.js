require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('sbody', function (req, res) { return JSON.stringify(req['body'])})
morgan.token('rbody', function (req, res) { return JSON.stringify(res['body'])})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :sbody'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

  //OK
  app.get('/', (req, res) => {
    res.send('<h1>Welcome To puhelinluettelo Backend</h1>')
  })
  //OK
  app.get('/info', (req, res) => {
    Person.find({}).then(result => res.send(`<p>Phonebook has info for ${result.length} people</p> 
    <p>${new Date()}</p>`)
  )})

  //OK
  app.get('/api/persons', (req, res) => {
    Person.find({}).then(result =>res.json(result))
  })

  // ??
  app.get('/api/persons/:id', (request, response) => {
    console.log('GET launched.')
    const id = request.params.id
    Person.findById(id).then(person => {
      response.json(person)
    })
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    console.log(request.params.id)
    console.log(body.number)
    Person.findByIdAndUpdate(request.params.id, {number: body.number}, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
  })

  // OK
  app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (body.name === undefined || body.number === undefined) {
      return response.status(400).json({ error: 'name or number missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
      date: new Date(),
    })

    const error = person.validateSync()
    console.log(error)

    person.save().then(savedNote => {
      response.json(savedNote)
    }).catch(error => {
      response.status(400).json({error: 'Validation failed:' })
    })
  })

  app.delete('/api/persons/:id', (req,res, next) =>{
    const id = req.params.id
    if (id === undefined) {
      return res.send({error: 'ID is missing'})
    }
    Person.findByIdAndDelete(id).then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
    })

  app.use(unknownEndpoint)

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }

    next(error)
  }
  app.use(errorHandler)
    
  //OK
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })