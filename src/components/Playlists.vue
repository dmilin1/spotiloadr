<script setup lang="ts">
    import { ref, computed } from 'vue';
    import moment from 'moment';
    import { FaDeezer } from 'vue3-icons/fa';
    import { FaX, FaDownload, FaCheck, FaExclamation } from 'vue3-icons/fa6';
    import { ImCheckboxUnchecked, ImCheckboxChecked } from 'vue3-icons/im';
    import playlist from '../state/playlist';
    import { SpotifyTrack } from '../api/SpotifyAPI';

    type Sort = 'addedAt' | 'name' | 'album' | 'duration';

    const sort = ref<Sort>('addedAt');
    const sortDirection = ref('asc');

    const sortedItems = computed(() => playlist.items.toSorted((a: SpotifyTrack, b: SpotifyTrack) => {
        const direction = sortDirection.value === 'asc' ? 1 : -1;
        if (sort.value === 'addedAt') {
            return (a.addedAt - b.addedAt) * direction;
        } else if (sort.value === 'name') {
            return a.name.localeCompare(b.name) * direction;
        } else if (sort.value === 'album') {
            return a.album.name.localeCompare(b.album.name) * direction;
        } else if (sort.value === 'duration') {
            return (a.durationSeconds - b.durationSeconds) * direction;
        }
        return 0;
    }));

    const changeSort = (newSort: Sort) => {
        if (sort.value === newSort) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sort.value = newSort;
            sortDirection.value = 'asc';
        }
    }
</script>

<template>
    <div class="grid grid-cols-[auto_auto_1fr_1fr_1fr_auto_auto_auto] flex-col self-stretch rounded-2xl overflow-auto m-4">
        <div class="sticky top-0 z-10 bg-tint grid grid-cols-subgrid col-span-full text-textSubtle min-h-14 items-center gap-4 px-4">
            <div class="cursor-pointer">#</div>
            <div></div>
            <div class="cursor-pointer" @click="changeSort('name')">Name</div>
            <div class="cursor-pointer" @click="changeSort('album')">Album</div>
            <div class="cursor-pointer" @click="changeSort('addedAt')">Added / Preview</div>
            <div class="cursor-pointer mr-8" @click="changeSort('duration')">Duration</div>
            <div class="cursor-pointer">Download</div>
            <div class="cursor-pointer">Status</div>
        </div>
        <div
            v-for="(track, i) in sortedItems"
            class="grid grid-cols-subgrid col-span-full rounded-md bg-tint hover:bg-highlight mt-2"
        >
            <div class="grid grid-cols-subgrid col-span-full text-textSubtle min-h-14 items-center gap-4 px-4">
                <div class="tabular-nums">{{ i+1 }}</div>
                <img
                    class="h-10 w-10"
                    :src="track.album.thumbnailUrl"
                />
                <div>
                    <div class="line-clamp-1 text-text">{{ track.name }}</div>
                    <div class="line-clamp-1 text-sm">{{ track.artists.map(a => a.name).join(', ') }}</div>
                </div>
                <div class="line-clamp-1 text-sm">{{ track.album.name }}</div>
                <div class="line-clamp-1 text-sm">{{ moment(track.addedAt).format('MMM D, YYYY') }}</div>
                <div class="line-clamp-1 text-sm tabular-nums">{{ Math.floor(track.durationSeconds/60) }}:{{ String(Math.round(track.durationSeconds%60)).padStart(2, '0') }}</div>
            </div>
            <div
                class="grid grid-cols-subgrid col-span-full text-textSubtle min-h-14 items-center gap-4 px-4"
            >
                <div><FaDeezer/></div>
                <template v-if="track.deezerTrack.type === 'track'">
                    <img
                        class="h-10 w-10"
                        :src="track.album.thumbnailUrl"
                    />
                    <div>
                        <div class="line-clamp-1 text-text">{{ track.deezerTrack.name }}</div>
                        <div class="line-clamp-1 text-sm">{{ track.deezerTrack.artist.name }}</div>
                    </div>
                    <div class="line-clamp-1 text-sm">{{ track.deezerTrack.album.name }}</div>
                    <audio controls controlslist="nodownload noplaybackrate" preload="none" class="h-8 w-36">
                        <source :src="track.deezerTrack.previewUrl">
                    </audio>
                    <div class="line-clamp-1 text-sm tabular-nums">{{ Math.floor(track.deezerTrack.durationSeconds/60) }}:{{ String(Math.round(track.deezerTrack.durationSeconds%60)).padStart(2, '0') }}</div>
                    <div
                        class="flex justify-center items-center cursor-pointer self-stretch"
                        @click="track.deezerTrack.download = !track.deezerTrack.download"
                    >
                        <ImCheckboxUnchecked
                            class="justify-self-center"
                            v-if="!track.deezerTrack.download"
                        />
                        <ImCheckboxChecked
                            class="justify-self-center text-green"
                            v-else
                        />
                    </div>
                    <div class="flex justify-center items-center">
                        <FaX v-if="!track.deezerTrack.download"/>
                        <FaDownload v-else-if="track.downloadStatus === 'downloading'"/>
                        <FaCheck v-else-if="track.downloadStatus === 'downloaded'"/>
                        <FaExclamation v-else-if="track.downloadStatus === 'error'"/>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>