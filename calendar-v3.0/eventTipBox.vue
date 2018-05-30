<template>
  <div class="cell-tips" :style="{top: (config.top - 88) + 'px'}">
    <h3>{{tipDay.month + '月' + tipDay.date + '日'}}</h3>
    <p><span class="el-icon-caret-right"></span>{{esCount + '个日程'}}</p>
    <div class="bottom-arrow"><span class="el-icon-caret-bottom"></span></div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        defaultData: {
          theme: ''
        }
      }
    },
    props: {
      tipDay: {
        type: Object,
        default: () => {}
      },
      esCount: {
        type: Number,
        default: 0
      },
      config: {
        type: Object,
        default: {
          top: 0
        }
      }
    }
  }
</script>

<style lang="less" scoped>
.cell-tips{
  position: absolute;
  left: 38px;
  z-index: 99;
  width: 92px;
  box-sizing: border-box;
  color: #fff;
  padding: 15px 5px;
  padding-right: 2px;
  background: #415B77;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.20);
  border-radius: 6px;
  h3{
    font-size: 14px;
    line-height: 20px;
    text-indent: 10px;
  }
  p{
    line-height: 20px;
    height: 20px;
    text-indent: 2px;
  }
  .bottom-arrow{
    height: 0;
    font-size: 20px;
    text-align: center;
    position: absolute;
    bottom: 10px;
    color: #415B77;
    width: 86px;
  }
}
</style>

