//includes
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const {ipcMain} = require('electron')
//vars
let mainWindow;
let screen1;

function createWindow () {
    mainWindow = new BrowserWindow({width: 1920, height: 1080});//create browser window
    //dev tools
    mainWindow.webContents.openDevTools(); // Open the DevTools.
    //mainWindow.setMenu(null);//set menu
    //set page to load and open
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function createScreen1(){
    screen1 = new BrowserWindow({width: 1920, height: 1080});//create browser window
    //dev tools
    screen1.webContents.openDevTools(); // Open the DevTools.
    //screen1.setMenu(null);//set menu
    //set page to load and open
    screen1.loadURL(`file://${__dirname}/screen1.html`);
    // Emitted when the window is closed.
    screen1.on('closed', function () {
        screen1 = null;
    });
     screen1.setFullScreen(true);
}


app.on('ready', function(){
    createScreen1();
    createWindow();

});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


//the rest of the app
ipcMain.on('screen1', (event, arg) => {
  console.log(arg) ; // prints "ping"
  event.sender.send('screen1', arg);
})
