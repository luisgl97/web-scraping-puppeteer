import puppeteer from "puppeteer";
import csv from "fast-csv"
import fs from "fs"

(async () => {

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
            userDataDir: "./tmp",
        });
        const page = await browser.newPage();
        let producto = 'teclado'
        producto=producto.trim().toLowerCase()
        let buscar = producto.replace(/\s/g, '+')
        console.log(producto)
        try {
        // Navigate to the search page and enter the search term "teclado"
        await page.goto(`https://compuvisionperu.pe/CYM/shop-list-prod.php?search=${buscar}`, {
            waitUntil: "load"
        });

        // Wait for the search results to load
        //await page.waitForSelector('#example > ul', setTimeout=4000);
        ju = await page.waitForFunction("document.querySelector('#content_principal > div.row.shop_container.grid').childNodes.length>10")
        console.log(ju)
        const paginacionFinal = await page.evaluate(() => {
            if (document.querySelector('.pagination')) {
                tamano_nodo = document.querySelector('#example > ul').childNodes.length
                ultimaPagina = document.querySelector(`.pagination>li:nth-child(${tamano_nodo - 2})>a`).innerText
                return parseInt(ultimaPagina)
            }
            return 1
        })

        console.log(paginacionFinal)
/* 
        let listaProductos = []
        let siguiente = 1;
        for (let i = 1; i <= paginacionFinal; i++) {
            // Extract the search results
            console.log('pagina', i)
            const searchProducts = await page.evaluate(() => {
                let products = [];
                document.querySelectorAll('#app-web > main > div.shop-area > div > div > div.shop-container > div.shop-container > div > div').forEach(product => {
                    let title = product.querySelector('div.product-content > h4 > a').innerText

                    products.push({
                        title: title,
                        price: product.querySelector('.product-price>span').innerText,
                    });
                });
                return products
            });

            listaProductos = [...listaProductos, ...searchProducts]
            siguiente = siguiente + 1;
            await page.goto(`https://www.impacto.com.pe/catalogo?qsearch=${buscar}&page=${siguiente.toString()}`, {
                waitUntil: "load"
            });

            // Wait for the search results to load
            await page.waitForSelector('#app-web > main > div.shop-area > div > div > div.shop-container > div.shop-container > div');
        }

        listaProductos = listaProductos.filter(p=>p.title.toLowerCase().includes(producto))
        console.log(listaProductos)
        console.log(listaProductos.length)

        const writableStream = fs.createWriteStream('products_impacto.csv');

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);
 */

    } catch (error) {
        console.log(error)
    }  
        // Close the browser when the task is complete
    await browser.close();
    
})();