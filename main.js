const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        maxWidth: 1280,
        maxHeight: 720,
        minimizable: true,
        maximizable: false, // disable maximize button
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.removeMenu(); // Remove the menu bar

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
    if (mainWindow === null) createWindow();
});

ipcMain.on('save-tasks', (event, tasks) => {
    // Show a save dialog to let the user choose a file location and name
    dialog.showSaveDialog(mainWindow, {
        defaultPath: path.join(app.getPath('documents'), 'tasks.json'),
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }]
    }).then(result => {
        if (!result.canceled) {
            // Write the tasks to the selected file
            fs.writeFileSync(result.filePath, JSON.stringify(tasks));
        }
    }).catch(err => {
        console.log(err);
    });
});

ipcMain.on('load-tasks', function (event) {
    // Show an open dialog to let the user choose a file to load
    dialog
        .showOpenDialog(mainWindow, {
            defaultPath: app.getPath('documents'),
            filters: [
                {
                    name: 'JSON Files',
                    extensions: ['json'],
                },
            ],
        })
        .then((result) => {
            if (!result.canceled) {
                // Read the selected file and send the tasks back to the renderer process
                const filePath = result.filePaths[0];
                try {
                    const fileData = fs.readFileSync(filePath, 'utf-8');
                    const tasks = JSON.parse(fileData);
                    event.sender.send('tasks-loaded', tasks);
                } catch (error) {
                    event.sender.send('load-error', 'Error loading tasks. Please check the file format.');
                }
            }
        })
        .catch((err) => {
            event.sender.send('load-error', 'An error occurred while loading tasks.');
        });
});