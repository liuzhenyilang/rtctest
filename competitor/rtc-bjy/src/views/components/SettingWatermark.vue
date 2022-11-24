<template>
    <el-dialog
        title="水印设置" v-dialogDrag
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="540px">
        <el-checkbox class="checkbox" v-model="enableWatermark">
            是否开启水印
        </el-checkbox>
        <div class="setting-option">
            <label>url:</label>
            <el-input class="slider" v-model="waterMark.url" 
                placeholder="水印的url" @blur="changeParams"></el-input>
        </div>
        <div class="setting-option">
            <label>width:</label>
            <el-slider class="slider" v-model="waterMark.width" :min="0" 
                :max="1" :step="0.05" :show-tooltip="false" show-input></el-slider>
        </div>
        <div class="setting-option">
            <label>top:</label>
            <el-slider class="slider" v-model="waterMark.top" :min="0" 
                :max="1" :step="0.05" :show-tooltip="false" show-input></el-slider>
        </div>
        <div class="setting-option">
            <label>left:</label>
            <el-slider class="slider" v-model="waterMark.left" :min="0" 
                :max="1" :step="0.05" :show-tooltip="false" show-input></el-slider>
        </div>
        <div class="setting-option">
            <label>opacity:</label>
            <el-slider class="slider" v-model="waterMark.opacity" :min="0" 
            :max="1" :step="0.05" :show-tooltip="false" show-input></el-slider>
        </div>
    </el-dialog>
</template>

<script>
import '../../directives/drag.js'
export default {
    props: {
        isMobile: {},
        value: {}
    },
    data() {
        return {
            waterMark: {
                url: 'https://img.baijiayun.com/0baijiatools/b8c19761d9d80efaec3ccb96bcc31ac0/bjy-logo.png',
                width: 0.2,
                top: 0.1,
                left: 0.05,
                opacity: 0.9
            },
            dialogVisible: this.value,
            enableWatermark: false
        }
    },
    watch: {
        value(val) {
            this.dialogVisible = val
        },
        dialogVisible(val) {
            this.$emit('input', val)
        },
        'waterMark.width'() {
            this.changeParams()
        },
        'waterMark.top'() {
            this.changeParams()
        },
        'waterMark.left'() {
            this.changeParams()
        },
        'waterMark.opacity'() {
            this.changeParams()
        },
        enableWatermark(val) {
            this.$emit('switchWatermark', val)
        }
    },
    methods: {
        changeParams() {
            this.$emit('setWatermark', this.waterMark)
        }
    }
}
</script>

<style lang="less" scoped>
.checkbox {
    margin-bottom: 20px;
}
.setting-option {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    >label {
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #333;
    }
    .slider {
        display: inline-block;
        width: calc(100% - 70px);
    }
}
</style>
<style lang="less">
.el-dialog .el-dialog__header {
    padding-left: 10px;
}
.el-dialog .el-dialog__body {
    padding: 15px;
}
</style>