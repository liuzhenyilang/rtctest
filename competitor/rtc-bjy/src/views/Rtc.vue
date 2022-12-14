<template>
    <div>
        <div class="left-section">
            <UserInfo :isMobile="isMobile" :isJoined="isJoined" :cameraList="cameraList" 
                :microphoneList="microphoneList" :speakerList="speakerList" ref="userInfo" @changeRoomId="changeRoomId"/>
            <ButtonSection ref="buttonSection" :isScreenShared="isScreenShared" 
                :isPublished="isPublished"
                :screenSharedStatus="screenSharedStatus" :isJoined="isJoined" 
                @join="join" @leave="leave" @publish="publish" @unpublish="unpublish" :isMobile="isMobile"
                @screenShare="screenShare" @closeScreenShare="closeScreenShare" @replaceTrack="replaceTrack"
                @switchCamera="switchCamera" @switchMicrophone="switchMicrophone"
                :watermarkStatus="watermarkStatus" @switchWatermark="switchWatermark"
                @setBeauty="setBeauty" @setWatermark="setWatermark"/>
            <template v-if="$route.name === 'videoBitrate' || $route.name === 'audioProfile'">
                <BaseChart ref="videoBitrate" :publishStream="publishStream"/>
            </template>
            <template v-if="($route.name !== 'beauty' && $route.name !== 'watermark' && !isMobile)">
                <QrCode ref="qrcode"/>
            </template>
        </div>
        <div class="video-section">
            <VideoSection ref="videoSection" :isScreenShared="isScreenShared" 
                :screenSharedStatus="screenSharedStatus"
                :renderStreamList="renderStreamList" :speakerList="speakerList"
                @screenShare="screenShare" @closeScreenShare="closeScreenShare"
                @toggleSubscribe="toggleSubscribe" :isMobile="isMobile"/>
        </div>
    </div>
</template>

<script>
import { APP_ID, MAIN_SIG, ASSIST_SIG } from './config'
export default {
    props: {
        isMobile: {}
    },
    components: {
        UserInfo: () => import('./components/UserInfo.vue'),
        ButtonSection: () => import('./components/ButtonSection.vue'),
        VideoSection: () => import('./components/VideoSection.vue'),
        QrCode: () => import('./components/QrCode.vue'),
        BaseChart: () => import('./components/BaseChart.vue')
    },
    data() {
        return {
            client: {},
            assistClient: null,
            tokenPath: '/api/auth/service/token',
            appId: '',
            remoteStreamList: [],
            cameraList: [],
            microphoneList: [],
            speakerList: [],
            publishStream: null,
            publishScreenStream: null,
            isJoined: false,
            isScreenShared: false,
            screenSharedStatus: false,
            watermarkStatus: false,
            isPublished: false
        }
    },
    watch: {
        isJoined(val) {
            this.$store.commit('joinRoomStatus', { joinStatus: val })
        }
    },
    computed: {
        renderStreamList() {
            let publishStream = this.publishStream
            let publishScreenStream = this.publishScreenStream
            let remoteStreamList = this.remoteStreamList
            let list = remoteStreamList.slice()
            if (publishScreenStream && this.isScreenShared) {
                list.unshift(publishScreenStream)
            }
            if (publishStream) {
                list.unshift(publishStream)
            }
            return list
        }
    },
    created() {
        BRTC.getPermissions().then(res => {
            BRTC.enumVideoDevices().then((list) => {
                this.cameraList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs['userInfo']) {
                        this.$refs['userInfo'].userInfo.cameraId = list[0].deviceId
                    }
                    if (!list.length) {
                        this.$message.warning('????????????????????????????????????')
                    }
                })
            })

            BRTC.enumAudioInputDevices().then((list) => {
                this.microphoneList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs['userInfo']) {
                        this.$refs['userInfo'].userInfo.microphoneId = list[0].deviceId
                    }
                    if (!list.length) {
                        this.$message.warning('????????????????????????????????????')
                    }
                })
            })

            BRTC.enumAudioOutputDevices().then((list) => {
                this.speakerList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs['userInfo']) {
                        this.$refs['userInfo'].userInfo.speakerId = list[0].deviceId
                    }
                    if (!list.length) {
                        this.$message.warning('????????????????????????????????????')
                    }
                })
            })
        }).catch(error => {
            this.$message.warning('????????????????????????')
        })
    },
    mounted() {
        // ???????????????appId
        this.appId = APP_ID
        // ????????????????????????Sig
        this.mainSig = MAIN_SIG
        // ????????????????????????Sig
        this.assistSig = ASSIST_SIG
        let client = this.client = BRTC.createClient({
            codec: 'h264',
            appId: this.appId,
            comments: 'brtc-js-demo-web'
        })
        let routeName = this.$route.name
        if (routeName === 'beauty' || routeName === 'watermark') {
            // ??????
            this.renderProcess = new BRTC.RenderProcess()
            // ??????
            this.beautyRender = new BRTC.RenderProcess.Renders.BeautyRender(this.renderProcess)
            this.renderProcess.addRender(this.beautyRender)
            this.beautyRender.setEnabled(this.$route.name === 'beauty')
            // ??????????????????
            let watermark = {
                url: 'https://img.baijiayun.com/0baijiatools/b8c19761d9d80efaec3ccb96bcc31ac0/bjy-logo.png',
                width: 0.2,
                top: 0.1,
                left: 0.05,
                opacity: 0.9
            }
            this.renderProcess.setWaterMark(watermark)
            this.renderProcess.enableWaterMark(false)
        }
        
        // ????????????
        client
            // ????????????
            .on('stream-added', (data) => {
                let remoteStream = data.stream
                let userId = remoteStream.getUserId() + ''
                if (/1$/.test(userId) && +userId.substr(0, userId.length - 1) === +this.$refs['userInfo'].userInfo.userId) {
                    // ????????????????????????????????????
                    return
                }
                // ???????????????????????????????????? user ??????
                for (let i = 0; i < this.remoteStreamList.length; i++) {
                    if (this.remoteStreamList[i].getUserId() === remoteStream.getUserId()) {
                        this.remoteStreamList[i].destroy()
                        this.remoteStreamList.splice(i, 1)
                        break
                    }
                }
                this.remoteStreamList.push(remoteStream)
                this.client.subscribe(remoteStream).then(() => {
                    console.log('???????????????')
                },
                (error) => {
                    console.log(remoteStream.getUserId(), '???????????????', error)
                    setTimeout(() => {
                        this.client.subscribe(remoteStream)
                    })
                })
                remoteStream.on('connect-error', () => {
                    console.log(remoteStream.getUserId(), '???????????????')
                    remoteStream.resubscribeStreamTimer = setTimeout(() => {
                        this.resubscribeStream(remoteStream)
                    }, 2000)
                })
            })

            // ????????????
            .on('stream-subscribed', (data) => {
                let remoteStream = data.stream
                let videoOn = remoteStream.getVideoOn()
                let audioOn = remoteStream.getAudioOn()

                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = videoOn
                    video.audioOn = audioOn
                }
            })

            // ??????????????????
            .on('stream-removed', (data) => {
                let remoteStream = data.stream
                remoteStream.destroy()
                for (let i = 0; i < this.remoteStreamList.length; i++) {
                    if (this.remoteStreamList[i].getUserId() === remoteStream.getUserId()) {
                        this.remoteStreamList.splice(i, 1)
                        break
                    }
                }
            })

            // ???????????????
            .on('stream-updated', (data) => {
                let remoteStream = data.stream
                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.updateMediaStatus()
                }
            })

            // ?????????????????????
            .on('mute-video', (data) => {
                let remoteStream = data.stream
                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = false
                }
            })

            // ?????????????????????
            .on('unmute-video', (data) => {
                let remoteStream = data.stream
                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = true
                }
            })

            // ?????????????????????
            .on('mute-audio', (data) => {
                let remoteStream = data.stream
                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.audioOn = false
                }
            })

            // ?????????????????????
            .on('unmute-audio', (data) => {
                let remoteStream = data.stream
                let video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.audioOn = true
                }
            })

            // ?????????????????????
            .on('error', (error) => {
                console.log(error)
                if (this.republishStreamTimer) {
                    clearTimeout(this.republishStreamTimer)
                }
                for (let i = 0; i < this.remoteStreamList.length; i++) {
                    this.remoteStreamList[i].destroy()
                    if (this.remoteStreamList[i].resubscribeStreamTimer) {
                        clearTimeout(this.remoteStreamList[i].resubscribeStreamTimer)
                    }
                }
                this.remoteStreamList = []
                
                if (this.rejoining) {
                    return
                }
                this.rejoining = true
                this.$message('???????????????????????????')
                if (this.assistClient) {
                    this.assistClient.leave()
                    if (this.publishScreenStream) {
                        this.publishScreenStream.destroy()
                    }
                }
                // ??????????????????
                this.rejoin()
            })
            .on('client-banned', () => {
                this.$message({
                    type: 'error',
                    message: '????????????????????????'
                })
                if (this.publishStream) {
                    this.publishStream.destroy()
                    this.publishStream = null
                }
                if (this.publishScreenStream) {
                    this.publishScreenStream.destroy()
                    this.publishScreenStream = null
                }
                if (this.client) {
                    this.leave()
                }
                this.isJoined = false
            })
            .on('peer-joined', data => {
                console.log('user: ' + data.userId + ' ????????????')
            })
            .on('peer-leaved', data => {
                console.log('user: ' + data.userId + ' ????????????')
            })
            .on('token-expire', data => {
                this.$message({
                    type: 'error',
                    message: `token ?????????`
                })
            })
            .on('user-kicked', () => {
                this.$message({
                    type: 'error',
                    message: '?????????????????????'
                })
                // ?????????????????????????????????????????????????????????
                setTimeout(() => {
                    this.$router.go(0)
                }, 500)
            })
            .on('room-closed', data => {
                this.$message({
                    type: 'error',
                    message: `???????????????`
                })
                // ??????????????????????????????????????????????????????
                setTimeout(() => {
                    this.$router.go(0)
                }, 500)
            })
    },
    destroyed() {
        if (this.isJoined) {
            this.leave()
        }
    },
    methods: {
        join() {
            if (!this.$refs['userInfo'].userInfo.userId) {
                this.$message.warning('?????????UserID')
                return
            }
            if (!this.$refs['userInfo'].userInfo.roomId) {
                this.$message.warning('?????????RoomID')
                return 
            }
            if (this.$route.name === 'captureStream' && !this.$refs['userInfo'].captureVideoStream()) {
                return 
            }
            if (this.$route.name === 'beauty') {
                this.$refs['buttonSection'].beauty = 50
                this.$refs['buttonSection'].highlight = 50
                this.$refs['buttonSection'].rosy = 50
            }
            return new Promise((resolve, reject) => {
                // ??????????????? userId ??? 0 ??????
                Promise.all([this.client.join(this.$refs['userInfo'].userInfo.roomId, 
                    this.$refs['userInfo'].userInfo.userId * 10, 
                    this.mainSig)])
                    .then(() => {
                        this.$message.success('??????????????????')
                        this.isJoined = true
                        // ?????????????????????????????? publish
                        if (this.publishStream) {
                            this.client.publish(this.publishStream)
                        }
                        else {
                            // ??????????????? publish
                            this.publish()
                        }
                        resolve()
                    }, 
                    (error) => {
                        this.$message({
                            type: 'error',
                            message: '??????????????????, ???????????????'
                        })
                    })
            })
        },
        rejoin() {
            console.log('rejoin')
            this.join().then(() => {
                this.$message.success('????????????????????????')
                this.rejoining = false
                this.isJoined = true
            },
            () => {
                setTimeout(() => {
                    this.rejoin()
                }, 2000)
            })
        },
        leave() {
            if (this.$route.name === 'beauty') {
                this.$refs['buttonSection'].beauty = 50
                this.$refs['buttonSection'].highlight = 50
                this.$refs['buttonSection'].rosy = 50
            }
            Promise.all([
                this.publishStream && this.client.unpublish(this.publishStream),
                this.publishScreenStream && this.assistClient && this.assistClient.unpublish(this.publishScreenStream)
            ]).then(() => {
                // ???????????????
                if (this.publishStream) {
                    this.publishStream.destroy()
                    this.publishStream = null
                }
                if (this.publishScreenStream) {
                    this.publishScreenStream.destroy()
                    this.publishScreenStream = null
                }
                // ????????????
                this.client.leave().then(() => {
                    this.remoteStreamList = []
                    this.$message.success('??????????????????')
                    this.isJoined = false
                    if (this.$route.name === 'videoBitrate' || this.$route.name === 'audioProfile') {
                        this.$refs['videoBitrate'].destroyInterval()
                    }
                })
                if (this.assistClient) {
                    this.assistClient.leave()
                    this.isScreenShared = false
                    this.screenSharedStatus = false
                }
            })
        },
        publish() {
            let options = {
                video: true,
                audio: true
            }
            if (this.$route.name === 'captureStream') {
                options.audioSource = this.$refs['userInfo'].captureVideoStream().getAudioTracks()[0]
                options.videoSource = this.$refs['userInfo'].captureVideoStream().getVideoTracks()[0]
            }
            else if (this.$route.name === 'captureStreamFromCanvas') {
                options.audioSource = this.$refs['userInfo'].captureCanvasStream().getAudioTracks()[0]
                options.videoSource = this.$refs['userInfo'].captureCanvasStream().getVideoTracks()[0]
            }
            else {
                options.cameraId = this.$refs['userInfo'].userInfo.cameraId || undefined
                options.microphoneId = this.$refs['userInfo'].userInfo.microphoneId || undefined
                options.video = !!this.$refs['userInfo'].userInfo.cameraId
                options.audio = !!this.$refs['userInfo'].userInfo.microphoneId
                if (!options.video && !options.audio) {
                    this.$message('?????????????????????')
                    return
                }
            }
            let publishStream;
            try {
                publishStream = BRTC.createStream(options);
            }
            catch (error) {
                let code = error && error.getCode();
                let name = '';
                switch (code) {
                    case '0x1003': name = "DevicesNotFoundError"; break;
                }
                reject({
                    name: name,
                    error: error
                });
                return;
            }
            // ???????????????????????????
            let bitrate = this.$route.name === 'videoBitrate' ? this.$refs['userInfo'].userInfo.videoBitrate : 500
            publishStream.setVideoEncoderConfiguration({
                width: 640,
                height: 480,
                frameRate: 15,
                bitrate: +bitrate
            })
            if (this.$route.name === 'audioProfile') {
                publishStream.setAudioProfile(this.$refs['userInfo'].userInfo.audioProfile)
            }
            publishStream.init().then(() => {
                let routeName = this.$route.name
                if (routeName === 'beauty' || routeName === 'watermark') {
                    this.renderProcess.pipe(publishStream.getVideoTrack(), 15)
                    const localStream = BRTC.createStream({
                        audioSource: publishStream.getAudioTrack(),
                        videoSource: this.renderProcess.getOutputTrack()
                    })

                    localStream.setVideoEncoderConfiguration({
                        bitrate: 500
                    })
                    localStream.init().then(() => {
                        this.publishStream = localStream
                        this.client.publish(this.publishStream).then(() => {
                            console.log('????????????')
                            this.isPublished = true
                            let instance = this.getVideoInstance(this.publishStream.getStreamId());
                            instance.updateMediaStatus()
                        })
                        // ?????????????????????????????????????????????
                        .catch((error) => {
                            if (this.publishStream) {
                                this.joined = false
                                this.publishStream.destroy()
                                this.publishStream = null
                                this.$message.error('???????????????????????????????????????')
                            }
                            console.log('????????????', error)
                            this.isPublished = false
                        })
                        // ??????????????????
                        this.publishStream.on('connect-error', () => {
                            console.log('????????????')
                            this.isPublished = false
                            this.republishStreamTimer = setTimeout(() => {
                                this.republishCameraStream()
                            }, 2000)
                        })
                    })
                }
                else {
                    this.publishStream = publishStream
                    this.client.publish(this.publishStream).then(() => {
                        console.log('????????????')
                        this.isPublished = true
                        if (this.$route.name === 'videoBitrate' || this.$route.name === 'audioProfile') {
                            this.$refs['videoBitrate'].handleStatsData()
                        }
                        let instance = this.getVideoInstance(this.publishStream.getStreamId());
                        instance.updateMediaStatus()
                    })
                    // ?????????????????????????????????????????????
                    .catch((error) => {
                        if (this.publishStream) {
                            this.joined = false
                            this.publishStream.destroy()
                            this.publishStream = null
                            this.$message.error('???????????????????????????????????????')
                        }
                        console.log('????????????', error)
                        this.isPublished = false
                    })
                    // ??????????????????
                    this.publishStream.on('connect-error', () => {
                        console.log('????????????')
                        this.isPublished = false
                        this.republishStreamTimer = setTimeout(() => {
                            this.republishCameraStream()
                        }, 2000)
                    })
                }
            })
            .catch((error) => {
                console.log('???????????????', error)
                if (err && err.code_ === 4099) {
                    reject(Object.assign({}, err, { name: 'DevicesNotFoundError' }));
                    return;
                }
                reject(err);
            })
            // ???????????????????????????
            publishStream.on('player-state-changed', (data) => {
                console.log(`${publishStream.getUserId()} player status: [${data.type}] ${data.state} ${data.reason}`)
            })
        },
        republishCameraStream() {
            if (this.rejoining) {
                return
            }
            this.client.publish(this.publishStream).then(() => {
                console.log('??????????????????')
                this.isPublished = true
            },
            () => {
                this.republishStreamTimer = setTimeout(() => {
                    this.republishCameraStream()
                }, 2000)
            })
        },
        unpublish() {
            Promise.all([
                this.publishStream && this.client.unpublish(this.publishStream)
            ]).then(() => {
                if (this.publishStream) {
                    this.publishStream.destroy()
                    this.publishStream = null
                }
                if (this.$route.name === 'videoBitrate' || this.$route.name === 'audioProfile') {
                    this.$refs['videoBitrate'].destroyInterval()
                }
                this.isPublished = false
            })
        },
        // ?????? Video Vue ??????
        getVideoInstance(id) {
            return this.$refs['videoSection'].getVideoInstance(id)
        },
        screenShare() {
            this.screenSharedStatus = true
            let clientPromise
            if (this.assistClient) {
                clientPromise = new Promise((reslove, reject) => {
                    this.assistClient.join(this.$refs['userInfo'].userInfo.roomId, 
                    this.$refs['userInfo'].userInfo.userId * 10 + 1, 
                    this.assistSig).then(
                    () => {
                        console.log('??????????????????????????????')
                        reslove()
                    },
                    () => {
                        this.$message('??????????????????????????????')
                        this.screenSharedStatus = false
                        reject()
                    })
                })
            }
            else {
                clientPromise = new Promise((reslove, reject) => {
                    this.assistClient = BRTC.createClient({
                        codec: 'h264',
                        appId: this.appId
                    })
                    // ?????? client ???????????????
                    this.assistClient.setPublishOnly(true)
                    // ?????????????????? userId ??? 1 ??????
                    this.assistClient.join(this.$refs['userInfo'].userInfo.roomId, 
                        this.$refs['userInfo'].userInfo.userId * 10 + 1, 
                        this.assistSig).then(() => {
                            console.log('??????????????????????????????')
                            reslove()
                        },
                        () => {
                            this.$message('??????????????????????????????')
                            this.screenSharedStatus = false
                            reject()
                        })
                })
            }
            Promise.all([
                clientPromise,
                new Promise((reslove, reject) => {
                    let publishScreenStream = BRTC.createStream({
                        screen: true,
                        audio: true
                    })
                    publishScreenStream.init().then(
                    () => {
                        this.publishScreenStream = publishScreenStream
                        this.publishScreenStream.on('video-track-ended', () => {
                            // ?????????????????????????????????
                            this.closeScreenShare()
                        })
                        reslove()
                    },
                    (error) => {
                        this.screenSharedStatus = false
                        reject(error)
                    })
                })
            ]).then(() => {
                this.assistClient.publish(this.publishScreenStream).then(() => {
                    console.log('??????????????????')
                    this.isScreenShared = true
                }, () => {
                    this.$message.error('??????????????????????????????????????????')
                    if (this.assistClient) {
                        this.assistClient.leave()
                    }
                    if (this.publishScreenStream) {
                        this.publishScreenStream.destroy()
                    }
                    this.isScreenShared = false
                    this.screenSharedStatus = false
                })
                this.publishScreenStream.on('connect-error', () => {
                    console.log('????????????????????????')
                    setTimeout(() => {
                        this.republishShareStream()
                    }, 2000)
                })
            }, (error) => {
                this.screenSharedStatus = false
                if (!error || error.message !== 'Permission denied') {
                    this.$message({
                        type: 'error',
                        message: '??????????????????'
                    })
                }
                // ?????????????????????
                if (this.assistClient) {
                    this.assistClient.leave()
                }
            })
        },
        closeScreenShare() {
            this.screenSharedStatus = false
            if (this.assistClient) {
                this.assistClient.unpublish(this.publishScreenStream).then(() => {
                    console.log('??????????????????????????????')
                    this.isScreenShared = false
                    this.publishScreenStream.destroy()
                    this.publishScreenStream = null
                    this.screenFrame = ''
                    this.assistClient.leave().then(() => {
                        console.log('??????????????????????????????')
                    })
                })
            }
        },
        resubscribeStream(stream) {
            if (this.rejoining) {
                return
            }
            this.client.subscribe(stream).then(() => {
                console.log('??????????????????')
                stream.replay()
            },
            () => {
                stream.resubscribeStreamTimer = setTimeout(() => {
                    this.resubscribeStream(stream)
                }, 2000)
            })
        },
        changeRoomId(roomId) {
            if (!this.isMobile) {
                this.$refs['qrcode'].qrcode(roomId)
            }
        },
        toggleSubscribe(info) {
            this.client.unsubscribe(info.stream).then(() => {
                if (info.audioOn || info.videoOn) {
                    this.client.subscribe(info.stream, {
                        audio: info.audioOn,
                        video: info.videoOn
                    })
                }
            })
        },
        // ???????????????
        switchMicrophone() {
            let deviceId = this.$refs['userInfo'].userInfo.microphoneId
            if (deviceId) {
                if (this.publishStream) {
                    // ?????????????????????
                    this.publishStream.switchDevice('audio', deviceId)
                }
            }
        },
        // ???????????????
        switchCamera() {
            let deviceId = this.$refs['userInfo'].userInfo.cameraId
            if (deviceId) {
                if (this.publishStream) {
                    // ?????????????????????
                    this.publishStream.switchDevice('video', deviceId)
                }
            }
        },
        // ?????????????????????
        replaceTrack(type) {
            let mediaTrack
            if (type === 'audio') {
                mediaTrack = this.publishStream.stream.getAudioTrack()
            }
            else {
                mediaTrack = this.publishStream.stream.getVideoTrack()
            }
            this.publishStream.replaceTrack(mediaTrack)
        },
        // ????????????
        switchWatermark(value) {
            this.renderProcess.enableWaterMark(value)
        },
        // ????????????
        setWatermark(watermark) {
            this.renderProcess.setWaterMark(watermark)
        },
        // ????????????
        setBeauty(config) {
            if (config.key === 'beauty') {
                this.beautyRender.setBeauty(config.value)
            }
            else if (config.key === 'highlight') {
                this.beautyRender.setBrightness(config.value)
            }
            else if (config.key === 'rosy') {
                this.beautyRender.setBrightness(config.value)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.left-section {
    width: 310px;
    height: 100%;
    overflow-y: auto;
}
.video-section {
    width: 530px;
    margin-left: 30px;
    height: 100%;
    overflow-y: auto;
    text-align: left;
}
</style>