import puppeteer from "puppeteer";
import { Cluster } from "puppeteer-cluster";
import fs from "fs"
import csv from "fast-csv"
async function scrapeSercoplus() {
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        
    });
    const page = await browser.newPage();
    var producto = 'silla gaming'
    producto = producto.trim().toLowerCase()
    let buscar = producto.replace(/\s/g, '+')
    console.log(producto)
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
                    let title = product.querySelector('.product-name>a').innerText;

                    products.push({
                        title: title,
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

        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(producto))
        console.log(listaProductos)
        console.log(listaProductos.length)

        const writableStream = fs.createWriteStream('products_sercoplus.csv');

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);
    } catch (error) {
        console.log(error)
    }

    await browser.close();
}

async function scrapeImpacto() {
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        
    });
    const page = await browser.newPage();
    let producto = 'teclado'
    producto = producto.trim().toLowerCase()
    let buscar = producto.replace(/\s/g, '%20')
    console.log(producto)
    try {
        // Navigate to the search page and enter the search term "teclado"
        await page.goto(`https://www.impacto.com.pe/catalogo?qsearch=${buscar}&page=1`, {
            waitUntil: "load"
        });

        // Wait for the search results to load
        await page.waitForSelector('#app-web > main > div.shop-area > div > div > div.shop-container > div.shop-container > div');

        const paginacionFinal = await page.evaluate(() => {
            if (document.querySelector('.pagination')) {
                tamano_nodo = document.querySelector('.pagination').childElementCount
                ultimaPagina = document.querySelector(`.pagination>li:nth-child(${tamano_nodo - 1})>a`).innerText
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

        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(producto))
        console.log(listaProductos)
        console.log(listaProductos.length)

        const writableStream = fs.createWriteStream('products_impacto.csv');

        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);


    } catch (error) {
        console.log(error)
    }
    // Close the browser when the task is complete
    await browser.close();
}

(async () => {
    // Inicia un cluster con Puppeteer para ejecutar el web scraping en paralelo en múltiples nodos
    const clusterInstance = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 2,
      monitor: true,
      puppeteerOptions: {
        headless: true,
        defaultViewport: false,
        userDataDir: "./tmp",
      },
    });
    
    // Asigna la función de web scraping a cada nodo del cluster
    clusterInstance.queue(scrapeSercoplus);
    clusterInstance.queue(scrapeImpacto);
  
    // Cierra el cluster cuando todas las tareas hayan sido completadas
    clusterInstance.on('taskerror', (err, data) => {
      console.log(`Error procesando ${data}: ${err.message}`);
    });
    await clusterInstance.idle();
    await clusterInstance.close();
  })();