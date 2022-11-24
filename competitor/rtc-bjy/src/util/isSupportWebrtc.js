export default function () {
    let e = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    let t = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    let n = window.WebSocket
    return !!e && !!t && !!n
}