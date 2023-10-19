

const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width:500,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Carrega a URL corretamente
    mainWindow.loadURL(`C:/Users/leona/Desktop/OutroNome/OutroNome/appElectron/appElectron-1/index.html`);
});
