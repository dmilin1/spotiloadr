import { SpotifyTrack } from "src/api/SpotifyAPI";
import { reactive } from "vue";

export default reactive({
    arl: localStorage.getItem('arl'),
    downloading: false,
    setArl(arl: string) {
        this.arl = arl;
        localStorage.setItem('arl', arl);
    },
    async download(allTracks: SpotifyTrack[]) {
        this.downloading = true;
        const tracks = allTracks.filter(track =>
            track.deezerTrack.type === 'track' && track.deezerTrack.download
        );
        const copy = JSON.parse(JSON.stringify(tracks));
        window.api.download(this.arl ?? '', copy);
    }
})