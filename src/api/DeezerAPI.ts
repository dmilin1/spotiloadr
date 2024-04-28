export type DeezerTrack = {
    id: number;
    name: string;
    durationSeconds: number;
    isrc?: string;
    deezerUrl?: string;
    previewUrl?: string;
    album: {
        name: string;
        thumbnailUrl?: string;
        imageUrl?: string;
    }
    artist: {
        name: string;
    }
    type: 'track';
    download: boolean;
}

export type DeezerSearching = {
    type: 'searching';
}

export type DeezerNoTrackFound = {
    error: {
        message: string;
    }
    type: 'no-track-found';
}

export class DeezerAPI {

    static async getTrack(isrc: string): Promise<DeezerTrack> {
        const res = await fetch(`https://api.deezer.com/track/isrc:${isrc.replaceAll('-', '')}`);
        const data = await res.json();
        if (data.error) {
            return data;
        }
        return {
            id: data.id,
            name: data.title,
            durationSeconds: data.duration,
            isrc: data.isrc,
            deezerUrl: data.link,
            previewUrl: data.preview,
            album: {
                name: data.album.title,
                thumbnailUrl: data.album.cover_small,
            },
            artist: {
                name: data.artist.name
            },
            type: 'track',
            download: true,
        }
    }
}