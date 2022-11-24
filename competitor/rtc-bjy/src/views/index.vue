<template>
    <div class="brtc-rtc-demo">
        <div class="brtc-header">
            <div class="logo"></div>
            <div class="right-menu">
                <div class="item">SDK 版本：v{{version}}</div>
                <a href="https://docs.baijiayun.com/rtc/" target="_blank" class="item link">
                    <div>
                        API 文档
                    </div>
                </a>
                <div class="item btn">
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            设置 <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="showSetProxiesModal=true">设置代理</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>
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
            <router-link to="/rtc/beauty">
                <el-menu-item index="beauty">美颜</el-menu-item>
            </router-link>
            <router-link to="/rtc/watermark">
                <el-menu-item index="watermark">水印</el-menu-item>
            </router-link>
        </el-menu>
        <router-view class="brtc-rtc-demo-container"></router-view>
        <UserInfoModal v-model="showUserInfoModal"/>
        <SetProxiesModal v-model="showSetProxiesModal"/>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showUserInfoModal: false,
            version: BRTC.version,
            showSetProxiesModal: false
        }
    },
    components: {
        UserInfoModal: () => import('./components/UserInfoModal.vue'),
        SetProxiesModal: () => import('./components/SetProxiesModal.vue')
    }
}
</script>

<style lang="less" scoped>
.brtc-rtc-demo {
    width: 1140px;
    margin: 0 auto;
    position: relative;
    height: 100%;
    .brtc-header {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #d8d8d8;
        .logo {
            width: 233px;
            height: 32px;
            background: url(./img/brtc-demo-logo.png);
            background-size: cover;
        }
        .right-menu {
            display: inline-flex;
            font-size: 16px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            color: #aaa;
            .item + .item{
                color: #666;
                margin-left: 30px;
                text-decoration: none;
            }
            .link, .btn .el-dropdown-link {
                cursor: pointer;
                font-size: 16px;
                &:hover {
                    color: #1795FF;
                }
            }
        }
    }
    .el-menu-vertical-demo {
        width: 260px;
        position: absolute;
        top: 80px;
        bottom: 0;
        left: 0;
        overflow-y: auto;
        text-align: left;
        border-right: none;
        padding-top: 30px;
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

<style lang="less">
.brtc-rtc-demo-container {
    position: absolute;
    top: 80px;
    bottom: 0px;
    left: 270px;
    right: 0px;
    padding-top: 35px;
    display: flex;
}
</style>
