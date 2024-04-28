import { reactive } from "vue";
import { SpotifyAPI, SpotifyTrack } from "../api/SpotifyAPI";
import { DeezerAPI } from "../api/DeezerAPI";

export default reactive({
    loading: false as boolean,
    error: '',
    items: [] as SpotifyTrack[],
    async getPlaylist(playlistId: string) {
        this.loading = true;
        try {
            this.items = await SpotifyAPI.fetchPlaylist(playlistId);
            this.items.forEach(async (track) => {
                if (track.isrc) {
                    track.deezerTrack = await DeezerAPI.getTrack(track.isrc);
                }
            });
        } catch (e: any) {
            this.error = e.message;
        }
        this.loading = false;
    }
})