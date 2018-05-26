<template>
  <div class="calender">
    <h2 class="calender-title">日历进程</h2>
    <calendarHeadar
      :timeData="{
        year: year,
        month: month,
        timeType: timeType
      }"
      :colorList="colorList"
      :accountList="accountList"
      @changeTime="changeTime"
      @changeTimeType="changeTimeType"
      @addEventShow="addEventShow"
    ></calendarHeadar>
    <div class="calender-body">
      <eventCalendar
        :year="year"
        :month="month"
        :tYear="tYear"
        :tMonth="tMonth"
        :tDay="tDay"
        :timeType="timeType"
        :asycEventList="asycEventList"
        @addEventShow="addEventShow"
      ></eventCalendar>
    </div>
    <addEventDialog
      :addConfig="addConfig"
      :colorList="colorList"
      @cancelAdd="cancelAdd"
    ></addEventDialog>
  </div>
</template>

<script>
  import userScheduleRead from './mock.js'
  export default {
    name: 'calendar',
    data () {
      return {
        year: 1970,
        month: 1,
        tYear: 1970,
        tMonth: 1,
        tDay: 1,
        timeType: 'month',
        currentDay: 1,
        currentMonth: 1,
        currentYear: 1970,
        currentWeek: 1,
        days: [],
        asycEventList: [],
        accountList: [],
        colorList: [
          {
            name: '红色',
            color: '#e4393c'
          },
          {
            name: '黑色',
            color: '#000000'
          }
        ],
        addConfig: {
          addVisible: false,
          start: '',
          end: ''
        }
      }
    },
    components: {
      calendarHeadar: () => import('./calendarHeader'),
      eventCalendar: () => import('./eventCalendar'),
      addEventDialog: () => import('./addEventDialog')
    },
    filters: {},
    mounted () {
      // 每月第一天作为初始参数
      let date = new Date()
      this.tYear = this.year = date.getFullYear()
      this.tMonth = this.month = date.getMonth() + 1
      this.tDay = date.getDate()
      this.asycEventList = userScheduleRead
      this.checkAccount()
    },
    methods: {
      // 关闭添加弹窗
      cancelAdd () {
        this.addConfig = Object.assign(this.addConfig, {addVisible: false})
      },
      checkAccount () {
        let user = window.localStorage.user ? JSON.parse(window.localStorage.user) : ''
        if (user && !user.parentUserId) {
          this.showAccout = true
          let sublist = user.subUserList
          let account = [{name: user.name || user.loginAccount, id: user.userId}]
          if (sublist && sublist.length) {
            account = account.concat(sublist)
          }
          this.accountList = account
        }
      },
      // changeTime
      changeTime (a) {
        if (a === 'add') {
          if (this.month < 12) {
            this.month += 1
          } else {
            this.year += 1
            this.month = 1
          }
        } else if (a === 'reduce') {
          if (this.month > 1) {
            this.month -= 1
          } else {
            this.month = 12
            this.year -= 1
          }
        }
      },
      changeTimeType (t) {
        this.timeType = t // month or week
        this.year = this.tYear
        this.month = this.tMonth
      },
      addEventShow (t) {
        let start
        if (t === 'now') {
          start = this.formatDate(this.tYear, this.tMonth, this.tDay)
        } else if (t) {
          start = t
        }
        this.addConfig.start = start
        this.addConfig = Object.assign(this.addConfig, {addVisible: true})
      },
       // 返回 类似 2016-01-02 格式的字符串
      formatDate (year, month, day) {
        var y = year
        var m = month
        if (m < 10) m = '0' + m
        var d = day
        if (d < 10) d = '0' + d
        return y + '-' + m + '-' + d
      },
      addNewEvent () {
        // s
      }
    }
  }
</script>
<style lang="less" scoped>

.calender{
  width: 1200px;
  margin: 50px auto;
  padding-bottom: 20px;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.15);
  .calender-title{
    line-height: 60px;
    font-size: 16px;
    text-indent: 20px;
  }
  .calender-body{
    padding: 0 20px;
  }
}

</style>

