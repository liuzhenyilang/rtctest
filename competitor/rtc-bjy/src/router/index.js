import Vue from 'vue'
import VueRouter from 'vue-router'
import RtcDemo from '../views/index.vue'
import DemoH5 from '../views/h5.vue'
import judgeMobile from '../util/judgeMobile'
let isMobile = judgeMobile()

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/rtc'
  },
  {
    path: '/rtc',
    key: 'rtc',
    component: isMobile ? DemoH5 : RtcDemo,
    children: [
      {
        path: '',
        name: 'basic',
        component: isMobile ? () => import('../views/BasicH5.vue') : () => import('../views/Basic.vue')
      },
      {
        path: 'screenShare',
        name: 'screenShare',
        component: isMobile ? () => import('../views/ScreenShareH5.vue') : () => import('../views/ScreenShare.vue')
      },
      {
        path: 'multiLive',
        name: 'multiLive',
        component: isMobile ? () => import('../views/MultiLiveH5.vue') : () => import('../views/MultiLive.vue')
      },
      {
        path: 'changeDevice',
        name: 'changeDevice',
        component: isMobile ? () => import('../views/ChangeDeviceH5.vue') : () => import('../views/ChangeDevice.vue')
      },
      {
        path: 'captureStream',
        name: 'captureStream',
        component: isMobile ? () => import('../views/CaptureStreamH5.vue') : () => import('../views/CaptureStream.vue')
      },
      {
        path: 'captureStreamFromCanvas',
        name: 'captureStreamFromCanvas',
        component: isMobile ? () => import('../views/CaptureStreamFromCanvasH5.vue') : () => import('../views/CaptureStreamFromCanvas.vue')
      },
      {
        path: 'videoBitrate',
        name: 'videoBitrate',
        component: isMobile ? () => import('../views/VideoBitrateH5.vue') : () => import('../views/VideoBitrate.vue')
      },
      {
        path: 'audioProfile',
        name: 'audioProfile',
        component: isMobile ? () => import('../views/AudioProfileH5.vue') : () => import('../views/AudioProfile.vue')
      },
      {
        path: 'beauty',
        name: 'beauty',
        component: isMobile ? () => import('../views/BasicH5.vue') : () => import('../views/Beauty.vue')
      },
      {
        path: 'watermark',
        name: 'watermark',
        component: isMobile ? () => import('../views/BasicH5.vue') : () => import('../views/Watermark.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
