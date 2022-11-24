<template>
    <div class="base-chart">
        <template v-if="$route.name === 'videoBitrate'">
            <div class="title">Video Bitrate (kbps)</div>
            <v-chart :option="optionVideoBitrate" style="width: 300px; height: 120px;" />
        </template>
        <template v-if="$route.name === 'audioProfile'">
            <div class="title">Audio Bitrate (kbps)</div>
            <v-chart :option="optionAudioBitrate" style="width: 300px; height: 120px;" />
        </template>
        <div class="title">Packets sent per second</div>
        <v-chart :option="optionPacketsSent" style="width: 300px; height: 120px;" ref="lineChart" />
    </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
} from 'echarts/components'
use([
    CanvasRenderer,
    LineChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
])
export default {
    props: {
        publishStream: {}
    },
    data() {
        return {
            videoBitrateData: [...Array(300)].map(item => 0),
            xAxisData: [],
            packetsSentData: [...Array(300)].map(item => 0),
            audioBitrateData: [...Array(300)].map(item => 0)
        }
    },
    computed: {
        optionVideoBitrate() {
            let result = {
                grid: {
                    left: '0',
                    right: '0',
                    bottom: '0',
                    top: '10px',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.xAxisData
                },
                yAxis: {
                    type: 'value',
                    position: 'right'
                },
                series: [
                    {
                        type: 'line',
                        lineStyle: {
                            color: '#f00',
                            width: 1
                        },
                        showSymbol: false,
                        emphasis: {
                            scale: false,
                            lineStyle: {
                                width: 1
                            }
                        },
                        data: this.videoBitrateData
                    }
                ]
            }
            return result
        },
        optionAudioBitrate() {
            let result = {
                grid: {
                    left: '0',
                    right: '0',
                    bottom: '0',
                    top: '10px',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.xAxisData
                },
                yAxis: {
                    type: 'value',
                    position: 'right'
                },
                series: [
                    {
                        type: 'line',
                        lineStyle: {
                            color: '#f00',
                            width: 1
                        },
                        showSymbol: false,
                        emphasis: {
                            scale: false,
                            lineStyle: {
                                width: 1
                            }
                        },
                        data: this.audioBitrateData
                    }
                ]
            }
            return result
        },
        optionPacketsSent() {
            let result = {
                grid: {
                    left: '0',
                    right: '0',
                    bottom: '0',
                    top: '10px',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.xAxisData
                },
                yAxis: {
                    type: 'value',
                    position: 'right'
                },
                series: [
                    {
                        type: 'line',
                        lineStyle: {
                            color: '#f00',
                            width: 1
                        },
                        emphasis: {
                            scale: false,
                            lineStyle: {
                                width: 1
                            }
                        },
                        showSymbol: false,
                        data: this.packetsSentData
                    }
                ]
            }
            return result
        }
    },
    mounted() {
        this.handleXAxis()
    },
    destroyed() {
        this.destroyInterval()
    },
    methods: {
        // 处理 stats 数据
        handleStatsData() {
            if (this.publishStream) {
                let accumulativeBitrate = 0
                let accumulativePacketsSent = 0
                let accumulativeAudioBitrate = 0
                this.handleXAxis()
                this.videoBitrateData = [...Array(300)].map((item) => 0)
                this.audioBitrateData = [...Array(300)].map(item => 0)
                this.packetsSentData = [...Array(300)].map(item => 0)
                this.timer = setInterval(() => {
                    this.publishStream.getStats().then(res => {
                        let stats = res
                        this.videoBitrateData.push((stats.videoBytesSent - accumulativeBitrate) * 8 / 1000)
                        this.videoBitrateData.splice(0, 1)
                        this.audioBitrateData.push((stats.audioBytesSent - accumulativeAudioBitrate) * 8 / 1000)
                        this.audioBitrateData.splice(0, 1)
                        this.packetsSentData.push(stats.videoPacketsSent + stats.audioPacketsSent - accumulativePacketsSent)
                        this.packetsSentData.splice(0, 1)
                        accumulativeBitrate = stats.videoBytesSent
                        accumulativeAudioBitrate = stats.audioBytesSent
                        accumulativePacketsSent = stats.videoPacketsSent + stats.audioPacketsSent
                        this.xAxisData.push(this.formatTime(new Date()))
                        this.xAxisData.splice(0, 1)
                    })
                }, 1000)
            }
        },
        // 处理 xAxis 
        handleXAxis() {
            this.xAxisData = []
            let end = parseInt((new Date().getTime()) / 1000)
            let start = end - 300
            for (let i = start; i < end; i++) {
                this.xAxisData.push(this.formatTime(new Date(i * 1000)))
            }
        },
        // 时间格式化
        formatTime(time) {
            let h = time.getHours()
            h = h > 9 ? h : '0' + h
            let m = time.getMinutes()
            m = m > 9 ? m : '0' + m
            let s = time.getSeconds()
            s = s > 9 ? s : '0' + s
            return h + ':' + m + ':' + s
        },
        // 销毁计时器
        destroyInterval() {
            if (this.timer) {
                clearInterval(this.timer)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    margin-top: 20px;
    font-size: 12px;
}
</style>
