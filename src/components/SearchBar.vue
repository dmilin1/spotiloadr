<script setup lang="ts">
    import { onUnmounted, ref } from 'vue';
    import { FaSearch } from 'vue3-icons/fa';
    import { FaDeezer } from 'vue3-icons/fa';
    import { AiOutlineLoading3Quarters } from 'vue3-icons/ai';
    import playlist from '../state/playlist';
    import deezer from '../state/deezer';

    const arlError = ref<string|null>(null);

    const searchStr = defineModel('searchStr', { type: String, default: '' });

    const handleArlChange = (e: Event) => {
        deezer.setArl((e.target as HTMLInputElement).value);
        arlError.value = null;
    }

    const getPlaylist = () => {
        const playlistId = searchStr.value.split('/').slice(-1)[0]?.split('?')[0];
        playlist.getPlaylist(playlistId);
    }
    
    const closeArlErrorListener = window.api.arlErrorListener((error) => {
        arlError.value = error;
    });

    const closeDownloadStatusListener = window.api.downloadStatusListener((trackId, status) => {
        const track = playlist.items.find(track =>
            track.deezerTrack.type === 'track' && track.deezerTrack.id === trackId
        );
        if (track) {
            track.downloadStatus = status;
        }
    });

    const closeFinishedListener = window.api.finishedListener(() => {
        deezer.downloading = false;
    });

    onUnmounted(() => {
        closeArlErrorListener();
        closeDownloadStatusListener();
        closeFinishedListener();
    });
</script>

<template>
    <div class="flex self-stretch rounded-full overflow-hidden min-h-12 mx-4 mt-4 pl-4 bg-input">
        <FaSearch class="text-text self-center"/>
        <input
            class="flex grow mx-4 mr-rounded-mdoutline-none bg-input outline-none text-text"
            placeholder="Spotify Playlist"
            v-model="searchStr"
            @input="playlist.error = ''"
            @keydown.enter="getPlaylist()"
        />
        <div
            class="flex items-center justify-center self-center bg-green mr-4 px-8 h-8 w-32 rounded-full cursor-pointer"
            @click="getPlaylist()"
        >
            <AiOutlineLoading3Quarters
                v-if="playlist.loading"
                size="22px"
                class="self-center animate-spin"
            />
            <div v-else>Search</div>
        </div>
    </div>
    <div
        class="text-red-500 py-1"
        v-if="playlist.error"
    >
        {{playlist.error}}
    </div>
    <div class="flex self-stretch rounded-full overflow-hidden min-h-12 mx-4 mt-4 pl-4 bg-input">
        <FaDeezer class="text-text self-center"/>
        <input
            class="flex grow mx-4 mr-rounded-mdoutline-none bg-input outline-none text-text"
            placeholder="Deezer ARL"
            @input="handleArlChange"
            :value="deezer.arl"
        />
        <div
            class="flex items-center justify-center self-center bg-green mr-4 px-8 h-8 w-32 rounded-full cursor-pointer"
            @click="!deezer.downloading && deezer.download(playlist.items)"
        >
            <AiOutlineLoading3Quarters
                v-if="deezer.downloading"
                size="22px"
                class="self-center animate-spin"
            />
            <div v-else>Download</div>
        </div>
    </div>
    <div
        class="text-red-500 py-1"
        v-if="arlError"
    >
        {{arlError}}
    </div>
</template>