<template>
  <div style="display: inline-block;">
    <el-popover
      ref="popover"
      popper-class="popver-input"
      :visible-arrow="false"
      placement="bottom-start"
      :width="width"
      trigger="click">
       <div>
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkedAll" @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 5px 0;"></div>
        <el-checkbox-group v-model="checkedList" @change="handleCheckedListChange">
          <!--如果需要赋默认子，item需要转JSON string-->
          <el-checkbox v-for="(item, i) in checkGroupList" :label="item" :key="i">
            <span 
              class="color-point"
              :style="{background: item.color}"
              v-if="listType === 'color'"
            ></span>
            {{item.name}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </el-popover>
    <el-input 
      suffix-icon="el-icon-arrow-down"
      :style="{width: width + 'px'}"
      v-model="nameStr"
      :placeholder="placeholder || '筛选'"
      v-popover:popover
      auto-complete="off"
    ></el-input>
  </div>
</template>
<script>
  export default {
    name: 'checkPopverInput',
    data () {
      return {
        nameStr: '',
        checkedAll: false,
        checkedList: [],
        isIndeterminate: false
      }
    },
    props: {
      checkGroupList: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: ''
      },
      listType: {
        type: String,
        default: ''
      },
      width: {
        type: Number,
        default: 200
      }
    },
    methods: {
      handleCheckAllChange (all) {
        this.checkedList = all ? this.checkGroupList : []
        this.isIndeterminate = false
        this.checkChangeCallBack()
      },
      handleCheckedListChange (list) {
        let checkedCount = list.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkGroupList.length
        this.checkedAll = checkedCount === this.checkGroupList.length
        console.log(this.checkedAll)
        this.checkChangeCallBack()
      },
      checkChangeCallBack () {
        let str = []
        this.checkedList.forEach((n) => {
          str.push(n.name)
        })
        this.nameStr = str.join('、')
        this.$emit('checkChange', this.checkedList)
      }
    }
  }
</script>
<style lang="less">
.popver-input.el-popper{
  margin-left: 0;
  box-sizing: border-box;
  .el-checkbox-group{
    margin-left: 20px;
    .el-checkbox{
      display: block;
      height: 26px;
      line-height: 26px;
      .el-checkbox__input{
        line-height: 24px !important;
        vertical-align: top;
      }
    }
    .el-checkbox+.el-checkbox{
      margin-left: 0;
    }
    .el-checkbox__label{
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
  }
  .color-point{
    display: inline-block;
    width: 12px;
    height: 12px;
    line-height: 26px;
    border-radius: 6px;
    vertical-align: middle;
  }
}
</style>

