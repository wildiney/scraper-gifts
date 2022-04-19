const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs')

class BrindesDeLuxo {
    constructor() {
        this.productList = new Set()
    }

    get getProductList() {
        return this.productList
    }

    async getCategories(url) {
        console.log('Getting categories from', url)

        const urlCategorias = new Set()
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        page.setViewport({
            width: 1280,
            height: 960,
        })

        await page.goto(url)
        const html = await page.content()
        const $ = cheerio.load(html)

        await page.waitForSelector('#noo_menu_2 > div > div > ul > li.menu-item.menu-item-type-post_type.menu-item-object-page.menu-item-175.noo-nav-item.dropdown.mega.mega-align-left a')
        $('#noo_menu_2 > div > div > ul > li.menu-item.menu-item-type-post_type.menu-item-object-page.menu-item-175.noo-nav-item.dropdown.mega.mega-align-left').find('a').each((index, item) => {
            urlCategorias.add($(item).attr('href'))
        })

        await browser.close()

        return urlCategorias
    }

    async getProductsFromPage(url) {
        console.log('Getting Products from', url)

        const urlProdutos = new Set()
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        page.setViewport({
            width: 1280,
            height: 960,
        })

        try {

            await page.goto(url)
            const html = await page.content()
            const $ = cheerio.load(html)

            let qtdPages = 1
            try {
                await page.waitForSelector('.page-numbers')
                qtdPages = parseInt($('.page-numbers li:nth-last-child(-n+2) a').text())
            } catch (err) {
                console.log('There is no other pages')
            }
            console.table([{ 'Main Page': url, 'Subpages': qtdPages }])

            for (let i = 1; i <= qtdPages; i++) {
                await page.goto(url + `/page/${i}`)
                const html = await page.content()
                const $ = cheerio.load(html)

                try {
                    await page.waitForSelector('.products')

                    $('.products li a').each((index, item) => {
                        urlProdutos.add($(item).attr('href'))
                    })
                } catch (err) {
                    console.log('There is no products on this page')
                }
            }

            await browser.close()
        } catch (err) {
            console.log('Error trying to access', url)
        }

        return urlProdutos
    }

    async getProductInfo(url) {
        console.log('Getting info of product from', url)

        let info = []
        let colors = []

        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        page.setViewport({
            width: 1280,
            height: 960,
        })

        try {
            await page.goto(url)
            const html = await page.content()
            const $ = await cheerio.load(html)

            let title = ''
            let image = ''
            let price = ''
            let description = ''
            let prodInfo = ''
            let prodColors = ''
            let available = ''

            await page.waitForSelector('div.summary.entry-summary > h1')
            title = $('div.summary.entry-summary > h1').text()
            console.log(title)
            image = $('div.woocommerce-product-gallery.woocommerce-product-gallery--with-images.woocommerce-product-gallery--columns-4.images > div > figure > div > a > img').attr('src')
            console.log(image)
            price = $('div.summary.entry-summary > p').text()
            console.log(price)
            description = $('#tab-description > p').text().replace('<br>', '').replace(/(\r\n|\n|\r)/gm, '').trim()
            console.log('description', description)
            $('.woocommerce-product-details__short-description  li').each((index, item) => {
                info.push($(item).text().replace('<br>', '').replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            prodInfo = info.join(' / ')
            console.log('prodInfo', prodInfo)
            $('.tawcvs-swatches span').each((index, item) => {
                colors.push($(item).text().replace('<br>', '').replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            prodColors = colors.join(' / ')
            console.log('prodColors', prodColors)
            available = $('p.stock.out-of-stock').text() || ''
            console.log('Available', available)


            const json = { title: title, url: url, image: image, price: price, available: available, description: description, info: prodInfo, colors: prodColors }
            console.table(json)
            this.productList.add(json)

            let lista = `"${title}", "${url}", "${image}", "${price}", "${available}", "${description}", "${prodInfo}", "${prodColors}"\r`
            fs.appendFileSync('produtos.csv', lista)
            
        } catch (err) {
            err => console.log('Erro:', err)
        }

        await browser.close()
    }
}

module.exports = BrindesDeLuxo







