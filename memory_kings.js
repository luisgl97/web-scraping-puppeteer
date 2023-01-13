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
    let productoBuscar = 'teclado'
    let producto = productoBuscar.trim().toLowerCase()
    let buscar = producto.replace(/\s/g, '%20')
    console.log(producto)
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


        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(producto))
        console.log(listaProductos)
        console.log(listaProductos.length)

        const writableStream = fs.createWriteStream('products_memory_kings.csv');

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);


    } catch (error) {
        console.log(error)
    }
    // Close the browser when the task is complete
    await browser.close();

})();