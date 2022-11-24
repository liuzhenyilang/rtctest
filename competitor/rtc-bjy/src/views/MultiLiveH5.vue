<template>
    <div class="h5-rtc-demo">
        <header class="nav-header">
            <span class="icon menu" @click="toggleLeftMenu"></span>
            <span class="title">{{pageName}}</span>
        </header>
        <MultiLive :isMobile="true"/>
        <H5LeftMenu :showLeftMenu="showLeftMenu"/>
        <div class="mask" v-if="showLeftMenu" @click="toggleLeftMenu"></div>
    </div>
</template>

<script>
export default {
    components: {
        MultiLive: () => import('./MultiLive.vue'),
        H5LeftMenu: () => import('./components/H5LeftMenu.vue')
    },
    data() {
        return {
            showLeftMenu: false,
            showLogoutModal: false
        }
    },
    computed: {
        pageName() {
          return '连麦直播'
        }
    },
    methods: {
        toggleLeftMenu() {
            this.showLeftMenu = !this.showLeftMenu
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
