const fs = require('fs')
const Luminatti = require('./Classes/Luminatti')
const BDL = require('./Classes/BrindesDeLuxo')
const _ = require('lodash')


async function runLuminatti(){
    const brindes = new Luminatti()
    const categories = await brindes.getCategories('http://www.luminatibrindes.com.br/brindes.php')
    // const categories = ['http://www.luminatibrindes.com.br/brindes/brindes-ecologicos/']

    for (const categorie of categories) {
        console.log(categorie)
        await brindes.getProductsFromPage(categorie)
    }

    fs.writeFileSync('products-luminatti.json', JSON.stringify(_.orderBy([...brindes.getProductList], 'title', 'asc')))
}

async function runBrindesDeLuxo() {
    const brindes = new BDL()
    const categories = await brindes.getCategories('https://brindesdeluxo.com.br/')
    // const categories = ['https://brindesdeluxo.com.br/categoria-produto/chaveiros/']
 
    const urlProducts = new Set()

    for (const categorie of categories) {
        console.log(categorie)
        const links = await brindes.getProductsFromPage(categorie)

        console.log('Links', links)
        for (const link of links) {
            console.log(link)
            if (!urlProducts.has(link)) {
                urlProducts.add(link)
                await brindes.getProductInfo(link)
            }
        }

    }

    fs.writeFileSync('products-brindes-de-luxo.json', JSON.stringify([...brindes.getProductList].sort()))
}

// runBrindesDeLuxo()
runLuminatti()