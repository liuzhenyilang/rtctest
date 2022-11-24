<template>
    <div>
        <div class="title">移动端演示</div>
        <div id="qrcode"></div>
    </div>
</template>

<script>
import QRCode from 'qrcodejs2'
export default {
    props: {
        roomId: {}
    },
    mounted() {
        this.qrcode()
    },
    methods: {
        qrcode(roomId) {
            if (this.qrcodeDom) {
                this.qrcodeDom.clear()
                this.qrcodeDom.makeCode(`${location.href}?roomId=${roomId}`)
            }
            else {
                this.qrcodeDom = new QRCode('qrcode', {
                    width: 150,
                    height: 150,
                    text: `${location.href}`,
                    colorDark: '#000',
                    colorLight: '#fff'
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    font-size: 14px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #5e6d82;
    margin: 10px 0;
}
#qrcode {
    margin-bottom: 20px;
}
</style>