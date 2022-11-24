<template>
    <el-dialog
        title="用户信息"
        :visible.sync="dialogVisible"
        :width="isMobile ? '80%' : '420px'">
        <el-form :model="userInfo" :rules="rules" ref="userInfo" label-width="70px" class="demo-ruleForm">
            <el-form-item label="AppID" prop="appId">
                <el-input v-model="userInfo.appId"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" class="buttons" @click="confirm">确定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        isMobile: {},
        value: {}
    },
    data() {
        return {
            dialogVisible: this.value,
            userInfo: {
                appId: ''
            },
            rules: {
                appId: [
                    { required: true, message: '请输入AppID', trigger: 'blur' }
                ]
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
        confirm() {
            this.$emit('changeAppId')
        },
    }
}
</script>

<style lang="less" scoped>
.content {
    display: flex;
    align-items: center;
    height: 40px;
    .icon.warning {
        display: inline-block;
        width: 40px;
        height: 40px;
        background: url('../img/brtc-demo-warning-icon.png');
        background-size: cover;
    }
    .text {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #03081a;
        margin-left: 20px;
    }
}
.dialog-footer {
    .buttons {
        background: #1795FF !important;
    }
}
</style>