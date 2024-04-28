import * as api from 'd-fi-core';
import fs from 'fs';
import path from 'path';
import { DeezerTrack } from '../api/DeezerAPI';
import { dialog, ipcMain } from 'electron';
import { SpotifyTrack } from 'src/api/SpotifyAPI';

export default class Downloader {
    webContents: Electron.WebContents;

    constructor(webContents: Electron.WebContents) {
        this.webContents = webContents;
        this.startDownloadListener();
    }

    async setARL(arl: string) {
        try {
            await api.initDeezerApi(arl);
            await api.getUser();
        } catch {
            this.emitArlError('Invalid ARL');
        }
    }

    async downloadTracks(arl: string, tracks: SpotifyTrack[]) {
        const paths = dialog.showOpenDialogSync({
            title: 'Select download folder',
            properties: ['openDirectory', 'createDirectory'],
        });
        if (!paths || paths.length < 1) return;
        const path = paths[0];
        await this.setARL(arl);
        for (const track of tracks) {
            if (track.deezerTrack.type !== 'track' || !track.deezerTrack.download) continue;
            try {
                await this.downloadTrack(track, track.deezerTrack.id, path);
                track.downloadStatus = 'downloaded';
            } catch (e: any) {
                this.emitDownloadStatus(track.deezerTrack.id, 'error');
            }
        }
    }

    async downloadTrack(track: SpotifyTrack, trackId: DeezerTrack['id'], folder: string): Promise<void> {
        this.emitDownloadStatus(trackId, 'downloading');
        const trackInfo = await api.getTrackInfo(trackId.toString());
        const trackData = await api.getTrackDownloadUrl(trackInfo, 1);
        const res = await fetch(trackData!.trackUrl);
        const arrBuffer = await res.arrayBuffer();
        const decrypted = api.decryptDownload(Buffer.from(arrBuffer), trackInfo.SNG_ID);
        const output = await this.writeMetadata(track, decrypted);
        fs.writeFileSync(path.join(folder, `${track.name}.mp3`), output);
        this.emitDownloadStatus(trackId, 'downloaded');
    }

    async writeMetadata(track: SpotifyTrack, buffer: Buffer): Promise<Buffer> {
        const { ID3Writer } = await import('browser-id3-writer');
        const writer = new ID3Writer(buffer);
        writer.setFrame('TIT2', track.name)
            .setFrame('TPE1', track.artists.map(artist => artist.name))
            .setFrame('TALB', track.album.name)
        if (track.album.imageUrl) {
            const res = await fetch(track.album.imageUrl);
            const buff = await res.arrayBuffer();
            writer.setFrame('APIC', {
                type: 3,
                data: buff,
                description: 'Thumbnail'
            });
        }
        writer.addTag();
        // @ts-ignore The library isn't typed properly and thinks .arrayBuffer doesn't exist
        return Buffer.from(writer.arrayBuffer);
    }

    startDownloadListener() {
        ipcMain.on('download', async (event, arl: string, tracks: SpotifyTrack[]) => {
            await this.downloadTracks(arl, tracks);
            this.emitFinished();
        });
    }

    emitArlError(message: string) {
        this.webContents.send('arlError', message);
    }

    emitDownloadStatus(trackId: DeezerTrack['id'], status: SpotifyTrack['downloadStatus']) {
        this.webContents.send('downloadStatus', trackId, status);
    }

    emitFinished() {
        this.webContents.send('downloadFinished');
    }
}