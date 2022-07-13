const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('body', function (req, res) { return JSON.stringify(req['body'])})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
  
const generateId = () =>{
  // haetaan personjen pituus. jos pituus on yli nollan haetaan maximi ID numero jos taas ei niin palautetaan 0.
    return Math.floor(Math.random() * 100000000000)
}

let persons = [
      {
        name: "Mia",
        number: "0451587895",
        id: 1
      },
      {
        name: "Maria",
        number: "0451587896",
        id: 2
      },
      {
        name: "Anna",
        number: "0415788555",
        id: 3
      },
      {
        name: "Niko",
        number: "0505995008",
        id: 4
      }
    ]

  app.get('/', (req, res) => {
    res.send('<h1>Welcome To puhelinluettelo Backend</h1>')
  })

  app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p> 
    <p>${new Date()}</p>`)
  })

  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })


  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }

  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  app.post('/api/persons', (request, response) => {
    const body = request.body
    const person1 = persons.find(person => person.name === body.name)

    if (person1) {
        return response.status(400).json({
            error: `allready in database, Name needs to be unique`
        })
    }
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'Name or number missing, Please be sure name and number are filled.' 
      })
    }
    const person = {
      name: body.name,
      number: body.number,
      date: new Date(),
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
  })

  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })