import fs from "fs"
import csv from "fast-csv"


export async function scrapeMemorykings(page, productoBuscar) {
    
    console.log("TIENDA MEMORY KINGS")
    console.log("parameter memory kings", productoBuscar)
    let buscar = productoBuscar.replace(/\s/g, '%20')
    console.log(productoBuscar)
    try {
       
        await page.goto(`https://www.memorykings.pe/resultados/${buscar}`, {
            waitUntil: "load"
        });

        // Wait for the search results to load
        await page.waitForSelector('ul.products');

        let listaProductos = []

        const searchProducts = await page.evaluate(() => {
            let products = [];
            document.querySelectorAll('#memory > section> div.container.flex.grid-gutter-2.pb-4 > div > ul > li').forEach(product => {

                products.push({
                    title: product.querySelector('div.content > div.title').innerText,
                    price: product.querySelector('div.content > div.price').innerText,
                });
            });
            return products
        });

        listaProductos = [...listaProductos, ...searchProducts]


        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(productoBuscar))
        /* console.log(listaProductos)
        console.log(listaProductos.length) */

        const writableStream = fs.createWriteStream(`./archivos/products_memory_kings_${productoBuscar}.csv`);

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);

        return listaProductos;

    } catch (error) {
        console.log(error)
    }

}