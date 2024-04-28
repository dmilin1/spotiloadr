import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import Downloader from './downloader/Downloader';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  
  new Downloader(mainWindow.webContents);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details;
    if (responseHeaders) {
      responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    }
    if (responseHeaders?.['access-control-allow-origin']) {
      delete responseHeaders['access-control-allow-origin'];
    }
    if (responseHeaders?.['access-control-allow-headers']) {
      responseHeaders['access-control-allow-headers'] = ['*'];
    }
    callback({
      responseHeaders,
    });
  });
  session.defaultSession.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      if (details.url.startsWith('https://www.deezer.com')) {
        details.requestHeaders.cookie = `arl=c973c00c202e08339091908e03b61b26de6dd6e17cce01ef1ccd845f6288c220ae38045abcedb038fb2122c049d7d8d3f006dc241ea43e0144070fb3600fb914959bfc2352993b2163685b47bab02f30673d84b0eefb995e665b356ef16012b4;`
      }
      callback({ requestHeaders: {
        Origin: '*', ...details.requestHeaders } });
    },
  );
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.