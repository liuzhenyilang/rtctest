<template>
  <div id="app">
    <router-view></router-view>
    <img class="pre-load" src="./assets/neterr_bg.png" srcset="./assets/neterr_bg.png 2x">
  </div>
</template>

<script>

export default {
  name: 'app',
  mounted () {
    window.addEventListener('online', () => {

      console.log('online');

      this.$router.back()
    })
    window.addEventListener('offline', () => {

      console.log('offline');

      this.$router.push({ path: 'neterr' })
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.pre-load {
  display: none;
}
</style>
