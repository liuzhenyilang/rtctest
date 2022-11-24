<template>
    <div class="h5-left-menu" :class="{'show': showLeftMenu}">
        <div class="logo"></div>
        <el-menu class="el-menu-vertical-demo" :default-active="$route.name" active-text-color="#1795FF">
            <p class="sub-title">基础应用</p>
            <router-link to="/rtc">
                <el-menu-item index="basic">基础音视频通话</el-menu-item>
            </router-link>
            <router-link to="/rtc/changeDevice">
                <el-menu-item index="changeDevice">切换音视频设备</el-menu-item>
            </router-link>
            <router-link to="/rtc/screenShare">
                <el-menu-item index="screenShare">屏幕分享</el-menu-item>
            </router-link>
            <router-link to="/rtc/multiLive">
                <el-menu-item index="multiLive">连麦直播</el-menu-item>
            </router-link>
            <p class="sub-title">进阶应用</p>
            <router-link to="/rtc/captureStream">
                <el-menu-item index="captureStream">从媒体标签捕获stream</el-menu-item>
            </router-link>
            <router-link to="/rtc/captureStreamFromCanvas">
                <el-menu-item index="captureStreamFromCanvas">从canvas捕获stream</el-menu-item>
            </router-link>
            <router-link to="/rtc/videoBitrate">
                <el-menu-item index="videoBitrate">带宽/视频码率设置</el-menu-item>
            </router-link>
            <router-link to="/rtc/audioProfile">
                <el-menu-item index="audioProfile">音频码率设置</el-menu-item>
            </router-link>
            <p class="sub-title">设置</p>
            <div class="btn" @click="setProxy">设置代理</div>
        </el-menu>
    </div>
</template>

<script>
export default {
    props: {
        showLeftMenu: {}
    },
    methods: {
        setProxy() {
            this.$emit('setProxy')
        }
    }
}
</script>
<style lang="less" scoped>
.h5-left-menu {
    position: fixed;
    top: 0;
    left: -300px;
    bottom: 0;
    width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding-left: 20px;
    transition: width 0.3s linear;
    background: #FFF;
    z-index: 2;
    &.show {
        left: 0px;
        width: 290px;
        padding-bottom: 36px;
        .logout {
            color: #FA0000;
            position: fixed;
            bottom: 0;
            width: 290px;
            left: 0;
            padding-bottom: 8px;
            background: #FFF;
        }
        .btn {
            font-size: 14px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            color: #444;
            height: 40px;
            line-height: 40px;
        }
    }
    .logout {
        width: 0;
        transition: width 0.3s linear;
    }
    .logo {
        width: 233px;
        height: 32px;
        background: url(../img/brtc-demo-logo.png);
        background-size: cover;
        margin-top: 30px;
    }
    .el-menu-vertical-demo {
        text-align: left;
        border-right: none;
        padding-top: 10px;
        a {
            text-decoration: none;
        }
        li {
            font-size: 14px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            background: #fff !important;
            color: #444;
            height: 40px;
            line-height: 40px;
            padding-left: 0 !important;
            &:hover {
                color: #1795FF !important;
            }
        }
        .sub-title {
            font-size: 16px;
            font-family: PingFangSC, PingFangSC-Medium;
            font-weight: 500;
            margin: 28px 0 20px;
        }
    }
}
</style>