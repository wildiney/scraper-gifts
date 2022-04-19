const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs')

class Luminatti {
    constructor() {
        this.productList = new Set()
    }

    async getCategories(url) {
        console.log('Getting categories from', url)

        let urlCategories = new Set()
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url)

        const html = await page.content()
        const $ = cheerio.load(html)

        try {
            await page.waitForSelector('.content > ul > li')
            $('.content > ul > li').find('a').each((index, item) => {
                urlCategories.add($(item).attr('href'))
            })
        } catch (err) {
            console.log(err)
        }
        await browser.close()

        return urlCategories
    }

    async autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0
                var distance = 100
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight
                    window.scrollBy(0, distance)
                    totalHeight += distance

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 100)
            })
        })
    }

    async getProductsFromPage(url) {
        console.log('Getting products from', url)
        
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'load' })
        await page.setViewport({
            width: 1200,
            height: 800
        })
        await this.autoScroll(page)

        const html = await page.content()
        const $ = cheerio.load(html)

        try {
            await page.waitForSelector('.products')
            await $('.products .product').each((index, item) => {
                const title = $(item).find('.title').text().trim()
                const url = $(item).find('a').attr('href')
                const image = $(item).find('.image img').attr('src')
                const price = $(item).find('.price').text().trim()
                const available = ''
                const description = $(item).find('.description').text().trim()
                const prodInfo = ''
                const prodColors = ''

                const json = { title: title, url: url, image: image, price: price, available: available, description: description, info: prodInfo, colors: prodColors }
                console.log(json)
                this.productList.add(json)

                let lista = `"${title}", "${url}", "${image}", "${price}", "${available}", "${description}", "${prodInfo}", "${prodColors}"\r`
                fs.appendFileSync('products-luminatti.csv', lista)

            })

        } catch (err) {
            console.log(err)
        }
        await browser.close()
    }

    get getProductList(){
        return this.productList
    }
}

module.exports = Luminatti