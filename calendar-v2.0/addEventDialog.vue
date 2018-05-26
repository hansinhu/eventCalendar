<template>
  <el-dialog title="新增日程" class="add-event-dialog" :visible.sync="addConfig.addVisible" @close="cancelAdd">
    <div>
      <el-form :model="addEventForm" ref="addEventForm">
        <div class="form-label">日程内容</div>
        <el-form-item
          prop="title"
          :rules="[{ required: true, message: '日程内容不能为空'}]"
        >
          <el-input type="title" v-model="addEventForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <ul class="color-list">
          <li class="color-item" v-for="(color, i) in colorList" :key="i">
            <span>{{color.name}}</span>
          </li>
        </ul>
        <div class="form-label">起始时间</div>
        <el-form-item
          prop="seTime"
          :rules="[{ required: true, message: '起始时间不能为空'}]"
        >
          <el-date-picker
            @change="changeTime"
            v-model="addEventForm.seTime"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <div class="form-label">关联客户</div>
        <el-form-item>
          <el-select
            style="width: 100%;"
            v-model="addEventForm.customer"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading">
            <el-option
              v-for="item in customOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="form-label">参与人员</div>
        <ul class="select-user">
          <li class="user" v-for="(user, i) in selectUser" :key="i"></li>
          <li class="add-user">
            <span class="icon-font">&#xe684;</span>
          </li>
        </ul>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancelAdd">确 定</el-button>
        <el-button @click="cancelAdd">取 消</el-button>
      </span>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: 'addEventDialog',
    data () {
      return {
        addEventForm: {
          title: '',
          seTime: [],
          customer: []
        },
        loading: false,
        selectUser: [],
        customOptions: [],
        list: [],
        states: ['Alabama', 'Alaska', 'Arizona',
          'Arkansas', 'California', 'Colorado',
          'Connecticut', 'Delaware', 'Florida',
          'Georgia', 'Hawaii', 'Idaho', 'Illinois',
          'Indiana', 'Iowa', 'Kansas', 'Kentucky',
          'Louisiana', 'Maine', 'Maryland',
          'Massachusetts', 'Michigan', 'Minnesota',
          'Mississippi', 'Missouri', 'Montana',
          'Nebraska', 'Nevada', 'New Hampshire',
          'New Jersey', 'New Mexico', 'New York',
          'North Carolina', 'North Dakota', 'Ohio',
          'Oklahoma', 'Oregon', 'Pennsylvania',
          'Rhode Island', 'South Carolina',
          'South Dakota', 'Tennessee', 'Texas',
          'Utah', 'Vermont', 'Virginia',
          'Washington', 'West Virginia', 'Wisconsin',
          'Wyoming'
        ]
      }
    },
    props: {
      addConfig: {
        type: Object,
        default: () => {
          return {
            addVisible: false,
            start: '',
            end: ''
          }
        }
      },
      colorList: {
        type: Array,
        default: () => []
      }
    },
    watch: {
      'addConfig.start' () {
        this.initDate()
      }
    },
    mounted () {
      this.initDate()
      this.list = this.states.map(item => {
        return { value: item, label: item }
      })
    },
    methods: {
      initDate () {
        let arr = []
        if (this.addConfig.start && this.addConfig.end) {
          arr = [this.addConfig.start, this.addConfig.end]
        } else if (this.addConfig.start) {
          arr = [this.addConfig.start, this.addConfig.start]
        }
        this.addEventForm.seTime = arr
      },
      changeTime (val) {
        console.log(val)
      },
      cancelAdd () {
        this.$emit('cancelAdd')
      },
      remoteMethod (query) {
        if (query !== '') {
          this.loading = true
          setTimeout(() => {
            this.loading = false
            this.customOptions = this.list.filter(item => {
              return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1
            })
          }, 200)
        } else {
          this.customOptions = []
        }
      }
    }
  }
</script>
<style lang="less" scoped>
.color-item{
  display: inline-block;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 20px;
}
.select-user{
  padding-top: 20px;
  &::after{
    content: '';
    display: block;
    visibility: hidden;
    height: 0;
    clear: both;
  }
  li{
    float: left;
    cursor: pointer;
    width: 40px;
    height: 40px;
  }
  .add-user{
    .icon-font{
      font-size: 32px; 
    }
  }
}
</style>
<style lang="less">
.add-event-dialog{
  .el-dialog{
    width: 680px;
    border-radius: 4px;
  }
}
</style>
