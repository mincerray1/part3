/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const name = encodeURIComponent(process.argv[3])
const number = encodeURIComponent(process.argv[4])
const db = 'phonebookApp'

const url = 
    `mongodb+srv://fullstack:${password}@cluster0.vqgkzh7.mongodb.net/${db}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const PersonSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', PersonSchema)

const person = new Person({
    name: name,
    number: number,
})

if (process.argv.length == 3) {
    Person.find({}).then(result => {
        result.forEach(Person => {
            console.log(Person)
        })
        mongoose.connection.close()
    })    
}
else if (process.argv.length > 3) {
    person.save().then(() => {
        console.log('Person saved!')
        mongoose.connection.close()
    })
}

// Person.find({}).then(result => {
//     result.forEach(Person => {
//       console.log(Person)
//     })
//     mongoose.connection.close()
// })