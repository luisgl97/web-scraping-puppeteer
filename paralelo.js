
import { Cluster } from "puppeteer-cluster";
import {scrapeImpacto} from "./scrapeImpacto.js"
import {scrapeSercoplus}  from "./scrapeSercoplus.js";
import {scrapeMemorykings} from "./scrapeMemorykings.js";

(async () => {

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


        // Asigna la función de web scraping a cada nodo del cluster
        //clusterInstance.queue(scrapeSercoplus)
          
        //clusterInstance.queue(scrapeImpacto)
        
        //clusterInstance.queue(scrapeMemorykings)
        const productoBuscar = 'ryzen 5'

        clusterInstance.queue(async ({ page}) => {
            console.log('entro cluster sercoplus')
            await scrapeSercoplus(page, productoBuscar);
        });
        
        clusterInstance.queue(async ({ page}) => {
            console.log('entro cluster impacto')
            await scrapeImpacto(page, productoBuscar);
        });
        
        clusterInstance.queue(async ({ page}) => {
            console.log('entro cluster memory')
            await scrapeMemorykings(page, productoBuscar);
        });

        // Cierra el cluster cuando todas las tareas hayan sido completadas
        clusterInstance.on('taskerror', (err, data) => {
            console.log(`Error procesando ${data}: ${err.message}`);
        });
        await clusterInstance.idle();
        await clusterInstance.close();
        
    } catch (error) {
        console.log(error)
    }
})();