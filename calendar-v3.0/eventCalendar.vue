<template>
  <div class="event-calender">
    <div>
      <div class="weeks">
        <span
          class="week"
          v-for="dayIndex in 7"
          :key="dayIndex"
        >
          {{ (dayIndex - 1) | localeWeekDay }}
        </span>
      </div>
      <div class="c-container">
        <div v-for="(obj, j) in days" :key="j">
          <ul class="event-bg">
            <li
              class="bg-cell"
              v-for="(day, i) in obj.dayArr"
              @mousemove="overTips($event, obj)"
              @click="addNewEvent(day)"
              :style="{
                minHeight: (obj.bgMinHeight * layHeight + 45 + 2) + 'px'
              }"
              :class="{'other-m-bg': isOtherMonth(day)}"
              :key="i">
              <div class="tips-container">
                <cursorTipBox :tipDay="day" :esCount="obj.weekLen[day.dateStr]" :config="tipBoxConfig"/>
              </div>
              <div class="cell-day"
                :class="{'other-m': isOtherMonth(day)}">
                <span 
                  class="cell-day-d" 
                  :class="{today: isToday(day)}"
                >{{day.date}}</span>
              </div>
            </li>
          </ul>
          <div style="position: relative;">
            <div class="event-container" :style="{top: '-' + (obj.bgMinHeight * layHeight + 2) + 'px'}">
              <div :style="{width: 0,minHeight: (obj.bgMinHeight * layHeight) + 'px'}"></div>
              <div class="event-item"
                v-for="(n, i) in obj.weekEventList"
                :key="i"
                :style="{
                  width: (n._eLen * layWidth) + 'px',
                  height: layHeight + 'px',
                  left: (n._eX * layWidth) + 'px',
                  top: (n._eY * layHeight) + 'px'
                }"
              >
                <eventItem 
                  :itemData="n"
                  :layHeight="layHeight"
                  :timeType="timeType"
                  :nowMonth="month"
                  :weekIndex="j"
                  :hiddenPopover="hiddenPopover"
                  @updateEvent="updateEvent"
                  @deletEvent="deletEvent"
                ></eventItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'eventCalendar',
    data () {
      return {
        layWidth: 0,
        layHeight: 0,
        currentDay: 1,
        currentMonth: 1,
        currentYear: 1970,
        currentWeek: 1,
        days: [],
        copyAsycList: [],
        tipBoxConfig: {
          show: false,
          top: 0,
          left: 0,
          conten: ''
        },
        bunceTimer: null
      }
    },
    props: {
      updateCalendar: {
        default: 0
      },
      hiddenPopover: {
        default: 0
      },
      year: {
        default: 1970
      },
      month: {
        default: 1
      },
      tYear: {
        default: 1970
      },
      tMonth: {
        default: 1
      },
      tDay: {
        default: 1
      },
      timeType: {
        default: 'month'
      },
      asycEventList: {
        default: () => []
      },
      weekRangIndex: {
        type: Number,
        default: 0
      }
    },
    components: {
      cursorTipBox: () => import('./eventTipBox'),
      eventItem: () => import('./eventItem')
    },
    watch: {
      updateCalendar () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      }
    },
    filters: {
      localeWeekDay (weekday) {
        let map = {0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT'}
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
      // 初始化布局参数
      this.initLayout()
      // 每月第一天作为初始参数
      this.getEachCalendar(this.formatDate(this.year, this.month, 1))
    },
    methods: {
      initLayout () {
        const mainWidth = 1160
        this.layWidth = mainWidth / 7
        this.layHeight = 26
      },
      addNewEvent (day) {
        this.$emit('addEventShow', day.dateStr)
      },
      initEventList (weekArr) {
        let week = []
        weekArr.forEach((n) => { // 初始化周表
          week.push(n.dateStr)
        })
        let objList = []
        let weekObj = {}
        let weekLen = {} // 用于记录当天有多少日程在进行
        let weekPoint = [] // 坐标点记录，用于计算事件坐标位置
        week.forEach((w) => {
          weekObj[w] = []
          weekLen[w] = 0
        })
        let allLen = 0
        this.copyAsycList.forEach((ev, i) => {
          let obj = {
            _day: this.tfDays(ev.start, ev.end),
            start: ev.start,
            end: ev.end,
            data: ev
          }
          let dayWeekIndex = 0
          let dayEventLen = 0
          let dayWeekYi = 0
          let className = ev.className || ''
          // 事件的Start在本周，或者本周第一天（周日）在事件中
          if (weekObj[ev.start] || this.inMiddleDay(ev.start, ev.end, week[0])) {
            if (weekObj[ev.start]) {
              dayWeekIndex = week.indexOf(ev.start)
              // weekLen[ev.start] = weekLen[ev.start] + 1
              if (dayWeekIndex + this.tfDays(ev.start, ev.end) <= week.length) {
                dayEventLen = this.tfDays(ev.start, ev.end)
                className = className + ' is-start is-end'
              } else {
                dayEventLen = week.length - dayWeekIndex
                className = className + ' is-start'
              }
              // 如果是周的第一天，切在一个事件的中
            } else if (this.inMiddleDay(ev.start, ev.end, week[0])) {
              if (dayWeekIndex + this.tfDays(week[0], ev.end) <= week.length) {
                dayEventLen = this.tfDays(week[0], ev.end)
                className = className + ' is-end'
              } else {
                dayEventLen = week.length - dayWeekIndex
                className = className + ''
              }
            }
            // 用于记录当天有多少日程在进行
            week.forEach((n) => {
              if (this.weekMiddleEvent(n, ev.start, ev.end)) {
                weekLen[n] = weekLen[n] + 1
              }
            })
            // ev._eY用于与上上周位置对齐
            dayWeekYi = ev._eY || this.getEventY(dayWeekIndex, dayEventLen, weekPoint).yI
            obj._eLen = dayEventLen // event 长度，不能超过一周（7）
            obj._eX = dayWeekIndex // 当天所在周的标（横坐标X）原点（0,0）
            obj._eY = dayWeekYi // 纵坐标Y
            obj.className = className // class名称： is-start is-end
            allLen = allLen + 1
            objList.push(obj)
            let eventPoint = this.getEventPoint(obj._eX, obj._eY, obj._eLen)
            // let eventPoint = this.getEventY(dayWeekIndex, dayEventLen, weekPoint).pointArr // 新点位放入weekPoint
            weekPoint = weekPoint.concat(eventPoint)
            this.copyAsycList[i]._eY = obj._eY
          }
        })
        return {
          objList: objList,
          weekLen: weekLen
        }
      },
      getEventPoint (eX, eY, eLen) {
        let arr = []
        for (let i = 0; i < eLen; i++) {
          // Y坐标不变，X递增
          arr.push(eX + i + ',' + eY)
        }
        return arr
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
      changeYearMonth () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      },
      // 每个月的日期表
      getEachCalendar (cur) {
        this.copyAsycList = this.asycEventList.slice(0)
        var date
        if (cur) {
          date = new Date(cur)
        } else {
          date = new Date()
        }
        this.currentDay = date.getDate()
        this.currentYear = date.getFullYear()
        this.currentMonth = date.getMonth() + 1
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
        let monthDayArr = []
        let copyDayArr = dayArr.slice(0)
        let copyWeekArr = dayArr.slice(0)
        // 计算本周索引
        for (let i = 0; i < 5; i++) {
          let weekArr = copyWeekArr.splice(0, 7)
          let todyStr = this.formatDate(this.tYear, this.tMonth, this.tDay)
          weekArr.forEach((n, j) => {
            if (todyStr === n.dateStr) {
              this.$emit('getCurrentWeekIndex', i)
            }
          })
        }
        for (let i = 0; i < 5; i++) {
          let weekArr = copyDayArr.splice(0, 7)
          // 筛选出周数据
          if (this.timeType === 'week') {
            if (i === this.weekRangIndex) {
              dayArrObj.push({
                dayArr: weekArr,
                weekEventList: this.initEventList(weekArr).objList,
                bgMinHeight: this.getBgMinHeight(this.initEventList(weekArr).objList),
                weekLen: this.initEventList(weekArr).weekLen
              })
            }
          }
          // 月数据
          monthDayArr.push({
            dayArr: weekArr,
            weekEventList: this.initEventList(weekArr).objList,
            bgMinHeight: this.getBgMinHeight(this.initEventList(weekArr).objList),
            weekLen: this.initEventList(weekArr).weekLen
          })
        }
        this.days = this.timeType === 'week' ? dayArrObj : monthDayArr
        this.$emit('getDaysList', monthDayArr)
      },
      getBgMinHeight (list) {
        let h = 3
        list.forEach((n) => {
          h = n._eY + 1 > h ? n._eY + 1 : h
        })
        return h
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
        this.copyAsycList.forEach((n) => {
          let col = Object.assign({ row: 0 }, n)
          if (n.start === item.dateStr) {
            col.tfDays = this.tfDays(n.start, n.end)
            col.row = col.row + col.tfDays
            item.eventList.push(col)
          }
        })
        return item
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
      weekMiddleEvent (weekDay, start, end) {
        let isMiddle = false
        let sTime = new Date(start).getTime()
        let eTime = new Date(end).getTime()
        let mTime = new Date(weekDay).getTime()
        if (eTime >= mTime && mTime >= sTime) {
          isMiddle = true
        }
        return isMiddle
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
      overTips (e, type) {
        this.tipBoxConfig = {
          top: e.offsetY
        }
      },
      updateEvent (event) {
        this.$emit('updateEventShow', event)
      },
      deletEvent (event) {
        this.$emit('deletEventShow', event)
      }
    }
  }
</script>
<style lang="less" scoped>
.event-calender{
  width: 1160px;
  margin: 0 auto;
}
.weeks{
  margin-top: 20px;
  display: flex;
  border: 1px solid #E1E4E7;
  border-left: none;
  border-bottom: none;
}
.week{
  height: 50px;
  line-height: 50px;
  flex: 1;
  text-align: center;
  border-left: 1px solid #E1E4E7;
  background: #f5f8fa;
}
.other-m{
  color: rgba(51,71,91,0.45);
}
.today{
  color: #0077FF;
  background: rgba(0,119,255,0.1);
}
.other-m-bg{
  background: rgb(245, 245, 245);
}
.cell-day{
  text-align: right;
  padding-right: 10px;
  font-size: 16px;
  line-height: 45px;
  cursor: pointer;
  .cell-day-d{
    border-radius: 50%;
    height: 34px;
    line-height: 34px;
    width: 34px;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    user-select: none;
  }
}
.event-container{
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  height: 0;
  .event-item{
    box-sizing: border-box;
    padding-top: 2px;
    position: absolute;
  }
}
.c-container{
  border: 1px solid #eee;
  border-top: none;
  box-sizing: border-box;
}
.event-bg{
  position: relative;
  display: flex;
  .bg-cell{
    position: relative;
    cursor: pointer;
    box-sizing: border-box;
    flex: 1;
    border-top: 1px solid #E1E4E7;
    border-right: 1px solid #E1E4E7;
    &:last-child{
      border-right: none;
    }
    &:hover{
      background: #f2f8ff;
      .tips-container{
        display: block;
      }
    }
    .tips-container{
      display: none;
      height: 0;
    }
  }
}

</style>

