<script setup lang="ts">
    import Searchbar from './components/SearchBar.vue';
    import Playlists from './components/Playlists.vue';
</script>

<template>
    <div class="flex flex-col w-screen h-screen items-center bg-black">
        <Searchbar />
        <Playlists />
    </div>
</template>