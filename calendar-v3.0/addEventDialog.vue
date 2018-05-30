<template>
  <el-dialog :title="addConfig.editype === 'update' ? '修改日程' : '新增日程'" class="add-event-dialog" :visible.sync="addConfig.addVisible" @close="cancelAdd">
    <customerSelect 
      :config="addCustomerConfig"
      @cancel="cancelAddCustomer"
      @sureAddCustomer="changeCustomer"
    ></customerSelect>
    <div>
      <el-form :model="addEventForm" ref="addEventForm">
        <div class="form-label">* 日程内容</div>
        <ul class="color-list">
          <li class="color-item" v-for="(cItem, i) in colorList" @click="changeColor(cItem, i)" :key="i">
            <span class="color-border" :style="{
              borderColor: addEventForm.color === cItem.color ? cItem.borderColor : 'transparent'
            }">
              <span class="color-point" :style="{background: cItem.color}">
                <i v-show="addEventForm.color === cItem.color" class="el-icon-check"></i>
              </span>
            </span>
          </li>
        </ul>
        <el-form-item
          prop="title"
          :rules="[{ required: true, message: '日程内容不能为空'}]"
        >
          <el-input
            type="title" 
            placeholder="请输入日程名称"
            v-model="addEventForm.title" 
            auto-complete="off"
            maxlength="200"
          ></el-input>
        </el-form-item>
        <div class="form-label">* 起止日期</div>
        <el-form-item
          prop="seTime"
          :rules="[{ required: true, message: '起始时间不能为空'}]"
        >
          <el-date-picker
            class="e-a-daterange"
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
        <ul class="select-cus">
          <li v-if="addEventForm.customer" class="cus">
            <span @click="deletCustomer" class="cus-delet"><i class="el-icon-minus"></i></span>
            <span class="cus-avatar">
              <img :src="addEventForm.customer.avatar || '/static/img/default_avatar.png'" alt="">
            </span>
            <span class="cus-name">{{addEventForm.customer.name}}</span>
          </li>
          <li v-else class="add-cus" >
            <span  @click="addCustomer" class="add-icon">
              <i class="el-icon-plus"></i>
            </span>
            <span class="add-tip">添加关联客户</span>
          </li>
        </ul>
        <div class="form-label">* 参与人员</div>
        <el-form-item
          prop="user"
          :rules="[{ required: true, message: '参与人员不能为空'}]"
        >
          <el-select
            style="width: 100%;"
            class="e-user-select"
            popper-class="e-user-popper"
            v-model="addEventForm.user"
            multiple
            placeholder="请输入关键词"
          >
            <el-option
              v-for="item in accountList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <div class="footer-right">
          <el-button size="medium" @click="cancelAdd">取 消</el-button>
          <el-button size="medium" :disabled="btnLoading" type="primary" @click="subMit('addEventForm')">{{addConfig.editype === 'update' ? '修 改' : '新 建'}}</el-button>
        </div>
      </div>
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
          color: '',
          seTime: [],
          user: [],
          customer: null
        },
        btnLoading: false,
        selectUser: [],
        customOptions: [],
        addCustomerConfig: {
          visible: false
        }
      }
    },
    components: {
      customerSelect: () => import('./customerSelect')
    },
    props: {
      addConfig: {
        type: Object,
        default: () => {
          return {
            addVisible: false,
            start: '',
            end: '',
            editype: 'add',
            updateItem: null
          }
        }
      },
      colorList: {
        type: Array,
        default: () => []
      },
      accountList: {
        type: Array,
        default: () => []
      }
    },
    watch: {
      'addConfig.addVisible' () {
        if (!this.addConfig.addVisible) {
          this.addEventForm = {
            title: '',
            color: '',
            seTime: [],
            user: [],
            customer: null
          }
          this.btnLoading = false
        }
      }
    },
    mounted () {
      this.initForm()
    },
    methods: {
      initForm () {
        let arr = []
        if (this.addConfig.start && this.addConfig.end) {
          arr = [this.addConfig.start, this.addConfig.end]
        } else if (this.addConfig.start) {
          arr = [this.addConfig.start, this.addConfig.start]
        }
        this.addEventForm.seTime = arr
        if (this.addConfig.editype === 'update') {
          let item = this.addConfig.updateItem
          this.addEventForm.color = item.data.color
          this.addEventForm.title = item.data.title
        } else {
          this.addEventForm.color = this.colorList[0].color // 默认第一个颜色
          // 默认参与人填自己
          let user = window.localStorage.user ? JSON.parse(window.localStorage.user) : ''
          if (user) {
            this.addEventForm.user = [user.userId]
          }
        }
      },
      deletCustomer () {
        this.addEventForm.customer = null
      },
      addCustomer () {
        this.addCustomerConfig.visible = true
      },
      changeCustomer (user) {
        this.addCustomerConfig.visible = false
        this.addEventForm.customer = user
      },
      cancelAddCustomer () {
        this.addCustomerConfig.visible = false
      },
      changeColor (item, i) {
        this.addEventForm.color = item.color
      },
      cancelAdd () {
        this.$emit('cancelAdd')
      },
      // 提交： type : 新增 / 修改
      subMit (formName) {
        console.log(this.addEventForm)
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let data = {
              type: this.addConfig.editype,
              form: this.addEventForm,
              id: this.addConfig.updateItem ? this.addConfig.updateItem.data.id : ''
            }
            this.$emit('addSubmit', data)
            this.btnLoading = true
          } else {
            return false
          }
        })
      }
    }
  }
</script>
<style lang="less" scoped>
.color-list{
  margin-top: 12px;
}
.color-item{
  display: inline-block;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  .color-border{
    cursor: pointer;
    display: inline-block;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid transparent;
  }
  .color-point{
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    text-align: center;
    line-height: 28px;
    color: #fff;
    font-size: 14px;
  }
}
.form-label{
  font-size: 14px;
  color: #33475B;
}
.select-cus{
  padding: 20px 0;
  &::after{
    content: '';
    display: block;
    visibility: hidden;
    height: 0;
    clear: both;
  }
  li{
    float: left;
  }
  .cus{
    position: relative;
    span{
      vertical-align: middle;
    }
    .cus-delet{
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 16px;
      border-radius: 8px;
      text-align: center;
      background: #F44336;
      color: #fff;
      position: absolute;
      top: 0;
      left: 30px;
      cursor: pointer;
      .el-icon-minus{
        font-weight: bold;
        font-size: 12px;
      }
    }
    .cus-avatar{
      display: inline-block;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      overflow: hidden;
      img{
        width: 44px;
        height: 44px;
      }
    }
    .cus-name{
      display: inline-block;
      text-indent: 5px;
      max-width: 360px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
  }
  .add-cus{
    span{
      vertical-align: middle;
    }
    .add-icon{
      cursor: pointer;
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      text-align: center;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(124,152,182,0.05);
      border: 2px dotted #BDCBDA;
    }
    .add-tips{
      text-indent: 5px;
    }
  }
}
</style>
<style lang="less">
.add-event-dialog{
  .el-dialog{
    width: 526px;
    border-radius: 4px;
    .el-dialog__header{
      border-bottom: 2px solid #E1E4E7;
    }
    .el-dialog__body{
      padding: 20px 40px;
    }
    .dialog-footer{
      height: 40px;
      .footer-right{
        float: right;
      }
    }
  }
  .e-a-daterange{
    width: 100%;
    .el-range__close-icon{
      position: absolute;
      right: 5px;
    }
    .el-range__icon{
      line-height: 24px;
    }
  }
  .e-user-select.el-select{
    .el-tag{
      background-color: rgba(0,119,255,0.10);
      color: #33475B;
      .el-tag__close.el-icon-close{
        background-color: rgba(0,119,255, .4);
      }
    }
  }
}
.e-user-popper{
  .popper__arrow{
    display: none;
  }
}
</style>
