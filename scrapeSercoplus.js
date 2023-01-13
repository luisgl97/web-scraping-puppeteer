import fs from "fs"
import csv from "fast-csv"


export async function scrapeSercoplus(page, productoBuscar) {
    
    console.log("TIENDA SERCOPLUS")
    console.log("parameter Sercoplus", productoBuscar)

    let buscar = productoBuscar.replace(/\s/g, '+')
    console.log(productoBuscar)
    try {
        // Navigate to the search page and enter the search term "teclado"
        await page.goto(`https://www.sercoplus.com/busqueda?controller=search&s=${buscar}&page=1`, {
            waitUntil: "load"
        });

        // Wait for the search results to load
        await page.waitForSelector('.product-list');

        const paginacionFinal = await page.evaluate(() => {
            if (document.querySelector('.page-list')) {
                tamano_nodo = document.querySelector('.page-list').childElementCount
                ultimaPagina = document.querySelector(`.page-list>li:nth-child(${tamano_nodo - 1})>a`).innerText
                return parseInt(ultimaPagina)
            }
            return 1
        })

        console.log(paginacionFinal)

        let listaProductos = []
        let siguiente = 1;
        for (let i = 1; i <= paginacionFinal; i++) {
            // Extract the search results
            console.log('pagina', i)
            const searchProducts = await page.evaluate(() => {
                let products = [];
                document.querySelectorAll('#js-product-list > div.product-list > div > article > div.product-container.product-style').forEach(product => {
                    products.push({
                        title: product.querySelector('.product-name>a').innerText,
                        price: product.querySelector('.first-prices>span').innerText,
                    });
                });
                return products
            });

            listaProductos = [...listaProductos, ...searchProducts]
            siguiente = siguiente + 1;
            await page.goto(`https://www.sercoplus.com/busqueda?controller=search&s=${buscar}&page=${siguiente.toString()}`, {
                waitUntil: "load"
            });

            // Wait for the search results to load
            await page.waitForSelector('.product-list');
        }

        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(productoBuscar))
        console.log(listaProductos)
        console.log(listaProductos.length) 

        const writableStream = fs.createWriteStream(`./archivos/products_sercoplus_${productoBuscar}.csv`);

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);

        return listaProductos
    } catch (error) {
        console.log(error)
        
    }

    
}
