const mongoose = require('mongoose')

const password = process.argv[2]
const url = `mongodb+srv://Niko:${password}@cluster0.hb3dt.mongodb.net/PhoneBookApp?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: Date,
  })

const Person = mongoose.model('person', personSchema)

if (process.argv[3] == undefined) {
Person.find({}).then(persons => {
    persons.forEach(person => console.log(person.name, person.number))
    mongoose.connection.close()
  })
} else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
        date: new Date(),
      })
    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}