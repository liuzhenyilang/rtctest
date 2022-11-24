<template>
    <div class="user-info">
        <header v-if="!isMobile">{{pageName}}</header>
        <el-form ref="userInfo" class="form" :model="userInfo" label-position="top">
            <el-form-item label="UserID">
                <el-input v-model="userInfo.userId" :disabled="true" 
                    placeholder="请输入UserID" :style="{width: isMobile ? '100%' : '280px'}"></el-input>
            </el-form-item>
            <el-form-item label="RoomID">
                <el-input v-model="userInfo.roomId" 
                    :disabled="true" placeholder="请输入RoomID" 
                    :style="{width: isMobile ? '100%' : '280px'}" @blur="changeRoomId"></el-input>
            </el-form-item>
            <template v-if="$route.name === 'videoBitrate'">
                <el-form-item label="VideoBitrate/BandWidth(kbps)">
                    <el-input v-model="userInfo.videoBitrate" 
                        :disabled="isJoined" placeholder="请输入VideoBitrate" 
                        :style="{width: isMobile ? '100%' : '280px'}"></el-input>
                </el-form-item>
            </template>
            <template v-if="$route.name === 'audioProfile'">
                <el-form-item label="AudioProfile">
                    <el-select v-model="userInfo.audioProfile" :disabled="isJoined" 
                        placeholder="AudioProfile" 
                        :style="{width: isMobile ? '100%' : '280px'}">
                        <el-option v-for="option in audioProfileList" 
                            :key="option.value" :label="option.label" :value="option.value"></el-option>
                    </el-select>
                </el-form-item>
            </template>
            <template v-if="$route.name !== 'captureStream' && 
                $route.name !== 'captureStreamFromCanvas'">
                <el-form-item label="Camera Select">
                    <el-select v-model="userInfo.cameraId" 
                        placeholder="Camera Select" :style="{width: isMobile ? '100%' : '280px'}">
                        <el-option v-for="option in renderCameraList" 
                            :key="option.deviceId" :label="option.name" :value="option.deviceId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Microphone Select">
                    <el-select v-model="userInfo.microphoneId" 
                        placeholder="Microphone Select" :style="{width: isMobile ? '100%' : '280px'}">
                        <el-option v-for="option in renderMicrophoneList" 
                            :key="option.deviceId" :label="option.name" :value="option.deviceId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Speaker Select">
                    <el-select v-model="userInfo.speakerId" placeholder="Speaker Select" :style="{width: isMobile ? '100%' : '280px'}">
                        <el-option v-for="option in renderSpeakerList" :key="option.deviceId" :label="option.name" :value="option.deviceId"></el-option>
                    </el-select>
                </el-form-item>
            </template>
            <template v-if="$route.name === 'captureStream'">
                <video class="video-tag" id="videoDemo" src="../img/chrome.mp4" controls loop></video>
            </template>
            <template v-if="$route.name === 'captureStreamFromCanvas'">
                <CanvasAnimation ref="canvasDemo"/>
            </template>
        </el-form>
        <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            :width="isMobile ? '80%' : '300px'">
            <div class="tip-text">当前浏览器不支持 WebRTC SDK，请更换其他浏览器</div>
            <div class="buttons" @click="dialogVisible = false">我知道了</div>
        </el-dialog>
        <el-dialog
            title="提示"
            :visible.sync="showFunctionDialog"
            :width="isMobile ? '80%' : '300px'">
            <div class="tip-text">当前浏览器不支持该功能</div>
            <div class="buttons" @click="showFunctionDialog = false">我知道了</div>
        </el-dialog>
    </div>
</template>

<script>
import isSupportWebrtc from '../../util/isSupportWebrtc'
import { ROOM_ID, USER_ID } from '../config'
export default {
    props: {
        cameraList: {},
        microphoneList: {},
        speakerList: {},
        isJoined: {},
        isMobile: {}
    },
    data() {
        return {
            userInfo: {
                userId: '',
                roomId: '',
                cameraId: '',
                microphoneId: '',
                speakerId: '',
                videoBitrate: 500,
                bandWidth: 0,
                audioProfile: 'standard'
            },
            bandWidthList: [
                { label: 'None', value: 0 },
                { label: '2000', value: 2000 },
                { label: '1000', value: 1000 },
                { label: '500', value: 500 },
                { label: '250', value: 250 },
                { label: '125', value: 125 }
            ],
            audioProfileList: [
                { label: 'standard(48kHz/双声道/40kbps)', value: 'standard' },
                { label: 'high(48kHz/双声道/128kbps)', value: 'high' },
            ],
            dialogVisible: false,
            showFunctionDialog: false
        }
    },
    watch: {
        'userInfo.userId': function(newVal, oldValue) {
            let userId = (newVal + '').replace(/[^0-9]/g, '')
            userId = (userId + '').substring(0, 11)
            this.userInfo.userId = userId
        },
        'userInfo.roomId': function(newVal, oldValue) {
            this.userInfo.roomId = (newVal + '').replace(/[^0-9]/g, '')
        },
        'userInfo.videoBitrate': function(newVal, oldValue) {
            this.userInfo.videoBitrate = (newVal + '').replace(/[^0-9]/g, '')
        },
        'userInfo.speakerId': function (newVal) {
            const index = this.speakerList.findIndex((item) => item.deviceId === newVal)
            this.$store.commit('speakerIndex', {
                speakerIndex: index
            })
            this.$emit('speakerChange', this.speakerList[index])
        }
    },
    computed: {
        renderCameraList() {
            let list = this.cameraList.map((item) => {
                return {
                    ...item,
                    name: (item.default ? '默认 - ' : '') + item.name
                }
            })
            return list
        },
        renderMicrophoneList() {
            let list = this.microphoneList.map((item) => {
                return {
                    ...item,
                    name: (item.default ? '默认 - ' : '') + item.name
                }
            })
            return list
        },
        renderSpeakerList() {
            let list = this.speakerList.map((item) => {
                return {
                    ...item,
                    name: (item.default ? '默认 - ' : '') + item.name
                }
            })
            return list
        },
        pageName() {
            let name = this.$route.name
            switch (name) {
                case 'basic': 
                    return '基础音视频通话'
                case 'changeDevice': 
                    return '切换音视频设备'
                case 'screenShare': 
                    return '屏幕分享'
                case 'multiLive': 
                    return '连麦直播'
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
    components: {
        CanvasAnimation: () => import('./CanvasAnimation.vue')
    },
    mounted() {
        if (!isSupportWebrtc()) {
            this.dialogVisible = true
        }
        this.userInfo.roomId = ROOM_ID
        this.userInfo.userId = USER_ID
    },
    methods: {
        changeRoomId() {
            if (this.$route.name !== 'beauty' && this.$route.name !== 'watermark') {
                this.$emit('changeRoomId', this.userInfo.roomId)
            }
        },
        captureVideoStream() {
            if (document.getElementById('videoDemo').captureStream) {
                return document.getElementById('videoDemo').captureStream()
            }
            this.showFunctionDialog = true
            return ''
        },
        captureCanvasStream() {
            let captureCanvasStream = this.$refs['canvasDemo'].captureCanvasStream()
            if (captureCanvasStream) {
                return captureCanvasStream
            }
            this.showFunctionDialog = true
            return ''
        }
    }
}
</script>

<style lang="less">
.user-info {
    margin-top: 15px;
    padding-right: 20px;
    >header {
        text-align: left;
        font-size: 24px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #1f2f3d;
    }
    .form {
        margin-top: 30px;
    }
    .el-form-item {
        margin-bottom: 0;
        text-align: left;
        & + .el-form-item {
            margin-top: 20px;
        }
    }
    .el-form--label-top {
        .el-form-item__label {
            padding: 0;
            line-height: 0;
            font-size: 14px;
            margin-bottom: 10px;
        }
    }
    .tip-text {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #1f2f3d;
        margin-top: -20px;
        word-break: break-word;
    }
    .buttons {
        width: 100%;
        height: 34px;
        line-height: 34px;
        text-align: center;
        color: #fff;
        background: #1795FF;
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        margin-top: 20px;
        cursor: pointer;
    }
    .video-tag {
        width: 280px;
        height: 158px;
        margin-top: 20px;
        position: relative;
        z-index: 0;
    }
}
</style>