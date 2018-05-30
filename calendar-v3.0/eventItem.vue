<template>
  <div>
    <el-popover
      ref="popover"
      popper-class="popver-event-item"
      :visible-arrow="false"
      v-model="popoverValue"
      placement="bottom-start"
      :width="372"
      trigger="click">
      <div class="top-line" :style="{borderColor: itemData.data.color}"></div>
      <div class="e-popover-body">
        <div class="e-p-customer">
          <div class="e-p-avatar">
            <img :src="itemData.data.avatar || '/static/img/default_avatar.png'">
          </div>
          <div>
            <p class="e-p-c-title">关联客户</p>
            <p class="e-p-c-name">小甜甜</p>
          </div>
        </div>
        <h5>{{itemData.data.title}}</h5>
        <p class="e-p-time">{{formatDate(itemData.start) + '~' + (itemData.end)}}</p>
        <div style="margin-top: 20px;">
          <p class="e-p-user"><label class="label">参与人员：</label><span>Baby、Jone、Lisa</span></p>
          <p class="e-p-user"><label class="label">创&nbsp;&nbsp;建&nbsp;&nbsp;人：</label><span>Sam</span></p>
        </div>
      </div>
      <div class="e-popover-bottom">
        <span class="btn" @click="editEventShow">编辑</span><span @click="deletEventShow" class="btn">删除</span>
      </div>
    </el-popover>
    <div class="event-content" 
      v-popover:popover
      :class="itemData.className"
      :title="itemData.data.title"
      :style="{
        background: itemData.data.color,
        height: layHeight - 2 + 'px',
        lineHeight: layHeight - 2 + 'px'
      }"
    >
      <!--如果是start显示头像；如果是周数据非start显示文字；如果是月数据：开始数据不在本月切是第一周显示文字-->
      <div class="event-co" v-if="itemData.className.includes('is-start')">
        <span class="e-avatar"><img :src="itemData.data.avatar || '/static/img/default_avatar.png'"></span>
        <span class="event-text">{{itemData.data.title}}</span>
      </div>
      <div v-else-if="timeType === 'week'">
        <span class="event-text" style="paddingLeft: 5px;">{{itemData.data.title}}</span>
      </div>
      <div v-else-if="timeType === 'month' && noNowMonth && !weekIndex">
        <span class="event-text" style="paddingLeft: 5px;">{{itemData.data.title}}</span>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        popoverValue: false
      }
    },
    props: {
      itemData: {
        type: Object,
        default: () => {
          return {
            className: '',
            start: '',
            data: {}
          }
        }
      },
      hiddenPopover: {
        default: 0
      },
      layHeight: {
        type: Number,
        default: 0
      },
      nowMonth: {
        type: Number,
        default: 0
      },
      weekIndex: {
        type: Number,
        default: 0
      },
      timeType: {
        default: 'month'
      }
    },
    watch: {
      hiddenPopover () {
        this.popoverValue = false
      }
    },
    computed: {
      // 开始事件不在本月
      noNowMonth () {
        let now = true
        if (this.itemData.start) {
          let startMonth = this.itemData.start.split('-')[1]
          let nM = this.nowMonth >= 10 ? '' + this.nowMonth : '0' + this.nowMonth
          if (startMonth === nM) {
            now = false
          } else {
            now = true
          }
        }
        return now
      }
    },
    methods: {
      formatDate (dateStr) {
        return dateStr.split('-').join('/')
      },
      editEventShow () {
        this.$emit('updateEvent', this.itemData)
      },
      deletEventShow () {
        this.$emit('deletEvent', this.itemData)
      }
    }
  }
</script>
<style lang="less" scoped>
.event-content{
  color: #000;
  cursor: pointer;
  &.is-start{
    margin-left: 1px;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }
  &.is-end{
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
  .event-co{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }
  .event-text{
    padding-left: 25px;
    display: inline-block;
    height: 24px;
    line-height: 24px;
  }
  .e-avatar{
    display: inline-block;
    height: 24px;
    width: 0;
    line-height: 24px;
    vertical-align: top;
    position: relative;
    img{
      width: 22px;
      height: 22px;
      border-radius: 14px;
      border: 2px solid #fff;
      background: #fff;
      position: absolute;
      top: -1px;
      left: -1px;
    }
  }
}
</style>
<style lang="less">
.popver-event-item.el-popper{
  border-radius: 0;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,0.20);
  padding: 0;
  margin: 2px 1px;
  .top-line{
    border-top: 10px solid #eee;
  }
  .e-popover-body{
    padding: 20px 35px;
  }
  .e-p-customer{
    &>div{
      display: inline-block;
      p{
        line-height: 22px;
        margin-left: 15px;
      }
      .e-p-c-title{
        color: #7A8794;
      }
    }
    .e-p-avatar{
      width: 44px;
      height: 44px;
      border-radius: 22px;
      overflow: hidden;
      vertical-align: top;
      img{
        width: 44px;
        height: 44px;
      }
    }
  }
  h5{
    margin: 20px 0;
    line-height: 22px;
    font-size: 16px;
    color: rgba(0,0,0,0.80);
  }
  .e-p-time{
    line-height: 22px;
    font-size: 16px;
    color: rgba(51,71,91,0.80);
  }
  .e-popover-bottom{
    padding: 0 35px 20px 35px;
    line-height: 24px;
    .btn{
      cursor: pointer;
      font-size: 16px;
      color: #0077FF;
      display: inline-block;
      margin-right: 20px;
      user-select: none;
    }
  }
}
</style>

