<template>
    <div class="button-section">
        <div>
            <el-button type="primary" :disabled="isJoined" @click="join">JOIN</el-button>
            <el-button type="primary" @click="leave">LEAVE</el-button>
        </div>
        <div v-if="$route.name !== 'watermark'">
            <el-button type="primary" :disabled="isJoined && isPublished" @click="publish">PUBLISH</el-button>
            <el-button type="primary" @click="unpublish">UNPUBLISH</el-button>
        </div>
        <template v-if="!isMobile && $route.name === 'screenShare'">
            <div>
                <el-button type="primary" :disabled="isScreenShared || screenSharedStatus" @click="screenShare">START SCREEN SHARE</el-button>
            </div>
            <div>
                <el-button type="primary" @click="closeScreenShare">STOP SCREEN SHARE</el-button>
            </div>
        </template>
        <template v-if="$route.name === 'changeDevice'">
            <div>
                <el-button type="primary" @click="switchCamera">SWITCH CAMERA</el-button>
            </div>
            <div>
                <el-button type="primary" @click="switchMicrophone">SWITCH MICROPHONE</el-button>
            </div>
        </template>
        <template v-if="$route.name === 'multiLive'">
            <div>
                <el-button type="primary" :disabled="!enableStartMixTranscode" @click="startMixTranscode">START MIX TRANSCODE</el-button>
            </div>
            <div>
                <el-button type="primary" :disabled="!enableStopMixTranscode" @click="stopMixTranscode">STOP MIX TRANSCODE</el-button>
            </div>
            <div>
                <el-button type="primary" @click="switchRole">SWITCH ROLE</el-button>
            </div>
            <div v-if="canPlay">
                <el-button type="primary" @click="play">PLAY</el-button>
            </div>
        </template>
        <template v-if="$route.name === 'watermark'">
            <div>
                <el-button type="primary" @click="showSettingWatermark = true">SETTING WATERMARK</el-button>
            </div>
        </template>
        <div class="beauty-setting" v-if="$route.name === 'beauty'">
            <div>
                <label>美颜</label>
                <el-slider class="slider" v-model="beauty"></el-slider>
            </div>
            <div>
                <label>高光</label>
                <el-slider class="slider" v-model="highlight"></el-slider>
            </div>
            <div>
                <label>红润</label>
                <el-slider class="slider" v-model="rosy"></el-slider>
            </div>
        </div>
        <SettingWatermark ref="watermark" v-model="showSettingWatermark" 
            @setWatermark="setWatermark" @switchWatermark="switchWatermark"/>
    </div>
</template>

<script>
import debounce from '../../util/debounce'
export default {
    props: {
        client: {},
        appId: {},
        isJoined: {},
        isPublished: {},
        isScreenShared: {},
        isMobile: {},
        screenSharedStatus: {},
        enableStartMixTranscode: {},
        enableStopMixTranscode: {},
        disablePushStream: {},
        canPlay: {}
    },
    data() {
        return {
            audioTrackStatus: false,
            beauty: 50,
            highlight: 50,
            rosy: 50,
            showSettingWatermark: false,
            hasStartMixTransCode: false
        }
    },
    components: {
        SettingWatermark: () => import('./SettingWatermark.vue')
    },
    watch: {
        beauty: function (value) {
            if (this.isJoined) {
                this.$emit('setBeauty', { key: 'beauty', value: value / 100 })
            }
        },
        highlight: function (value) {
            if (this.isJoined) {
                this.$emit('setBeauty', { key: 'highlight', value: value / 100 })
            }
        },
        rosy: function (value) {
            if (this.isJoined) {
                this.$emit('setBeauty', { key: 'rosy', value: value / 100 })
            }
        }
    },
    methods: {
        join: debounce(function () {
            this.$emit('join')
        }, 1000, true),
        leave() {
            if (this.isJoined) {
                this.$emit('leave')
            }
        },
        publish() {
            if (this.isJoined) {
                this.$emit('publish')
            }
        },
        unpublish() {
            if (this.isJoined && this.isPublished) {
                this.$emit('unpublish')
            }
        },
        screenShare() {
            if (this.isJoined) {
                this.$emit('screenShare')
            }
        },
        closeScreenShare() {
            if (this.isJoined && this.isScreenShared) {
                this.$emit('closeScreenShare')
            }
        },
        replaceTrack: debounce(function (type) {
            if (this.isJoined) {
                this.$emit('replaceTrack', type)
            }
        }, 1000, true),
        switchCamera: debounce(function () {
            if (this.isJoined) {
                this.$emit('switchCamera')
            }
        }, 1000, true),
        switchMicrophone: debounce(function () {
            if (this.isJoined) {
                this.$emit('switchMicrophone')
            }
        }, 1000, true),
        switchWatermark(value) {
            this.$emit('switchWatermark', value)
        },
        setWatermark(watermark) {
            this.$emit('setWatermark', watermark)
        },
        getWatermark() {
            if (this.$refs['watermark']) {
                return this.$refs['watermark'].watermark
            }
            return ''
        },
        getWatermarkStatus() {
            if (this.$refs['watermark']) {
                return this.$refs['watermark'].enableWatermark
            }
            return false
        },
        startMixTranscode() {
            this.hasStartMixTransCode = true
            this.$emit('startMixTranscode')
        },
        stopMixTranscode() {
            this.hasStartMixTransCode = false
            this.$emit('stopMixTranscode')
        },
        switchRole() {
            this.$emit('switchRole')
        },
        play() {
            this.$emit('play')
        }
    }
}
</script>

<style lang="less">
.button-section {
    width: 100%;
    padding: 10px 0;
    > div {
        margin-top: 10px;
        text-align: left;
        .el-button {
            min-width: 132px;
            & + .el-button {
                margin-left: 12px;
            }
        }
    }
    .beauty-setting {
        > div {
            display: flex;
            > label {
                display: inline-flex;
                margin-right: 10px;
                align-items: center;
            }
            .slider {
                display: inline-flex;
                width: 240px;
                align-items: center;
            }
        }
        .el-slider__button-wrapper {
            z-index: 0;
        }
    }
}
</style>