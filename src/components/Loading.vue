<template>
  <div class="loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>


<style lang="less" scoped>
.loading {
  width: 40px;
  height: 18px;

  > div {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 2px;
    border-radius: 100%;
    background-color: currentColor;
    animation: ball-beat 0.9s infinite linear;

    &:nth-child(2) {
      animation-delay: -0.3s;
    }

    &:nth-child(3) {
      animation-delay: -0.6s;
    }
  }
}

@keyframes ball-beat {
  50% {
    opacity: 0.2;
    transform: scale(0.75);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>