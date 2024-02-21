const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
  { 
    id: 1,
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
]
  
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

morgan.token('personInfo', function getPersonInfo (req) {
  return `{"name":"${req.body.name}","number":"${req.body.number}"}`
})

app.use(morgan(':method :url :status :response-time ms :personInfo'))
app.use(express.json())
app.use(requestLogger)
// app.use(morgan('tiny'))


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
//   console.log('request.body.name is', request.body.name)
  const body = request.body

  if (!body.name || !body.number) {
    console.log('failed name ')
    return response.status(400).json({ 
      error: 'name or phone number missing' 
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
        error: 'name must be unique' 
      })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  console.log('person is ', person)
  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
    console.log("URL is ", `/api/persons/${id}`)
  } else {
    console.log("Didnt make it")
    response.status(404).end()
  }
})

app.get('/api/persons/', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`
  )
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

 response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})