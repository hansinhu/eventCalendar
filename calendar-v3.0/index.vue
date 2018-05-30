<template>
  <div class="calender">
    <p class="calender-title">日历进程</p>
    <calendarHeadar
      :timeData="{
        year: year,
        month: month,
        timeType: timeType
      }"
      :colorList="colorList"
      :accountList="accountList"
      :weekRangIndex="weekRangIndex"
      @changeTime="changeTime"
      @changeTimeType="changeTimeType"
      @changeTimeRange="changeTimeRange"
      @addEventShow="addEventShow"
      @accountChange="accountFilterChange"
      @colorChange="colorFilterChange"
    ></calendarHeadar>
    <div
      class="calender-body"
      :style="{minHeight: timeType === 'month' ? '600px' : '200px'}"
      v-loading="eventLoading"
    >
      <eventCalendar
        :year="year"
        :month="month"
        :tYear="tYear"
        :tMonth="tMonth"
        :tDay="tDay"
        :timeType="timeType"
        :weekRangIndex="weekRangIndex"
        :asycEventList="asycEventList"
        :updateCalendar="updateCalendar"
        :hiddenPopover="hiddenPopover"
        @addEventShow="addEventShow"
        @updateEventShow="updateEventShow"
        @deletEventShow="deletEventShow"
        @getCurrentWeekIndex="getCurrentWeekIndex"
        @getDaysList="getDaysList"
      ></eventCalendar>
    </div>
    <addEventDialog
      v-if="addConfig.addVisible"
      :addConfig="addConfig"
      :colorList="colorList"
      :accountList="accountList"
      @cancelAdd="cancelAdd"
      @addSubmit="addSubmit"
    ></addEventDialog>
    <DialogBox :config="deleteConfig" @sure="sureDelete"></DialogBox>
  </div>
</template>

<script>
  // import userScheduleRead from './mock.js'
  import {mapGetters, mapActions} from 'vuex'
  import DialogBox from '@/components/box/dialogBox'
  export default {
    name: 'calendar',
    data () {
      return {
        updateCalendar: 0, // eventCalendar watch updateCalendar to update UI
        hiddenPopover: 0,
        year: 1970,
        month: 1,
        tYear: 1970,
        tMonth: 1,
        tDay: 1,
        timeType: 'month',
        weekRangIndex: 0, // 0 - 4 共5周
        currentWeekIndex: 0,
        eventLoading: false,
        accountIds: [],
        colors: [],
        asycStart: '',
        asycEnd: '',
        asycEventList: [],
        accountList: [],
        userId: '',
        colorList: [
          {
            name: '红（浅）',
            color: '#fca7a7',
            borderColor: 'rgba(252, 167, 167, 0.4)'
          },
          {
            name: '蓝（浅）',
            color: '#9dd1ff',
            borderColor: 'rgba(157,209,255, 0.4)'
          },
          {
            name: '紫（浅）',
            color: '#bbbbff',
            borderColor: 'rgba(187,187,255, 0.4)'
          },
          {
            name: '橙（浅）',
            color: '#fdd1a3',
            borderColor: 'rgba(253,209,163, 0.4)'
          },
          {
            name: '绿（浅）',
            color: '#93f0c0',
            borderColor: 'rgba(147,240,192, 0.4)'
          }
        ],
        addConfig: {
          addVisible: false,
          start: '',
          end: '',
          editype: 'add',
          updateItem: null
        },
        initAddConfig: {
          addVisible: false,
          start: '',
          end: '',
          editype: 'add',
          updateItem: null
        },
        deleteConfig: {
          visible: false,
          notice: '',
          message: ''
        },
        deleteId: ''
      }
    },
    computed: {
      ...mapGetters([ 'eventList' ])
    },
    components: {
      DialogBox,
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
      // this.asycEventList = userScheduleRead.slice(0)
      this.checkAccount()
    },
    methods: {
      ...mapActions([ 'GETEVENTLIST', 'ADDEVENT', 'UPDATEEVENT', 'DELETEVENT' ]),
      getEventList () {
        let params = {
          start: this.asycStart,
          end: this.asycEnd
        }
        this.eventLoading = true
        this.GETEVENTLIST(params).then((list) => {
          this.eventLoading = false
          this.eventFilter()
        })
      },
      // 关闭添加弹窗
      cancelAdd () {
        this.addConfig = Object.assign({}, this.initAddConfig)
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
      getDaysList (days) {
        let start = days[0].dayArr[0].dateStr
        let end = days[days.length - 1].dayArr[6].dateStr
        if (start !== this.asycStart) {
          this.asycStart = start
          this.asycEnd = end
          this.getEventList()
        }
      },
      changeMonth (a) {
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
        this.weekRangIndex = 0
      },
      changeWeek (a) {
        if (a === 'add') {
          if (this.weekRangIndex < 4) {
            this.weekRangIndex += 1
          } else {
            this.changeMonth(a)
            this.weekRangIndex = 0
          }
        } else if (a === 'reduce') {
          if (this.weekRangIndex > 0) {
            this.weekRangIndex -= 1
          } else {
            this.changeMonth(a)
            this.weekRangIndex = 4
          }
        }
      },
      // changeTime
      changeTime (a) {
        if (this.timeType === 'month') {
          this.changeMonth(a)
        } else {
          this.changeWeek(a)
        }
        this.updateCalendar += 1
      },
      changeTimeType (t) {
        this.timeType = t // month or week
        this.weekRangIndex = 0
        this.updateCalendar += 1
      },
      changeTimeRange (t) {
        this.year = this.tYear
        this.month = this.tMonth
        this.weekRangIndex = t === 'tomonth' ? 0 : this.currentWeekIndex // 代表回到本周
        this.updateCalendar += 1
      },
      getCurrentWeekIndex (n) {
        this.currentWeekIndex = n
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
      updateEventShow (item) {
        this.addConfig = Object.assign(this.addConfig, {
          start: item.start,
          end: item.end,
          editype: 'update',
          addVisible: true,
          updateItem: item
        })
      },
      deletEventShow (item) {
        Object.assign(this.deleteConfig, {
          visible: true,
          notice: '确定删除该日程吗？',
          message: item.data.title
        })
        this.deleteId = item.data.id
      },
      sureDelete () {
        this.DELETEVENT({id: this.deleteId}).then((res) => {
          if (res.data && !res.data.code) {
            this.getEventList()
            this.hiddenPopover ++ // 用于隐藏弹框
          }
        })
      },
      addSubmit (data) {
        // console.log(data)
        let type = data.type
        let form = data.form
        if (type === 'add') {
          //  调用新增接口
          let params = {
            title: form.title
          }
          this.ADDEVENT(params).then((res) => {
            this.addConfig = Object.assign({}, this.initAddConfig)
            this.getEventList()
          })
        } else if (type === 'update') {
          //  调用更新接口
          let params = {
            title: form.title
          }
          this.UPDATEEVENT(params).then((res) => {
            this.addConfig = Object.assign({}, this.initAddConfig)
            this.getEventList()
          })
        }
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
      // 列表搜索相关
      accountFilterChange (users) {
        let ids = []
        users.forEach((n) => {
          ids.push(n.id)
        })
        this.accountIds = ids
        this.eventFilter()
      },
      colorFilterChange (colorList) {
        let colors = []
        colorList.forEach((n, i) => {
          colors.push(n.color)
        })
        this.colors = colors
        this.eventFilter()
      },
      eventFilter () {
        // let eList = userScheduleRead.slice(0)
        let eList = this.eventList.slice(0)
        let filterList = []
        if (this.colors && this.colors.length) {
          eList.forEach((ev, i) => {
            // 颜色筛选
            if (this.colors.indexOf(ev.color) !== -1) {
              filterList.push(ev)
            }
          })
        } else {
          filterList = eList
        }
        let lastList = []
        // if (this.accountIds && this.accountIds.length) {
        //   filterList.forEach((ev, i) => {
        //     //  账号筛选
        //     if (this.accountIds.indexOf(ev.data.user) !== -1) {
        //       lastList.push(ev)
        //     }
        //   })
        // } else {
        //   lastList = filterList
        // }
        lastList = filterList
        this.asycEventList = lastList
        this.updateCalendar += 1
      }
    }
  }
</script>
<style lang="less" scoped>
.calender{
  width: 1200px;
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

