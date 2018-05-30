<template>
  <div class="calendar-head">
    <div class="add-btn-box">
      <el-dropdown :visible-arrow="false" @command="changeTimeType">
        <span class="el-dropdown-link" style="padding-right: 20px;cursor:pointer;">
          {{timeTypeTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :class="{'menu-item-active' : timeData.timeType === 'month' }" command="month">按月查看</el-dropdown-item>
          <el-dropdown-item :class="{'menu-item-active' : timeData.timeType === 'week' }" command="week">按周查看</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span>
         <el-button @click="changeTime('reduce')" type="text"><i class="add-arrow-icon el-icon-arrow-left"></i></el-button>
        <span class="time-text">
          <span v-if="timeData.timeType === 'month'">{{timeData.year + '年&nbsp;&nbsp;'}}</span>
          <span :class="{'bold-text' : timeData.timeType === 'month'}">{{timeData.month + '月'}}</span>
          <span v-if="timeData.timeType === 'week'" :class="{'bold-text' : timeData.timeType === 'week'}">{{'&nbsp;&nbsp;第' + cnWeekIndex + '周'}}</span>
        </span>
        <el-button @click="changeTime('add')" type="text"><i class="add-arrow-icon el-icon-arrow-right"></i></el-button>
      </span>
     </div>
    <el-button 
      v-if="timeData.timeType === 'month'"
      size="mini"
      class="c-mini-btn"
      @click="changeTimeRange('tomonth')"
    >回到本月</el-button>
    <el-button 
      v-else-if="timeData.timeType === 'week'"
      size="mini"
      class="c-mini-btn"
      @click="changeTimeRange('toweek')"
    >回到本周</el-button>
    <div style="float:right;">
      <checkPopverInput 
      :checkGroupList="accountList"
      @checkChange="accountChange"
      :placeholder="'账号筛选'"
      :allHolder="'全部账号'"
      style="margin-right: 10px;"
      ></checkPopverInput>
      <checkPopverInput 
      :checkGroupList="colorList"
      @checkChange="colorChange"
      :placeholder="'颜色筛选'"
      :allHolder="'全部颜色'"
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
      weekRangIndex: {
        type: Number,
        default: 0
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
    computed: {
      timeTypeTitle () {
        return this.timeData.timeType === 'month' ? '按月查看' : '按周查看'
      },
      cnWeekIndex () {
        let list = ['一', '二', '三', '四', '五', '六']
        return list[this.weekRangIndex]
      }
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
      changeTimeRange (t) {
        this.$emit('changeTimeRange', t)
      },
      addEventShow (t) {
        this.$emit('addEventShow', t)
      },
      accountChange (items) {
        this.$emit('accountChange', items)
      },
      colorChange (items) {
        this.$emit('colorChange', items)
      }
    }
  }
</script>
<style lang="less" scoped>
.calendar-head{
  padding: 0 20px;
  .bold-text{
    font-weight: bold;
  }
}
.add-btn-box{
  display: inline-block;
  margin-right: 20px;
  font-size: 16px;
  line-height: 36px;
  button{
    padding: 0;
  }
  .time-text{
    display: inline-block;
    padding: 0 10px;
    text-align: center;
  }
  .add-arrow-icon{
    font-size: 16px;
    line-height: 36px;
    color: #33475B;
  }
}
</style>
<style lang="less">
.calendar-head{
  .c-mini-btn.el-button--mini{
    padding: 4px 8px;
  }
}
.menu-item-active{
  background-color: #ecf5ff;
  color: #66b1ff;
}
</style>

