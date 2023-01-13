import fs from "fs"
import csv from "fast-csv"


export async function scrapeCompuVision(page, productoBuscar) {

    console.log("TIENDA COMPUVISION")
    console.log("parameter Compuvision", productoBuscar)
    let buscar = productoBuscar.replace(/\s/g, '+')
    console.log(productoBuscar)
    try {
        // Navigate to the search page and enter the search term "teclado"
        await page.goto(`https://compuvisionperu.pe/CYM/shop-list-prod.php?search=${buscar}`, {
            waitUntil: "load"
        });

        // Wait for the search results to load
        //await page.waitForFunction("document.querySelector('#loader-pre-prod').attributes.style.nodeValue=='display: none;", {timeout: 5000});
        await page.waitForFunction("document.querySelector('#loader-pre-prod').style.display === 'none'", { timeout: 5000 });

        let resultados;

        resultados = await page.evaluate(() => {
            if (document.querySelector('#example > ul')) {
                console.log('entro al if')
                tamanoNodo = document.querySelector('#example > ul').childNodes.length
                ultimaPagina = document.querySelector(`.pagination>li:nth-child(${tamanoNodo - 1})>a`).innerText
                return { tamanoNodo, ultimaPagina: parseInt(ultimaPagina) }
            }
            return { tamanoNodo: 1, ultimaPagina: 1 }
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
            siguiente = siguiente + 1;

            if (i != paginacionFinal) {
                await page.evaluate("document.querySelector('#example > ul > li:nth-child(6) > a').click()")
                await page.waitForFunction("document.querySelector('#loader-pre-prod').style.display === 'none'", { timeout: 5000 });
            }

        }

        listaProductos = listaProductos.filter(p => p.title.toLowerCase().includes(productoBuscar))
        //console.log(listaProductos) 
        //console.log(listaProductos.length)

        const writableStream = fs.createWriteStream(`./archivos/products_compu_vision_${productoBuscar}.csv`);
        csv.write([
            { title: 'Product Title', price: 'Price' },
            ...listaProductos
        ], { headers: false }).pipe(writableStream);

        return listaProductos
    } catch (error) {
        console.log(error)
    }


}
