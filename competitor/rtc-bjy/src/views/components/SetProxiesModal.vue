<template>
    <el-dialog
        title="设置代理"
        :visible.sync="dialogVisible"
        :width="isMobile ? '90%' : '420px'"
        class="proxy-modal"
    >
        <el-checkbox v-model="isOpen" :disabled="$store.state.joinStatus" @change="switchProxies">
            是否开启代理（仅供私有化部署使用）
        </el-checkbox>
        <el-form :model="roomUrlList" label-width="40px" class="demo-ruleForm">
            <el-form-item label="Url1">
                <el-input v-model="roomUrlList.roomUrl1" :disabled="isOpen"></el-input>
            </el-form-item>
            <el-form-item label="Url2" v-if="roomUrlList.roomUrl1">
                <el-input v-model="roomUrlList.roomUrl2" :disabled="isOpen"></el-input>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
export default {
    props: {
        isMobile: {
            default: false
        },
        value: {
            default: false
        }
    },
    data() {
        return {
            isOpen: false,
            dialogVisible: this.value,
            roomUrlList: {
                roomUrl1: '',
                roomUrl2: ''
            }
        }
    },
    watch: {
        value(val) {
            this.dialogVisible = val
        },
        dialogVisible(val) {
            this.$emit('input', val);
        }
    },
    methods: {
        switchProxies(data) {
            if (data) {
                if (this.roomUrlList.roomUrl1) {
                    let url = this.roomUrlList.roomUrl1
                    if (url.indexOf('ws') > -1) {
                        BRTC.addProxies({
                            dcurl: '',
                            delay: '0',
                            location: 'bj-al-test',
                            url: url
                        })
                    } else {
                        BRTC.addProxies({
                            dcurl: url,
                            delay: '0',
                            location: 'bj-al-test',
                            url: ''
                        })
                    }
                    if (this.roomUrlList.roomUrl2) {
                        let url2 = this.roomUrlList.roomUrl2
                        if (url2.indexOf('ws') > -1) {
                            BRTC.addProxies({
                                dcurl: '',
                                delay: '0',
                                location: 'bj-al-test',
                                url: url2
                            })
                        } else {
                            BRTC.addProxies({
                                dcurl: url2,
                                delay: '0',
                                location: 'bj-al-test',
                                url: ''
                            })
                        }
                    }
                } else {
                    this.$message.error('url1不能为空')
                }
            }
            else {
                BRTC.removeProxies()
            }
        }
    }
}
</script>

<style lang="less">
.demo-ruleForm {
    margin-top: 10px;
    .el-input__inner {
        line-height: 32px;
        height: 32px;
    }
    .el-form-item__label {
        text-align: left;
        padding: 0;
    }
}
.proxy-modal .el-checkbox__label {
    font-size: 12px;
}
</style>