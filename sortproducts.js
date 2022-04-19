const fs = require('fs')
const _ = require('lodash')

const file = './products-luminatti.json'

let products = fs.readFileSync(file)
let rawProducts = JSON.parse(products)
let orderedProducts = _.orderBy(rawProducts, 'title', 'asc')
console.log('Ordered', orderedProducts)

fs.writeFileSync(file, JSON.stringify(orderedProducts))