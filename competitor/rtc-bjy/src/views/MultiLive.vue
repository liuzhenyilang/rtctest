<template>
    <div>
        <div class="left-section">
            <UserInfo :isMobile="isMobile" :isJoined="isJoined" :cameraList="cameraList"
                :microphoneList="microphoneList" ref="userInfo" :speakerList="speakerList" />
            <div class="mix-stream-mode">
                <p class="mix-stream-mode-title">混流模版</p>
                <div class="mix-stream-mode-radio">
                    <el-radio v-model="mode" label="1">自定义布局</el-radio>
                    <el-radio v-model="mode" label="2">画廊布局</el-radio>
                </div>
            </div>
            <div class="role-select">
                <span>角色</span>
                <el-radio :disabled="isJoined" v-model="role" label="anchor">Anchor</el-radio>
                <el-radio :disabled="isJoined" v-model="role" label="audience">Audience</el-radio>
            </div>
            <ButtonSection ref="buttonSection" :isJoined="isJoined" :isPublished="isPublished"
                :enableStartMixTranscode="role === 'anchor' && isPublished"
                :enableStopMixTranscode="role === 'anchor' && mixStreamTaskIds.length" :disablePushStream="role === 'audience'"
                :canPlay="role === 'audience'"
                @join="join" @leave="leave" @publish="publish" @unpublish="unpublish" :isMobile="isMobile"
                @replaceTrack="replaceTrack" @switchCamera="switchCamera" @switchMicrophone="switchMicrophone"
                @startMixTranscode="startMixTranscode" @stopMixTranscode="stopMixTranscode" @switchRole="switchRole"
                @play="play" />
        </div>
        <div class="video-section">
            <VideoSection ref="videoSection"
                :renderStreamList="renderStreamList" :speakerList="speakerList"
                @toggleSubscribe="toggleSubscribe" :isMobile="isMobile"/>

            <div class="mix-stream-video-container" v-if="role === 'audience' && mixStreamTaskIds.length">
                <p>混流区</p>
                <div class="mix-stream-video" v-for="item of mixStreamTaskIds" :key="item" >
                    <video :ref="item" autoplay></video>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { APP_ID, MAIN_SIG } from './config'
export default {
    props: {
        isMobile: {}
    },

    components: {
        UserInfo: () => import('./components/UserInfo.vue'),
        ButtonSection: () => import('./components/ButtonSection.vue'),
        VideoSection: () => import('./components/VideoSection.vue')
    },
    data () {
        return {
            client: {},
            appId: '',
            remoteStreamList: [],
            cameraList: [],
            microphoneList: [],
            speakerList: [],
            publishStream: null,
            isJoined: false,
            isPublished: false,
            role: 'anchor',
            mode: '1',
            userList: [],
            mixStreamInfoMap: {},
            mixStreamTaskIds: []
        }
    },
    watch: {
        isJoined (val) {
            this.$store.commit('joinRoomStatus', { joinStatus: val })
        }
    },
    computed: {
        renderStreamList () {
            const publishStream = this.publishStream
            const remoteStreamList = this.remoteStreamList
            const list = remoteStreamList.slice()
            if (publishStream) {
                list.unshift(publishStream)
            }
            return list
        }
    },
    created () {
        BLive.getPermissions().then(res => {
            BLive.enumVideoDevices().then((list) => {
                this.cameraList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs.userInfo) {
                        this.$refs.userInfo.userInfo.cameraId = list[0].deviceId
                    }
                    if (!list.length) {
                        this.$message.warning('当前无摄像头设备，请检查')
                    }
                })
            })

            BLive.enumAudioInputDevices().then((list) => {
                this.microphoneList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs.userInfo) {
                        this.$refs.userInfo.userInfo.microphoneId = list[0].deviceId
                    }
                    if (!list.length) {
                        this.$message.warning('当前无麦克风设备，请检查')
                    }
                })
            })

            BLive.enumAudioOutputDevices().then((list) => {
                this.speakerList = list
                this.$nextTick(() => {
                    if (list.length && this.$refs.userInfo) {
                        this.$refs.userInfo.userInfo.speakerId = list[0].deviceId
                    }
                    if (!list.length && !this.isMobile) {
                        this.$message.warning('当前无扬声器设备，请检查')
                    }
                })
            })
        }).catch(_ => {
            this.$message.warning('请检查音视频设备')
        })
    },
    mounted () {
        // 后台获取的appId
        this.appId = APP_ID
        // 摄像头的流用到的Sig
        this.mainSig = MAIN_SIG

        const client = this.client = BLive.createClient({
            codec: 'h264',
            appId: this.appId,
            comments: 'BLive-js-demo-web',
            role: this.role,
            useBplayer: true
        })

        // 事件监听
        client
            // 远端推流
            .on('stream-added', (data) => {
                const remoteStream = data.stream
                const userId = remoteStream.getUserId() + ''
                if (/1$/.test(userId) && +userId.substr(0, userId.length - 1) === +this.$refs.userInfo.userInfo.userId) {
                    // 是自己的屏幕分享，不处理
                    return
                }
                // 移除之前没有删除的同一个 user 的流
                for (let i = 0; i < this.remoteStreamList.length; i++) {
                    if (this.remoteStreamList[i].getUserId() === remoteStream.getUserId()) {
                        this.remoteStreamList[i].destroy()
                        this.remoteStreamList.splice(i, 1)
                        break
                    }
                }
                this.userList.push(userId)
                this.remoteStreamList.push(remoteStream)
                this.client.subscribe(remoteStream).then(() => {
                    console.log('订阅流成功')
                },
                (error) => {
                    console.log(remoteStream.getUserId(), '订阅流失败', error)
                    setTimeout(() => {
                        this.client.subscribe(remoteStream)
                    })
                })
                remoteStream.on('connect-error', () => {
                    console.log(remoteStream.getUserId(), '远程流中断')
                    remoteStream.resubscribeStreamTimer = setTimeout(() => {
                        this.resubscribeStream(remoteStream)
                    }, 2000)
                })
            })

            // 订阅成功
            .on('stream-subscribed', (data) => {
                const remoteStream = data.stream
                const videoOn = remoteStream.getVideoOn()
                const audioOn = remoteStream.getAudioOn()

                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = videoOn
                    video.audioOn = audioOn
                }
            })

            // 远端结束推流
            .on('stream-removed', (data) => {
                const remoteStream = data.stream
                const userId = remoteStream.getUserId()
                remoteStream.destroy()
                for (let i = 0; i < this.remoteStreamList.length; i++) {
                    if (this.remoteStreamList[i].getUserId() === userId) {
                        this.remoteStreamList.splice(i, 1)
                        break
                    }
                }
                const index = this.userList.findIndex((item) => item.userId === userId)
                if (index !== -1) {
                    this.userList.splice(index, 1)
                }
            })

            // 远端流更新
            .on('stream-updated', (data) => {
                const remoteStream = data.stream
                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.updateMediaStatus()
                }
            })

            // 远端关闭摄像头
            .on('mute-video', (data) => {
                const remoteStream = data.stream
                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = false
                }
            })

            // 远端打开摄像头
            .on('unmute-video', (data) => {
                const remoteStream = data.stream
                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.videoOn = true
                }
            })

            // 远端关闭麦克风
            .on('mute-audio', (data) => {
                const remoteStream = data.stream
                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.audioOn = false
                }
            })

            // 远端打开麦克风
            .on('unmute-audio', (data) => {
                const remoteStream = data.stream
                const video = this.getVideoInstance(remoteStream.getStreamId())
                if (video) {
                    video.audioOn = true
                }
            })

            // 无法处理的错误
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
                this.$message('网络断开，正在重连')
                // 重新进入房间
                this.rejoin()
            })
            .on('client-banned', () => {
                this.$message({
                    type: 'error',
                    message: '您已在其他端登录'
                })
                this.reset()
            })
            .on('peer-joined', data => {
                console.log('user: ' + data.userId + ' 进入房间')
            })
            .on('peer-leaved', data => {
                console.log('user: ' + data.userId + ' 离开房间')
            })
            .on('token-expire', data => {
                this.$message({
                    type: 'error',
                    message: 'token 已过期'
                })
            })
            .on('room-closed', data => {
                this.$message({
                    type: 'error',
                    message: '房间已关闭'
                })
                this.reset()
            })
            .on('user-in', data => {
                this.$message(`用户${data.userId}加入房间`)
                this.userList.push(data)
            })
            .on('user-out', data => {
                this.$message(`用户${data.userId}离开房间`)
                const index = this.userList.findIndex((item) => item.userId === data.userId)
                if (index !== -1) {
                    this.userList.splice(index, 1)
                }
            })
            .on('mix-stream-added', data => {
                this.$message.success('房间收到混流发布')
                console.log(data)
                this.isMixStreamPublish = true
                this.mixStreamInfoMap[data.taskId] = {
                    urlList: data.urls,
                    stream: data.stream
                }
                const index = this.mixStreamTaskIds.indexOf(data.taskId)
                if (index === -1) {
                    this.mixStreamTaskIds.push(data.taskId)
                }
            })
            .on('mix-stream-removed', data => {
                this.$message.success('房间混流结束')
                delete this.mixStreamInfoMap[data.taskId]
                const index = this.mixStreamTaskIds.indexOf(data.taskId)
                if (index !== -1) {
                    this.mixStreamTaskIds.splice(index, 1)
                }
            })
            .on('user-kicked', data => {
                if (data.userId === ('' + this.$refs.userInfo.userInfo.userId * 10)) {
                    this.$message.success('你已被踢出')
                    this.reset()
                }
            })
    },
    destroyed () {
        if (this.isJoined) {
            this.leave()
        }
    },
    methods: {
        join () {
            if (!this.$refs.userInfo.userInfo.userId) {
                this.$message.warning('请输入UserID')
                return
            }
            if (!this.$refs.userInfo.userInfo.roomId) {
                this.$message.warning('请输入RoomID')
                return
            }

            return new Promise((resolve, reject) => {
                Promise.all([this.client.join(this.$refs.userInfo.userInfo.roomId, this.$refs.userInfo.userInfo.userId * 10, this.mainSig, {
                    role: this.role
                })])
                .then(() => {
                    this.$message.success('加入房间成功')
                    this.isJoined = true
                    this.userList.push('' + this.$refs.userInfo.userInfo.userId * 10)
                    if (this.role === 'anchor') {
                        // 本地流已经创建，直接 publish
                        if (this.publishStream) {
                            this.client.publish(this.publishStream)
                        } else {
                            // 先创建，在 publish
                            this.publish()
                        }
                    }
                    resolve()
                },
                (error) => {
                    this.$message({
                        type: 'error',
                        message: '加入房间失败, 请刷新重试'
                    })
                    console.log(error)
                })
            })
        },
        rejoin () {
            console.log('rejoin')
            this.join().then(() => {
                this.$message.success('重新加入房间成功')
                this.rejoining = false
                this.isJoined = true
            },
            () => {
                setTimeout(() => {
                    this.rejoin()
                }, 2000)
            })
        },
        leave () {
            Promise.all([
                this.publishStream && this.client.unpublish(this.publishStream)
            ]).then(() => {
                // 退出房间
                this.client.leave().then(() => {
                    this.reset()
                })
            })
        },

        reset () {
            // 把流销毁掉
            if (this.publishStream) {
                this.publishStream.destroy()
                this.publishStream = null
            }
            for (let i = 0; i < this.remoteStreamList.length; i++) {
                this.remoteStreamList[i].destroy()
                if (this.remoteStreamList[i].resubscribeStreamTimer) {
                    clearTimeout(this.remoteStreamList[i].resubscribeStreamTimer)
                }
            }
            this.remoteStreamList = []
            this.$message.success('退出房间成功')
            this.isJoined = false
            this.isPublished = false
            this.mixStreamInfoMap = {}
            this.mixStreamTaskIds = []
            this.userList = []
        },

        publish () {
            const options = {
                video: true,
                audio: true
            }
            options.cameraId = this.$refs.userInfo.userInfo.cameraId || undefined
            options.microphoneId = this.$refs.userInfo.userInfo.microphoneId || undefined
            options.video = !!this.$refs.userInfo.userInfo.cameraId
            options.audio = !!this.$refs.userInfo.userInfo.microphoneId
            if (!options.video && !options.audio) {
                this.$message('没有视音频设备')
                return
            }
            let publishStream
            try {
                publishStream = BLive.createStream(options)
            } catch (error) {
                const code = error && error.getCode()
                let name = ''
                switch (code) {
                case '0x1003': name = 'DevicesNotFoundError'; break
                }
                throw new Error({
                    name: name,
                    error: error
                })
            }
            // 设置自定义视频配置
            const bitrate = this.$route.name === 'videoBitrate' ? this.$refs.userInfo.userInfo.videoBitrate : 500
            publishStream.setVideoEncoderConfiguration({
                width: 640,
                height: 480,
                frameRate: 15,
                bitrate: +bitrate
            })
            publishStream.init().then(() => {
                this.publishStream = publishStream
                this.client.publish(this.publishStream).then(() => {
                    console.log('发布成功')
                    this.isPublished = true
                    const instance = this.getVideoInstance(this.publishStream.getStreamId())
                    instance.updateMediaStatus()
                })
                // 发布失败，给出提示，不重新发布
                    .catch((error) => {
                        if (this.publishStream) {
                            this.isPublished = false
                            this.publishStream.destroy()
                            this.publishStream = null
                            this.$message.error('发布失败，请刷新后重新再试')
                        }
                        console.log('发布失败', error)
                    })
                // 处理推流中断
                this.publishStream.on('connect-error', () => {
                    console.log('推流中断')
                    this.republishStreamTimer = setTimeout(() => {
                        this.republishCameraStream()
                    }, 2000)
                })
            }).catch((error) => {
                console.log('创建流失败', error)
                if (error && error.code_ === 4099) {
                    throw new Error(Object.assign({}, error, { name: 'DevicesNotFoundError' }))
                }
                throw new Error(error)
            })
            // 处理播放器状态改变
            publishStream.on('player-state-changed', (data) => {
                console.log(`${publishStream.getUserId()} player status: [${data.type}] ${data.state} ${data.reason}`)
            })
        },
        republishCameraStream () {
            if (this.rejoining) {
                return
            }
            this.client.publish(this.publishStream).then(() => {
                console.log('重新发布成功')
            },
            () => {
                this.republishStreamTimer = setTimeout(() => {
                    this.republishCameraStream()
                }, 2000)
            })
        },
        unpublish () {
            Promise.all([
                this.publishStream && this.client.unpublish(this.publishStream)
            ]).then(() => {
                if (this.publishStream) {
                    this.publishStream.destroy()
                    this.publishStream = null
                    this.isPublished = false
                }
            })
        },
        // 获取 Video Vue 实例
        getVideoInstance (id) {
            return this.$refs.videoSection.getVideoInstance(id)
        },
        resubscribeStream (stream) {
            if (this.rejoining) {
                return
            }
            this.client.subscribe(stream).then(() => {
                console.log('重新拉流成功')
                stream.replay()
            },
            () => {
                stream.resubscribeStreamTimer = setTimeout(() => {
                    this.resubscribeStream(stream)
                }, 2000)
            })
        },
        toggleSubscribe (info) {
            this.client.unsubscribe(info.stream).then(() => {
                if (info.audioOn || info.videoOn) {
                    this.client.subscribe(info.stream, {
                        audio: info.audioOn,
                        video: info.videoOn
                    })
                }
            })
        },
        // 切换麦克风
        switchMicrophone () {
            const deviceId = this.$refs.userInfo.userInfo.microphoneId
            if (deviceId) {
                if (this.publishStream) {
                    // 切换麦克风设备
                    this.publishStream.switchDevice('audio', deviceId)
                }
            }
        },
        // 切换摄像头
        switchCamera () {
            const deviceId = this.$refs.userInfo.userInfo.cameraId
            if (deviceId) {
                if (this.publishStream) {
                    // 切换摄像头设备
                    this.publishStream.switchDevice('video', deviceId)
                }
            }
        },
        // 替换音视频轨道
        replaceTrack (type) {
            let mediaTrack
            if (type === 'audio') {
                mediaTrack = this.publishStream.stream.getAudioTrack()
            } else {
                mediaTrack = this.publishStream.stream.getVideoTrack()
            }
            this.publishStream.replaceTrack(mediaTrack)
        },

        startMixTranscode () {
            const renderStreamList = this.renderStreamList
            const mixStreamTaskIds = this.mixStreamTaskIds
            const mixUsers = []
            let taskId = mixStreamTaskIds[0]
            // 自定义布局需要指定位置
            if (+this.mode !== 2) {
                renderStreamList.forEach((streamOption, index) => {
                    mixUsers.push({
                        userId: '' + streamOption.uid,
                        width: index ? 640 : 1280,
                        height: index ? 480 : 960,
                        x: index ? 640 : 0,
                        y: index ? 480 : 0,
                        zOrder: index + 1,
                        streamId: streamOption.stream.streamId,
                        color: '#000000',
                        fitMode: 0
                    })
                })
            }
            this.client.startMixTranscode({
                mode: +this.mode,
                taskId: taskId,
                videoWidth: 1280,
                videoHeight: 960,
                mixUsers: mixUsers
            }).then((data) => {
                if (!this.mixStreamInfoMap[data.taskId]) {
                    this.mixStreamInfoMap[data.taskId] = {}
                }
                this.$message.success('混流发布成功')
            }, (data) => {
                this.$message(data.msg)
            })
        },

        stopMixTranscode () {
            const mixStreamTaskIds = this.mixStreamTaskIds
            const taskId = mixStreamTaskIds[0]
            if (taskId) {
                return this.client.stopMixTranscode(taskId).then((data) => {
                    if (data.code === 0) {
                        this.$message.success('结束混流成功')
                    } else {
                        this.$message('结束混流失败')
                    }
                }, (error) => {
                    console.log(error)
                    this.$message('结束混流失败')
                })
            } else {
                this.$message('未发起过混流任务')
            }
        },

        switchRole () {
            if (this.role === 'anchor') {
                this.client.switchRole('audience')
                this.role = 'audience'
                this.remoteStreamList = []
                if (this.publishStream) {
                    this.publishStream.destroy()
                    this.publishStream = null
                    this.isPublished = false
                }
            } else {
                this.role = 'anchor'
                this.client.switchRole('anchor')
                const mixStreamTaskIds = this.mixStreamTaskIds
                mixStreamTaskIds.forEach((taskId) => {
                    if (this.mixStreamInfoMap[taskId].hasLoad) {
                        this.mixStreamInfoMap[taskId].hasLoad = false
                    }
                })
            }
        },

        play () {
            const mixStreamTaskIds = this.mixStreamTaskIds
            mixStreamTaskIds.forEach((taskId) => {
                if (!this.mixStreamInfoMap[taskId].hasLoad) {
                    this.client.play(taskId)
                    this.$refs[taskId][0].srcObject = this.mixStreamInfoMap[taskId].stream
                    this.$refs[taskId][0].play()
                    this.mixStreamInfoMap[taskId].hasLoad = true
                }
            })
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
    height: 85%;
    overflow-y: auto;
    text-align: left;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;

    .has-video, .no-video {
      height: auto;
      flex: 1;
      border-bottom: 1px solid rgba(159, 168, 181, 0.3);
      overflow-y: auto;
    }

    .no-video {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      /deep/ .img {
        margin-top: 0px;
      }
    }
}

.mix-stream-mode {
  display: flex;
  margin-top: 20px;

  .mix-stream-mode-title {
    text-align: left;
    flex-shrink: 0;
    margin-right: 20px;
  }

  .mix-stream-mode-radio {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;

    .el-radio {
      margin-right: 0px;
      width: 110px;
      text-align: left;
    }
  }
}

.mix-stream-video-container {
    width: 100%;
    height: 50%;
    overflow-y: auto;

    .mix-stream-video {
        display: inline-block;
        margin: 20px;
    }

    video {
      width: 223px;
      height: 167px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 20px;
      object-fit: cover;
    }
}
.role-select {
    margin-top: 20px;
    text-align: left;

    .el-radio:first-of-type {
        margin-left: 30px;
    }
}
</style>
