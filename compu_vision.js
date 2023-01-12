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
        //await page.waitForFunction("document.querySelector('#loader-pre-prod').attributes.style.nodeValue=='display: none;", {timeout: 5000});
        await page.waitForFunction("document.querySelector('#loader-pre-prod').style.display === 'none'", {timeout: 5000});
        
        let resultados;

        resultados = await page.evaluate(() => {
            console.log('ju');
            if (document.querySelector('#example > ul')) {
                console.log('entro al if')
                tamanoNodo = document.querySelector('#example > ul').childNodes.length
                ultimaPagina = document.querySelector(`.pagination>li:nth-child(${tamanoNodo - 2})>a`).innerText
                return {tamanoNodo,ultimaPagina:parseInt(ultimaPagina)}
            }
            return {tamanoNodo:1,ultimaPagina:1}
        })

        let paginacionFinal = resultados.ultimaPagina;
        let tamanoNodo = resultados.tamanoNodo;

        console.log(paginacionFinal)
        console.log('tamano nodo', tamanoNodo)
        let listaProductos = []
        let siguiente = 1;
        for (let i = 1; i <= paginacionFinal; i++) {
            // Extract the search results
            console.log('pagina', i)
            const searchProducts = await page.evaluate(() => {
                let products = [];
                document.querySelectorAll('#content_principal > div >div.col-md-4').forEach(product => {
             
                    products.push({
                        title: product.querySelector('.product_info > h6 > a').innerText,
                        price: product.querySelector('.product_price > span.price').innerText,
                    });
                });
                return products
            });
            
            listaProductos = [...listaProductos, ...searchProducts]
       
            if (i != paginacionFinal-1){
                await page.click(`#example > ul > li:nth-child(${tamanoNodo}) > a`, {timeout: 3000});
                await page.waitForFunction("document.querySelector('#example > ul > li:nth-child(2)').className === 'page-item active'", {timeout: 5000});
            }

           
            /* siguiente = siguiente + 1;
            await page.goto(`https://www.impacto.com.pe/catalogo?qsearch=${buscar}&page=${siguiente.toString()}`, {
                waitUntil: "load"
            });
            // Wait for the search results to load
            await page.waitForSelector('#app-web > main > div.shop-area > div > div > div.shop-container > div.shop-container > div'); */
        }

        listaProductos = listaProductos.filter(p=>p.title.toLowerCase().includes(producto))
        console.log(listaProductos)
        console.log(listaProductos.length)

       /*  const writableStream = fs.createWriteStream('products_compu_vision.csv');
        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream); */


    } catch (error) {
        console.log(error)
    }  
        // Close the browser when the task is complete
    await browser.close();
    
})();