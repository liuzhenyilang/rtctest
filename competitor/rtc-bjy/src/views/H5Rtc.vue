<template>
    <div class="h5-rtc-demo">
        <header class="nav-header">
            <span class="icon menu" @click="toggleLeftMenu"></span>
            <span class="title">{{pageName}}</span>
        </header>
        <Rtc :isMobile="true"/>
        <H5LeftMenu :showLeftMenu="showLeftMenu" @setProxy="setProxy"/>
        <div class="mask" v-if="showLeftMenu" @click="toggleLeftMenu"></div>
        <SetProxiesModal v-model="showSetProxiesModal" :isMobile="true" />
    </div>
</template>

<script>
export default {
    components: {
        Rtc: () => import('./Rtc.vue'),
        H5LeftMenu: () => import('./components/H5LeftMenu.vue'),
        SetProxiesModal: () => import('./components/SetProxiesModal.vue')
    },
    data() {
        return {
            showLeftMenu: false,
            showSetProxiesModal: false
        }
    },
    computed: {
        pageName() {
            let name = this.$route.name
            switch (name) {
                case 'basic': 
                    return '基础音视频通话'
                case 'changeDevice': 
                    return '切换音视频设备'
                case 'screenShare': 
                    return '屏幕分享'
                case 'captureStream': 
                    return '从媒体标签捕获stream'
                case 'captureStreamFromCanvas': 
                    return '从canvas捕获stream'
                case 'videoBitrate': 
                    return '带宽/视频码率设置'
                case 'audioProfile': 
                    return '音频码率设置'
                case 'beauty': 
                    return '美颜'
                case 'watermark': 
                    return '水印'
                default:
                    return ''
            }
        }
    },
    methods: {
        toggleLeftMenu() {
            this.showLeftMenu = !this.showLeftMenu
        },
        setProxy() {
            this.showSetProxiesModal = true
            this.showLeftMenu = false
        }
    }
}
</script>
<style lang="less" scoped>
.h5-rtc-demo {
    .nav-header {
        position: fixed;
        top: 0;
        left: 20px;
        right: 20px;
        height: 54px;
        border-bottom: 1px solid #e3e3e3;
        display: flex;
        align-items: center;
        background: #fff;
        z-index: 1;
        .icon.menu {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: url(./img/brtc-demo-menu-icon.png) no-repeat;
            background-size: cover;
        }
        .title {
            font-size: 16px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            color: #1f2f3d;
            margin-left: 10px;
        }
    }
    .mask {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, .2);
        z-index: 1;
    }
}
</style>

<style lang="less">
.h5-rtc-demo.brtc-rtc-demo-container {
    top: 40px;
    left: 0;
    display: block;
    padding: 0 20px;
    overflow-y: auto;
    .left-section {
        width: 100%;
        .user-info {
            padding: 0;
        }
    }
    .video-section {
        width: 100%;
        margin-left: 0;
        .no-video {
            margin: 20px 0;
            .img {
                margin-top: 0px;
            }
        }
        .has-video {
            .video-container {
                width: calc(50vw - 32px);
                height: calc(36vw - 16px);
            }
            .bjy-video-container .bjy-user-id {
                width: 100%;
                left: 0;
            }
        }
    }
}
</style>