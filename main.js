const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let appTray = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        show: false, // Inicia a janela como oculta
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Carrega a URL corretamente
    mainWindow.loadFile(`index.html`);

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const iconName = path.join(__dirname, 'tray-icon.png');
    appTray = new Tray(iconName);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir Aplicativo',
            click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Fechar Aplicativo',
            click: function () {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    appTray.setToolTip('Seu aplicativo está em execução.');
    appTray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});