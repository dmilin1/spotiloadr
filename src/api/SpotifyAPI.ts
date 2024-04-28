import { DeezerNoTrackFound, DeezerSearching, DeezerTrack } from "./DeezerAPI";

export type SpotifyTrack = {
    name: string;
    addedAt: number;
    durationSeconds: number;
    isrc?: string;
    spotifyUrl?: string;
    album: {
        name: string;
        thumbnailUrl?: string;
        imageUrl?: string;
    }
    artists: [{
        name: string;
    }]
    deezerTrack: DeezerTrack | DeezerSearching | DeezerNoTrackFound;
    downloadStatus: 'downloading' | 'downloaded' | 'error' | 'notStarted';
}

export class SpotifyAPI {
    static auth: {
        bearer: string | null;
        expiry: number;
    } = {
        bearer: null,
        expiry: 0,
    };

    static async authenticate(): Promise<string> {
        if (this.auth.bearer && Date.now() < this.auth.expiry - 60000) {
            return this.auth.bearer;
        }
        const res = await fetch('https://open.spotify.com');
        const data = await res.text();
        const accessToken = data.match(/accessToken":\s?"(.*?)"/)?.[1];
        const expiry = Number(data.match(/accessTokenExpirationTimestampMs":\s?(.*?),/)?.[1]);
        this.auth.bearer = `Bearer ${accessToken}`;
        this.auth.expiry = expiry;
        return this.auth.bearer;
    }

    static async fetchPlaylist(playlistId: string): Promise<SpotifyTrack[]> {
        const bearer = await this.authenticate();

        const trackData: any = [];

        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                Authorization: bearer,
            },
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        trackData.push(...data.items);

        const promises = [];
        for (let offset = data.limit; offset < data.total; offset+=100) {
            promises.push((async () => {
                const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}`, {
                    headers: {
                        Authorization: bearer,
                    },
                });
                const data = await res.json();
                return data.items
            })());
        }

        const results = await Promise.all(promises);
        trackData.push(...results.flat());

        return trackData
        .filter((data: any) => data.track.type === 'track')
        .map((data: any) => ({
            name: data.track.name,
            addedAt: Date.parse(data.added_at),
            durationSeconds: data.track.duration_ms / 1_000,
            isrc: data.track.external_ids.isrc,
            spotifyUrl: data.track.external_urls.spotify,
            album: {
                name: data.track.album.name,
                thumbnailUrl: data.track.album.images.slice(-1)[0]?.url,
                imageUrl: data.track.album.images[0]?.url,
            },
            artists: data.track.artists.map((artist: any) => ({
                name: artist.name,
            })),
            deezerTrack: { type: 'searching' },
            downloadStatus: 'notStarted',
        }));
    }
}