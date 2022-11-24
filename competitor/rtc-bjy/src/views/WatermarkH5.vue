<template>
    <Rtc />
</template>

<script>
export default {
    components: {
        Rtc: () => import('./H5Rtc.vue')
    }
}
</script>