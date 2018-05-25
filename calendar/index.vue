<template>
  <div class="calender">
    <div>
      <el-select v-model="year" placeholder="年" @change="changeYearMonth">
        <el-option
          v-for="item in yearlist"
          :label="item.label"
          :key="item.val"
          :value="item.val">
        </el-option>
      </el-select>
      <el-select v-model="month" placeholder="月" @change="changeYearMonth">
        <el-option
          v-for="item in monthlist"
          :label="item.label"
          :key="item.val"
          :value="item.val">
        </el-option>
      </el-select>
    </div>
    <div>
      <div class="weeks">
        <strong 
          class="week"
          v-for="dayIndex in 7"
          :key="dayIndex"
          :class="{'week-today': currentmonthstart === monthstart && dayIndex - 1 === currentWeek}"
        >
          {{ (dayIndex - 1) | localeWeekDay }}
        </strong>
      </div>
      <div class="c-container">
        <div v-for="(obj, j) in days" :key="j">
          <table class="c-table">
            <thead>
              <tr>
                <td class="c-h-cell" v-for="(day, i) in obj.dayArr" :key="i">
                  <span class="cell-day"
                    title="新建事件"
                    @click="addNewEvent"
                    :class="{otherMonth: isOtherMonth(day),today: isToday(day)}">{{day.date}}</span>
                </td>
              </tr>
            </thead>
            <tbody>
              <!-- <tr v-for="(wk, i) in testEventList" :key="i">
                <td>{{wk.type}}</td>
              </tr> -->
              <!-- <tr v-for="(day, i) in obj" :key="i">
                <template v-for="(ev ,n) in day.eventList">
                  <td v-if="ev.row" :key="n" :colspan="ev.row">{{ev.row}}</td>
                  <td v-else :key="n"></td>
                </template>
              </tr> -->
            </tbody>
          </table>
          <div class="event-container">
            <div class="s"
              v-for="(n, i) in obj.weekEventList"
              :key="i"
              :style="{
                width: (n._eLen * 170) + 'px',
                left: (n._eX * 170) + 'px',
                top: (n._eY * 40) + 'px'
              }"
            >{{n.start + 'M' + n.end}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import userScheduleRead from './mock.js'
  export default {
    name: 'calendar',
    data () {
      return {
        year: 2018,
        month: 5,
        yearlist: [],
        monthlist: [],
        currentmonthstart: 0,
        monthstart: 0,
        dayIndex: 1,
        currentDates: [],
        currentDay: 1,
        currentMonth: 1,
        currentYear: 1970,
        currentWeek: 1,
        days: [],
        dayEventLen: [0, 0, 0, 0, 0, 0, 0],
        calendarPlan: [],
        lastMonthData: null
      }
    },
    filters: {
      localeWeekDay (weekday) {
        let map = {0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六'}
        return map[weekday]
      },
      YMDformat (value) {
        if (!value || value === '') {
          return ''
        }
        // 返回处理后的值
        let time = new Date(value)
        let year = time.getFullYear()
        let month = (time.getMonth() < 9 ? '0' : '') + (time.getMonth() + 1)
        let day = (time.getDate() < 10 ? '0' : '') + time.getDate()
        return year + '-' + month + '-' + day
      }
    },
    mounted () {
      // 每月第一天作为初始参数
      let date = new Date()
      this.getEachCalendar(this.formatDate(date.getFullYear(), date.getMonth() + 1, 1))
      this.initYearList()
      /**
       * 华丽分割线
       * 如果前一项没占到当前事项的位置，push当前事项
       * 如果前一项占了当前事项的位置，push空值
       * 列数计算< allRow >：
       *                  getAllRow 除了某天最高项，还要加上被挤到下面的项？how to do?
       *                  先计算allRow，再向allRow中push事件数据项 或 空值数据项
       * 行数计算< allCol >： week.length
       */
    },
    methods: {
      initEventList (weekArr) {
        let week = []
        weekArr.forEach((n) => {
          week.push(n.dateStr)
        })
        let objList = []
        let weekObj = {}
        let weekLen = {}
        let weekPoint = []
        week.forEach((w) => {
          weekObj[w] = []
          weekLen[w] = 0
        })
        let allLen = 0
        userScheduleRead.forEach((ev, i) => {
          let obj = {
            _day: this.tfDays(ev.start, ev.end),
            start: ev.start,
            end: ev.end,
            data: ev
          }
          let dayWeekIndex = 0
          let dayEventLen = 0
          let dayWeekYi = 0
          // 事件的Start在本周，或者本周第一天（周日）在事件中
          if (weekObj[ev.start] || this.inMiddleDay(ev.start, ev.end, week[0])) {
            if (weekObj[ev.start]) {
              dayWeekIndex = week.indexOf(ev.start)
              if (dayWeekIndex + this.tfDays(ev.start, ev.end) <= week.length) {
                dayEventLen = this.tfDays(ev.start, ev.end)
                weekLen[ev.start] = weekLen[ev.start] + this.tfDays(ev.start, ev.end)
              } else {
                dayEventLen = week.length - dayWeekIndex
                weekLen[ev.start] = week.length
              }
              // 如果是周的第一天，切在一个事件的中
            } else if (this.inMiddleDay(ev.start, ev.end, week[0])) {
              if (dayWeekIndex + this.tfDays(week[0], ev.end) <= week.length) {
                dayEventLen = this.tfDays(week[0], ev.end)
                weekLen[week[0]] = weekLen[week[0]] + this.tfDays(week[0], ev.end)
              } else {
                dayEventLen = week.length - dayWeekIndex
                weekLen[ev.start] = week.length
              }
            }
            // ev._eY用于与上上周位置对齐
            dayWeekYi = ev._eY || this.getEventY(dayWeekIndex, dayEventLen, weekPoint).yI
            obj._eLen = dayEventLen // event 长度，不能超过一周（7）
            obj._eX = dayWeekIndex // 当天所在周的标（横坐标X）原点（0,0）
            obj._eY = dayWeekYi // 纵坐标Y
            allLen = allLen + 1
            objList.push(obj)
            let eventPoint = this.getEventY(dayWeekIndex, dayEventLen, weekPoint).pointArr // 新点位放入weekPoint
            weekPoint = weekPoint.concat(eventPoint)
            userScheduleRead[i]._eY = obj._eY
          }
        })
        return objList
      },
      // 求Y坐标
      getEventY (weekIndex, len, allPoint, yI = 0) {
        let arr = []
        for (let i = weekIndex; i < len + weekIndex; i++) {
          arr.push(i + ',' + yI)
        }
        let beenY = false
        arr.forEach((n) => {
          if (allPoint.indexOf(n) !== -1) {
            beenY = true
          }
        })
        if (beenY) {
          return this.getEventY(weekIndex, len, allPoint, yI + 1)
        } else {
          return {
            yI: yI,
            pointArr: arr
          }
        }
      },
      // 初始化年列表
      initYearList () {
        let year = new Date().getFullYear()
        this.yearlist = [{
          val: year,
          label: year + '年'
        }]
        for (let i = 1; i <= 5; i++) {
          this.yearlist.push({
            val: year + i,
            label: year + i + '年'
          })
          this.yearlist.unshift({
            val: year - i,
            label: year - i + '年'
          })
        }
        for (let i = 1; i <= 12; i++) {
          this.monthlist.push({
            val: i,
            label: i + '月'
          })
        }
      },
      changeYearMonth () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      },
      // 每个月的日期表
      getEachCalendar (cur) {
        var date
        if (cur) {
          date = new Date(cur)
        } else {
          date = new Date()
        }
        this.currentDay = date.getDate()
        this.currentYear = this.year = date.getFullYear()
        this.currentMonth = this.month = date.getMonth() + 1
        this.currentWeek = date.getDay()
        let traceDay = 35 - (this.currentWeek + 1)
        //  如果把周日设置为第一天
        // let setSunTolast = false
        // if (this.currentWeek === 0 && setSunTolast) {
        //   this.currentWeek = 7
        //   traceDay = 35 - this.currentWeek
        // }
        var str = this.formatDate(this.currentYear, this.currentMonth, this.currentDay)
        let dayArr = []
        // 第一天以前的数据（上个月的数据）
        for (let i = this.currentWeek; i >= 0; i--) {
          let d = new Date(str)
          d.setDate(d.getDate() - i)
          dayArr.push(this.dealDateData(d))
        }
        // 第一天及以后的日期（包括下个月）
        for (let i = 1; i <= traceDay; i++) {
          let d = new Date(str)
          d.setDate(d.getDate() + i)
          dayArr.push(this.dealDateData(d))
        }
        // 把dayArr处理成5组
        let dayArrObj = []
        let copyDayArr = dayArr.slice(0)
        for (let i = 0; i < 5; i++) {
          let weekArr = copyDayArr.splice(0, 7)
          dayArrObj.push({
            dayArr: weekArr,
            weekEventList: this.initEventList(weekArr)
          })
        }
        // console.log(dayArrObj)
        this.days = dayArrObj
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
      dealDateData (d) {
        let item = {}
        item.date = d.getDate()
        item.year = d.getFullYear()
        item.month = d.getMonth() + 1
        item.dateStr = this.formatDate(item.year, item.month, item.date)
        item.eventList = []
        // 异步数据
        userScheduleRead.forEach((n) => {
          let col = Object.assign({ row: 0 }, n)
          if (n.start === item.dateStr) {
            col.tfDays = this.tfDays(n.start, n.end)
            col.row = col.row + col.tfDays
            item.eventList.push(col)
          }
        })
        return item
      },
      // 事件列长度
      eventLen () {
        // ss
      },
      // 时间差
      tfDays (start, end) {
        let sTime = new Date(start).getTime()
        let eTime = new Date(end).getTime()
        let day = (eTime - sTime) / (3600 * 1000 * 24) + 1
        // 如果精确到时分，还需要调整
        // let _day = ((start, end) => {
        //   if (start.slice(0, 11) !== end && start.slice(0, 11) && (eTime - sTime) % (3600 * 1000 * 24)) {
        //     day = day + 1
        //   }
        // })()
        return day
      },
      inMiddleDay (start, end, middle) {
        let isMiddle = false
        let sTime = new Date(start).getTime()
        let eTime = new Date(end).getTime()
        let mTime = new Date(middle).getTime()
        if (eTime > mTime && mTime > sTime) {
          isMiddle = true
        }
        return isMiddle
      },
      preColSpanLen (colArr, index) {
        let num = colArr.reduce((t, n) => {
          return t + n
        })
        return (index + 1) > num
      },
      isOtherMonth (item) {
        // let d = new Date()
        if (item.month === this.currentMonth && item.year === this.currentYear) {
          return false
        } else {
          return true
        }
      },
      isToday (item) {
        let d = new Date()
        if (item.month === (d.getMonth() + 1) && item.date === d.getDate() && item.year === d.getFullYear()) {
          return true
        } else {
          return false
        }
      },
      addNewEvent () {
        // s
      }
    }
  }
</script>
<style lang="less" scoped>
.event-container{
  width: 100%;
  height: 400px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  position: relative;
  .s{
    height: 40px;
    width: 80px;
    border: 1px solid;
    margin: 5px;
    position: absolute;
  }
}


.calender{
  width: 1200px;
  margin: 50px auto;
}
.weeks{
  margin-top: 20px;
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}
.week{
  height: 30px;
  line-height: 30px;
  flex: 1;
  text-align: center;
}
.otherMonth{
  color: gainsboro;
}
.today{
  color: red;
}
.c-container{
  border: 1px solid #eee;
  border-top: none;
  box-sizing: border-box;
}
.c-table{
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 1em;
  box-sizing: content-box;
  border-left: 0 hidden transparent;
  border-right: 0 hidden transparent;
  border-bottom: 0 hidden transparent;
  border-color: #ddd;
  td,th{
    border-style: solid;
    border-width: 1px;
    padding: 0;
    vertical-align: top;
    border-color: #ddd;
  }
  .c-h-cell{
    height: 22px;
    text-align: right;
  }
  .cell-day{
    display: inline-block;
    width: 100%;
    font-size: 18px;
    line-height: 22px;
    cursor: pointer;
  }
  tbody{
    td{
      height: 20px;
      padding-top: 1px;
      vertical-align: middle;
    }
    .c-content{
      height: 18px;
      line-height: 18px;
      border-radius: 3px;
      cursor: pointer;
      background: #ff3333;
      color: #fff;
      padding-left: 3px;
    }
  }
}
</style>

