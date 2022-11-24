<template>
    <div class="bjy-video-container">
        <div ref="video" class="bjy-video"></div>
        <label class="video-network-status">
            <span class="network upload icon"></span>
            <span class="network upload signal"></span>
            <span class="network download icon"></span>
            <span class="network download signal"></span>
        </label>
        <label class="bjy-user-id">
            <span class="user-id" v-if="!isScreen">User{{stream.getUserId() / 10}}</span>
            <span class="user-id" v-else>{{(stream.getUserId() - 1) / 10}}屏幕分享</span>
            <div class="btn-section">
                <el-tooltip class="item" effect="dark" v-if="!isScreen && isSelf && !isMobile && $route.name !== 'multiLive'"
                    :content="isScreenShared ? 'Stop Share Screen' : 'Share Screen'" placement="bottom">
                    <span class="icon screen" :class="{'close': isScreenShared}" @click="toggleScreenShare"></span>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" v-if="!isScreen"
                    :content="isSelf ? (videoOn ? 'Mute Video' : 'Unmute Video') : (videoStatus ? 'Unsubscribe Video' : 'Subscribe Video')" placement="bottom">
                    <span class="icon camera" :class="{'close': (!isSelf && !videoStatus) || (isSelf && !videoOn)}" @click="toggleCamera"></span>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" v-if="!isScreen"
                    :content="isSelf ? (audioOn ? 'Mute Audio' : 'Unmute Audio') : (audioStatus ? 'Unsubscribe Audio' : 'Subscribe Audio')" placement="bottom">
                    <span class="icon mic" :class="{'close': (!isSelf && !audioStatus) || (isSelf && !audioOn)}" @click="toggleMic"></span>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" v-if="isScreen && !isSelf"
                    :content="videoOn ? 'Unsubscribe Video' : 'Subscribe Video'" placement="bottom">
                    <span class="icon camera" :class="{'close': !videoStatus}" @click="toggleCamera"></span>
                </el-tooltip>
            </div>
        </label>
    </div>
</template>

<script>
import debounce from '../../util/debounce'
import { mapState } from 'vuex'
export default {
    name: 'Video',
    props: {
        stream: {
            type: Object
        },
        speakerList: {
            type: Array
        },
        isScreenShared: {
            default: false
        },
        isMobile: {},
        screenSharedStatus: {}
    },
    data() {
        return {
            volume: 0,
            videoOn: this.stream && this.stream.getVideoOn(),
            audioOn: this.stream && this.stream.getAudioOn(),
            isScreen: false,
            isSelf: this.stream && this.stream.isLocalStream() || !this.stream,
            stats: {},
            videoBitrate: 0,
            audioBitrate: 0,
            audioStatus: true,
            videoStatus: true
        }
    },
    computed: {
        ...mapState({
        speakerIndex: 'speakerIndex'
        })
    },
    watch: {
        stream: {
            handler(stream, oldStream) {
                if (oldStream) {
                    oldStream.stop()
                    this.onPlayerStateChange && oldStream.off('player-state-changed', this.onPlayerStateChange)
                }
                if (stream) {
                    this.$nextTick(() => {
                        this.onPlayerStateChange = (state) => {
                            // 播放失败了需要添加一个按钮
                            if (state.type === 'error' && state.reason && state.reason.name === 'NotAllowedError') {
                                this.$message({
                                    type: 'error',
                                    message: '请刷新重试'
                                })
                            }
                        }
                        stream.on('player-state-changed', this.onPlayerStateChange)
                        if (!stream.isLocalStream() && this.speakerList[this.speakerIndex]) {
                            stream.setAudioOutput(this.speakerList[this.speakerIndex].deviceId)
                        }
                        if (!stream.isLocalStream()) {
                            stream.setAudioVolume(1)
                        }
                        stream.play(this.$refs.video).then(() => {
                            console.log(`stream ${stream.getUserId()} ${stream.getStreamId()} play success`)
                            if (this.isSelf && this.stream.isScreenStream()) {
                                this.$emit('selfScreenFrame', this.stream.getVideoFrame())
                            }
                            this.isScreen = stream.isScreenStream() || /1$/.test(stream.getUserId() + '')
                        })
                    })
                    this.videoOn = this.stream.getVideoOn()
                    this.audioOn = this.stream.getAudioOn()
                    this.isSelf = this.stream.isLocalStream()
                }
            },
            immediate: true
        },

        speakerIndex: function (val) {
            if (this.stream && !this.stream.isLocalStream()) {
                this.stream.setAudioOutput(this.speakerList[val].deviceId)
            }
        }
    },
    beforeDestroy() {
        if (this.stream) {
            this.stream.stop()
            this.onPlayerStateChange && this.stream.off('player-state-changed', this.onPlayerStateChange)
        }
    },
    methods: {
        toggleCamera: debounce(function () {
            if (this.isSelf) {
                if (this.videoOn) {
                    this.stream.muteVideo()
                    this.videoOn = false
                } 
                else {
                    this.stream.unmuteVideo()
                    this.videoOn = true
                }
            }
            else {
                this.$emit('toggleSubscribe', {
                    stream: this.stream,
                    audioOn: this.audioStatus,
                    videoOn: !this.videoStatus
                })
                this.videoStatus = !this.videoStatus
            }
        }, 1000, true),
        toggleMic: debounce(function () {
            if (this.isSelf) {
                if (this.audioOn) {
                    this.stream.muteAudio()
                    this.audioOn = false
                } 
                else {
                    this.stream.unmuteAudio()
                    this.audioOn = true
                }
            }
            else {
                this.$emit('toggleSubscribe', {
                    stream: this.stream,
                    audioOn: !this.audioStatus,
                    videoOn: this.videoStatus
                })
                this.audioStatus = !this.audioStatus
            }
        }, 1000, true),
        updateMediaStatus() {
            if (this.stream) {
                this.videoOn = this.stream.getVideoOn()
                this.audioOn = this.stream.getAudioOn()
            }
        },
        toggleScreenShare: debounce(function () {
            if (this.isScreenShared) {
                this.$emit('closeScreenShare')
            }
            else if (!this.screenSharedStatus) {
                this.$emit('screenShare')
            }
        }, 1000, true)
    }
}
</script>

<style lang="less">
.bjy-video-container {
    background-color: #000;
    display: inline-block;
    position: relative;
    border-radius: 8px;
    .bjy-user-id {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 3px 10px;
        position: absolute;
        left: 0;
        bottom: 0;
        height: 24px;
        color: #fff;
        background-color: #202020;
        opacity: .5;
        border-radius: 0 0 8px 8px;
        font-size: 14px;
        .btn-section .icon {
            cursor: pointer;
        }
    }
    .bjy-video {
        border-radius: 8px;
        height: 100%;
        > div {
            border-radius: 8px;
            > video {
                border-radius: 8px;
            }
        }
    }
    .video-network-status {
        .network {
            display: inline-block;
            width: 24px;
            height: 24px;
            position: absolute;
            top: 0;
            &.signal {
                background: url(../img/top-icon-sprites.png) no-repeat;
                background-size: 254px 48px;
                background-position: -230px 0;
                &.upload {
                    left: 24px;
                    top: -2px;
                }
                &.download {
                    left: 72px;
                    top: -2px;
                }
            }
        }
    }
    .icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: url(../img/rtc-demo-video-icons.png) no-repeat;
        background-size: 101px 48px;
        &.network.upload {
            background-position: -24px 0;
            left: 0;
        }
        &.network.download {
            background-position: -24px -24px;
            left: 48px;
        }
        &.screen {
            background-position: -75px 2px;
        }
        &.camera {
            background-position: 0 2px;
        }
        &.mic {
            background-position: -48px 2px;
        }
        &.close {
            background-position-y: -21px;
        }
    }
}
</style>
