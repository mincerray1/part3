require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path: ', request.path)
//     console.log('Body: ', request.body)
//     console.log('---')
//     next()
// }
// app.use(requestLogger)



app.use(express.json())

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())
app.use(express.static('dist'))

app.get('/api/persons', (request, response, next) => {
    const queries = request.query
    
    if (queries.name) {
        Person.findOne({ 'name': queries.name }).then(person => {
            response.json(person)
        }).catch(error => next(error))
    } else {
        Person.find({}).then(persons => {
            response.json(persons)
        }).catch(error => next(error))
    }
})

app.get('/info', async (request, response) => {
    const count = await Person.countDocuments({})
    const currentDate = new Date().toDateString()
        return response.send(`
            <p>Phonebook has info for ${count} people</p>
            ${currentDate}
            `)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)            
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {    
    const body = request.body    
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person ({
        name: body.name,
        number: body.number,
        // id: generateId()
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
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

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})