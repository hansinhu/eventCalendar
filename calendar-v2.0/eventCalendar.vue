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
          <div class="c-header">
            <div 
              class="c-h-cell"
              v-for="(day, i) in obj.dayArr"
              :class="{'other-m-bg': isOtherMonth(day)}"
              :key="i">
              <span class="cell-day"
                title="新建事件"
                @click="addNewEvent(day)"
                :class="{'other-m': isOtherMonth(day),today: isToday(day)}">{{day.date}}</span>
            </div>
          </div>
          <ul class="event-bg">
            <li 
              class="bg-cell"
              v-for="(day, i) in obj.dayArr"
              @click="addNewEvent(day)"
              :style="{minHeight: (obj.bgMinHeight * layHeight) + 'px'}"
              :class="{'other-m-bg': isOtherMonth(day)}"
              :key="i">
            </li>
          </ul>
          <div style="position: relative;">
            <div class="event-container" :style="{top: '-' + (obj.bgMinHeight * layHeight) + 'px'}">
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
                <div class="event-content" 
                  :class="n.className"
                  :title="n.data.title"
                  :style="{
                    background: n.data.color,
                    height: layHeight - 2 + 'px',
                    lineHeight: layHeight - 2 + 'px'
                  }"
                >
                  <div v-if="n.className.includes('is-start')">
                    <span class="event-text">{{n.data.title}}</span>
                  </div>
                </div>
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
        copyAsycList: []
      }
    },
    props: {
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
      }
    },
    components: {},
    watch: {
      year () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      },
      month () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      },
      timeType () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      },
      asycEventList () {
        this.getEachCalendar(this.formatDate(this.year, this.month, 1))
      }
    },
    filters: {
      localeWeekDay (weekday) {
        // let map = {0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六'}
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
              if (dayWeekIndex + this.tfDays(ev.start, ev.end) <= week.length) {
                dayEventLen = this.tfDays(ev.start, ev.end)
                weekLen[ev.start] = weekLen[ev.start] + this.tfDays(ev.start, ev.end)
                className = className + ' is-start is-end'
              } else {
                dayEventLen = week.length - dayWeekIndex
                weekLen[ev.start] = week.length
                className = className + ' is-start'
              }
              // 如果是周的第一天，切在一个事件的中
            } else if (this.inMiddleDay(ev.start, ev.end, week[0])) {
              if (dayWeekIndex + this.tfDays(week[0], ev.end) <= week.length) {
                dayEventLen = this.tfDays(week[0], ev.end)
                weekLen[week[0]] = weekLen[week[0]] + this.tfDays(week[0], ev.end)
                className = className + ' is-end'
              } else {
                dayEventLen = week.length - dayWeekIndex
                weekLen[ev.start] = week.length
                className = className + ''
              }
            }
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
        return objList
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
        let copyDayArr = dayArr.slice(0)
        for (let i = 0; i < 5; i++) {
          let weekArr = copyDayArr.splice(0, 7)
          // 如果切换成本周，筛选出本周数据
          if (this.timeType === 'week') {
            let todyStr = this.formatDate(this.tYear, this.tMonth, this.tDay)
            weekArr.forEach((n) => {
              if (todyStr === n.dateStr) {
                dayArrObj.push({
                  dayArr: weekArr,
                  weekEventList: this.initEventList(weekArr),
                  bgMinHeight: this.getBgMinHeight(this.initEventList(weekArr))
                })
              }
            })
          } else { // 月数据
            dayArrObj.push({
              dayArr: weekArr,
              weekEventList: this.initEventList(weekArr),
              bgMinHeight: this.getBgMinHeight(this.initEventList(weekArr))
            })
          }
        }
        // console.log(dayArrObj)
        this.days = dayArrObj
      },
      getBgMinHeight (list) {
        let h = 3
        list.forEach((n) => {
          console.log(n)
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
  background: rgb(245, 248, 250);
}
.other-m{
  color: rgba(51,71,91,0.45);
}
.today{
  color: red;
}
.other-m-bg{
  background: rgb(245, 245, 245);
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
    .event-content{
      color: #000;
      cursor: pointer;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      word-break: break-all;
      &.is-start{
        margin-left: 1px;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      &.is-end{
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      .event-text{
        padding-left: 5px;
      }
    }
  }
}
.c-container{
  border: 1px solid #eee;
  border-top: none;
  box-sizing: border-box;
}
.c-header{
  display: flex;
  .c-h-cell{
    height: 45px;
    box-sizing: border-box;
    text-align: right;
    padding-right: 15px;
    flex: 1;
    border-top: 1px solid #E1E4E7;
    border-right: 1px solid #E1E4E7;
    &:last-child{
      border-right: none;
    }
  }
  .cell-day{
    display: inline-block;
    width: 100%;
    font-size: 16px;
    line-height: 45px;
    cursor: pointer;
  }
}
.event-bg{
  position: relative;
  display: flex;
  .bg-cell{
    box-sizing: border-box;
    flex: 1;
    border-top: 1px solid #E1E4E7;
    border-right: 1px solid #E1E4E7;
    &:last-child{
      border-right: none;
    }
  }
}

</style>

