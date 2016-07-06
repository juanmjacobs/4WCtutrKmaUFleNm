var service = require('./sellerListingsUpdaterService');
service.start();
console.log('Recuerda configurar la URL de la API de listing tracker. Por default es http://localhost:9000')
console.log('Recuerda que la API de listing tracker debe estar levantada para que el proceso funcione')
console.log('Monitorea el progreso con "tail -f serviceLog.txt"')