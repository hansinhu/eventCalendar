<template>
  <div class="calendar-head">
    <div class="add-btn-box">
      <el-button @click="changeTime('reduce')" type="text"><i class="add-arrow-icon el-icon-arrow-left"></i></el-button>
      <span class="time-text">{{timeData.year + '年 ' + timeData.month + '月'}}</span>
      <el-button @click="changeTime('add')" type="text"><i class="add-arrow-icon el-icon-arrow-right"></i></el-button>
    </div>
    <el-button-group>
      <el-button size="medium" @click="changeTimeType('month')" :type=" timeData.timeType === 'month' ? 'primary':''">本月</el-button>
      <el-button size="medium" @click="changeTimeType('week')" :type=" timeData.timeType === 'week' ? 'primary':''">本周</el-button>
    </el-button-group>
    <div style="float:right;">
      <checkPopverInput 
      :checkGroupList="accountList"
      @checkChange="accountChange"
      :placeholder="'账号筛选'"
      style="margin-right: 10px;"
      ></checkPopverInput>
      <checkPopverInput 
      :checkGroupList="colorList"
      @checkChange="colorChange"
      :placeholder="'颜色筛选'"
      listType="color"
      style="margin-right: 10px;"
      ></checkPopverInput>
      <el-button size="medium" @click="addEventShow('now')" type="primary">新增日程</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'calendarHeadar',
    data () {
      return {
        showAccout: false,
        selectAccoutId: '',
        selectColor: ''
      }
    },
    props: {
      timeData: {
        type: Object,
        default: () => {
          return {
            year: 0,
            month: 0,
            timeType: 'month'
          }
        }
      },
      accountList: {
        type: Array,
        default: () => []
      },
      colorList: {
        type: Array,
        default: () => []
      }
    },
    components: {
      checkPopverInput: () => import('./checkPopverInput')
    },
    mounted () {
    },
    methods: {
      changeTime (a) {
        this.$emit('changeTime', a)
      },
      changeTimeType (t) {
        this.$emit('changeTimeType', t)
      },
      addEventShow (t) {
        this.$emit('addEventShow', t)
      },
      accountChange (items) {
        console.log(items)
      },
      colorChange (items) {
        console.log(items)
      }
    }
  }
</script>
<style lang="less" scoped>
.calendar-head{
  padding: 0 20px;
}
.add-btn-box{
  display: inline-block;
  width: 210px;
  font-size: 16px;
  line-height: 36px;
  button{
    padding: 0;
  }
  .time-text{
    display: inline-block;
    width: 130px;
    text-align: center;
  }
  .add-arrow-icon{
    font-size: 16px;
    line-height: 36px;
  }
}
</style>
<style lang="less">
.calendar-head{
  .el-button-group{
    vertical-align: top;
  }
}
</style>

