import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        joinStatus: false,
        speakerIndex: 0
    },
    mutations: {
        joinRoomStatus (state, payload) {
            state.joinStatus = payload.joinStatus;
        },
        speakerIndex (state, payload) {
            state.speakerIndex = payload.speakerIndex
        }
    },
    actions: {},
    modules: {}
})
