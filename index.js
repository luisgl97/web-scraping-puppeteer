import express from 'express';
import bodyParser from 'body-parser';
import { priceScraping } from './paralelo.js';

const app = express();

// Enable JSON parsing of request body
app.use(bodyParser.json());

const puerto = '5000';

app.post('/product', async (req, res) => {

    const data = req.body
    let listaProductos = data.productos
    listaProductos = listaProductos.map(product => product.trim().toLowerCase());

    console.log('listaaaaaaaaaaaa', listaProductos)
    //Web scraping 
    let listaProductosTiendas = await priceScraping(listaProductos)
    console.log(listaProductosTiendas)
    const titles = [];

    for (let i = 0; i < listaProductosTiendas.length; i++) {
        const component = listaProductosTiendas[i];
        for (let key in component) {
            const lists = component[key];
            for (let listName in lists) {
                const list = lists[listName];
                for (let j = 0; j < list.length; j++) {
                    const item = list[j];
                    titles.push(item.title);
                }
            }
        }
    }

    console.log(titles);
    res.json(listaProductosTiendas);
});

// Iniciar el servidor en el puerto 5000
app.listen(puerto, () => {
    console.log(`API REST escuchando en http://localhost:${puerto}`);
});