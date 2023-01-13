
import { Cluster } from "puppeteer-cluster";
import { scrapeImpacto } from "./scrapeImpacto.js"
import { scrapeSercoplus } from "./scrapeSercoplus.js";
import { scrapeMemorykings } from "./scrapeMemorykings.js";
import { scrapeCompuVision } from "./scrapeCompuVision.js";

export async function priceScraping(listaProductos) {

    try {
        // Inicia un cluster con Puppeteer para ejecutar el web scraping en paralelo en múltiples nodos
        const clusterInstance = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            maxConcurrency: 10,
            monitor: true,
            puppeteerOptions: {
                headless: false,
                defaultViewport: false,
                userDataDir: "./tmp",
            },

        });

        let listaSercoplus;
        let listaImpacto;
        let listaMemoryKings;
        let listaCompuVision;

        let listaProductosTiendas=[]

        for (let i = 0; i < listaProductos.length; i++) {
            let productoBuscar = listaProductos[i];
            // Asigna la función de web scraping a cada nodo del cluster
            console.log(productoBuscar)
            clusterInstance.queue(async ({ page }) => {
                console.log('entro cluster sercoplus')
                listaSercoplus = await scrapeSercoplus(page, productoBuscar);
            });

            clusterInstance.queue(async ({ page }) => {
                console.log('entro cluster impacto')
                listaImpacto = await scrapeImpacto(page, productoBuscar);
            }); 

            clusterInstance.queue(async ({ page }) => {
                console.log('entro cluster memory')
                listaMemoryKings = await scrapeMemorykings(page, productoBuscar);
            });

            clusterInstance.queue(async ({ page }) => {
                console.log('entro cluster compuvision')
                listaCompuVision = await scrapeCompuVision(page, productoBuscar);
            });

            // Cierra el cluster cuando todas las tareas hayan sido completadas
            clusterInstance.on('taskerror', (err, data) => {
                console.log(`Error procesando ${data}: ${err.message}`);
            });

            await clusterInstance.idle();
            let key = productoBuscar.replace(/\s/g, '-')
            listaProductosTiendas.push({
                [key]:{
                    "listaSercoplus": listaSercoplus,
                    "listaImpacto": listaImpacto,
                    "listaMemoryKings": listaMemoryKings,
                    "listaCompuVision": listaCompuVision
                }
            })

        }

        await clusterInstance.close();

        return listaProductosTiendas

    } catch (error) {
        console.log(error)
    }
};