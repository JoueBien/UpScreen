//includes
const electron = require('electron');
const  dialog = electron.dialog;
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const {ipcMain} = require('electron')
//vars
let mainWindow;

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

app.on('ready', function(){
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
ipcMain.on('fileSystem', (event, arg) => {
  console.log(arg) ; // prints "ping"
  event.sender.send('fileSystem', arg);
  if (arg.type="saveAs"){
      dialog.showSaveDialog(function (fileName) {
       if (fileName === undefined){
            console.log("You didn't save the file");
            return;
       }
       fs.writeFile(fileName, JSON.stringify(arg.data), function (err) {
           if(err){ alert("An error ocurred creating the file "+ err.message); }
           console.log("The file has been succesfully saved");
       });
   });
  }
})
