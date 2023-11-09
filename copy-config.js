const fs = require('fs-extra');

fs.copy('./config.txt', './dist/config.txt', (err) => {
    if (err) return console.error(err);
    console.log('Arquivo config.txt copiado com sucesso!');
});