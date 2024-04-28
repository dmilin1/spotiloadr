// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { SpotifyTrack } from "./api/SpotifyAPI"

const { contextBridge, ipcRenderer } = require('electron')

const apis = {
    download: (arl: string, tracks: SpotifyTrack[]) => ipcRenderer.send('download', arl, tracks),
    arlErrorListener: (callback: (message: string) => void) => {
        const func = (_: any, message: string) => callback(message);
        ipcRenderer.on('arlError', func);
        return () => ipcRenderer.off('arlError', func);
    },
    downloadStatusListener: (callback: (trackId: number, status: SpotifyTrack['downloadStatus']) => void) => {
        const func = (_: any, trackId: number, status: SpotifyTrack['downloadStatus']) => callback(trackId, status);
        ipcRenderer.on('downloadStatus', func);
        return () => ipcRenderer.off('downloadStatus', func);
    },
    finishedListener: (callback: () => void) => {
        const func = () => callback();
        ipcRenderer.on('downloadFinished', func);
        return () => ipcRenderer.off('downloadFinished', func);
    }
}
        

export type API = typeof apis;

contextBridge.exposeInMainWorld('api', apis);