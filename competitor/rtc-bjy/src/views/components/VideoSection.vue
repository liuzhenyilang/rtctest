<template>
    <div class="no-video" v-if="!renderStreamList.length">
        <div class="img"></div>
        <p>还没有视频加入</p>
    </div>
    <div class="has-video" v-else>
        <template v-for="streamItem in renderStreamList">
            <Video class="video-container" :isScreenShared="isScreenShared" 
                :speakerList="speakerList" :key="streamItem.getStreamId()" 
                :ref="streamItem.getStreamId()" :stream="streamItem"
                @screenShare="screenShare" @closeScreenShare="closeScreenShare"
                @toggleSubscribe="toggleSubscribe" :isMobile="isMobile"
                :screenSharedStatus="screenSharedStatus"
                />
        </template>
    </div>
</template>

<script>
export default {
    props: {
        renderStreamList: {},
        speakerList: {},
        isScreenShared: {},
        isMobile: {},
        screenSharedStatus: {}
    },
    data() {
        return {
            
        }
    },
    components: {
        Video: () => import('./Video.vue')
    },
    methods: {
        getVideoInstance(id) {
            let item = this.$refs[id]
            if (Array.isArray(item)) {
                return item[0]
            }
            return item
        },
        screenShare() {
            this.$emit('screenShare')
        },
        closeScreenShare() {
            this.$emit('closeScreenShare')
        },
        toggleSubscribe(info) {
            this.$emit('toggleSubscribe', info)
        }
    }
}
</script>

<style lang="less" scoped>
.no-video {
    width: 100%;
    height: 100%;
    text-align: center;
    .img {
        display: inline-block;
        width: 120px;
        height: 120px;
        background: url(../img/no-video.png);
        background-size: cover;
        margin-top: 250px;
    }
    >p {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: center;
        color: #5e6d82;
        margin: 0;
    }
}
.has-video {
    width: 100%;
    height: 100%;
}
.video-container {
    width: 223px;
    height: 167px;
    border-radius: 8px;
    display: inline-block;
    margin-bottom: 20px;
    &:nth-child(2n + 1) {
        margin-right: 20px;
    }
}
</style>