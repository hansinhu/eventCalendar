<template>
  <el-dialog
    title="添加关联客户"
    class="s-customer-dialog"
    :visible.sync="config.visible"
    :append-to-body="true"
    @close="cancelAdd"
  >
    <div>
      <div style="padding: 0 15px;">
        <el-input
          @keyup.enter.native="searchCustomer"
          placeholder="客户昵称、电子邮件、社交信息"
          v-model="keyWords">
          <i slot="suffix" @click="searchCustomer" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
      <div class="content" v-loading="allLoading" v-if="listType === 'all'">
        <div class="all-user">
          <ul class="s-code">
            <li 
              v-for="(code, i) in codeList"
              @click="sliderList(code)"
              :key="i"
              :class="{'active': code === activeCode}"
            >{{code}}</li>
          </ul>
          <div ref="user-list" @scroll="userListScroll($event)" class="user-list">
            <ul ref="s-user" class="s-user">
              <li 
                v-for="(group, i) in userGroupList"
                v-if="group.list && group.list.length"
                :key="i"
              >
                <p class="group-title">{{group.code}}</p>
                <ul>
                  <li class="user-item" 
                    v-for="(user, j) in group.list"
                    @click="selectUser(user)"
                    @dblclick="doubleSelectUser(user)"
                    :class="{'active':selectUserId === user.id}"
                    :key="j">
                    <span>{{user.name}}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="content" v-loading="searchLoading" v-if="listType === 'search'">
        <div class="search-content">
          <div class="user-list">
              <div v-if="searchPersonList.length">
                <p class="search-title">搜索结果</p>
                <ul>
                  <li class="user-item" 
                    v-for="(user, j) in searchPersonList"
                    :class="{'active':selectUserId === user.id}"
                    @click="selectUser(user)"
                    @dblclick="doubleSelectUser(user)"
                    :key="j">
                    <span>{{user.name}}</span>
                  </li>
                </ul>
              </div>
              <div v-else-if="!searchLoading">
                <p class="no-search">{{'没有搜索到“' + keyWords + '”相关的联系人'}}</p>
              </div>
            </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="footer-right">
        <el-button size="small" @click="cancelAdd">取 消</el-button>
        <el-button size="small" type="primary" @click="sureAdd">确定</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
  // import userList from './mockuser'
  import {mapGetters, mapActions} from 'vuex'
  export default {
    name: 'selectCustomer',
    data () {
      return {
        keyWords: '',
        userGroupList: [],
        userGroupObj: {},
        codeList: [],
        activeCode: 'A',
        selectUserId: '',
        selectUserObj: null,
        listType: 'all',
        allLoading: false,
        searchLoading: false
      }
    },
    props: {
      config: {
        type: Object,
        default: () => {
          return {
            visible: false
          }
        }
      }
    },
    watch: {
      keyWords () {
        if (!this.keyWords) {
          this.listType = 'all'
          this.$store.commit('COMMIT_SEARCHPERSON_LIST', [])
        }
      }
    },
    computed: {
      ...mapGetters([ 'allPersonList', 'searchPersonList' ])
    },
    beforeMount () {
      this.initUserGroup()
    },
    mounted () {
      this.getUserList()
    },
    methods: {
      ...mapActions([ 'GETALLPERSONLIST', 'SEARCHPERSONLIST' ]),
      initUserGroup () {
        let arr = []
        let code = []
        let obj = {}
        for (let i = 65; i <= 90; i++) { // A-Z
          let k = String.fromCharCode(i)
          obj[k] = []
          code.push(k)
          arr.push({
            'code': k,
            'list': [],
            'height': 0
          })
        }
        obj['#'] = []
        code.push('#')
        arr.push({
          'code': '#',
          'list': [],
          'height': 0
        })
        this.userGroupObj = obj
        this.codeList = code
        this.userGroupList = arr
      },
      getUserList () {
        if (this.allPersonList.length) {
          this.initAllUserList()
        } else {
          this.allLoading = true
          this.GETALLPERSONLIST().then((list) => {
            this.allLoading = false
            this.initAllUserList()
          })
        }
      },
      initAllUserList () {
        this.allPersonList.forEach((n, i) => {
          let nameCode = n.name.substring(0, 1).toUpperCase()
          if (this.codeList.indexOf(nameCode) !== -1) {
            this.userGroupObj[nameCode].push(n)
          } else {
            this.userGroupObj['#'].push(n)
          }
        })
        for (let key in this.userGroupObj) {
          let index = this.codeList.indexOf(key)
          this.userGroupList[index].height = this.getGroupItemHeight(key)
          this.userGroupList[index].list = this.userGroupObj[key]
        }
      },
      searchCustomer () {
        // s
        if (!this.keyWords) {
          return
          // this.$store.commit('COMMIT_SEARCHPERSON_LIST', [])
        } else {
          this.listType = 'search'
          this.searchLoading = true
          this.SEARCHPERSONLIST({keyWords: this.keyWords}).then((res) => {
            this.searchLoading = false
            // s
          })
        }
      },
      getGroupItemHeight (k) {
        let groupNum = 0
        let itemNum = 0
        for (let key in this.userGroupObj) {
          if (key === k) break
          if (this.userGroupObj[key] && this.userGroupObj[key].length) {
            groupNum += 1
            this.userGroupObj[key].forEach((n, i) => {
              itemNum += 1
            })
          }
        }
        return groupNum * 24 + itemNum * 36
      },
      userListScroll (e) {
        let scrollTop = e.target.scrollTop + 100
        this.userGroupList.forEach((n, i) => {
          if (!n.height && scrollTop < this.userGroupList[i + 1].height) {
            this.activeCode = n.code
          } else if (n.height && n.height < scrollTop && this.userGroupList[i + 1] && this.userGroupList[i + 1].height > scrollTop) {
            this.activeCode = n.code
          } else if (!this.userGroupList[i + 1] && n.height < scrollTop) {
            this.activeCode = n.code
          }
        })
      },
      sliderList (code) {
        let height = 0
        this.userGroupList.forEach((n) => {
          if (code === n.code) {
            height = n.height
          }
        })
        this.activeCode = code
        this.$refs['user-list'].scrollTop = height
      },
      selectUser (user) {
        this.selectUserId = user.id
        this.selectUserObj = user
      },
      doubleSelectUser (user) {
        this.selectUserId = user.id
        this.selectUserObj = user
        this.$emit('sureAddCustomer', this.selectUserObj)
      },
      cancelAdd () {
        this.$emit('cancel')
      },
      sureAdd () {
        this.$emit('sureAddCustomer', this.selectUserObj)
      }
    }
  }
</script>
<style lang="less" scoped>
.all-user{
  position: relative;
  margin-top: 10px;
}
.user-list{
  height: 440px;
  overflow: auto;
}
.search-title{
  font-size:14px;
  color:rgba(122,135,148,1);
  line-height: 36px;
  text-indent: 24px;
}
.no-search{
  line-height: 200px;
  font-size:14px;
  text-align: center;
  color:rgba(163,172,181,1);
}
.group-title{
  line-height: 24px;
  background: #F5F6F7;
  text-indent: 24px;
}
.user-item{
  cursor: pointer;
  line-height: 36px;
  padding-right: 24px;
  text-indent: 24px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  word-break: break-all;
  user-select: none;
  &:hover{
    background: rgba(0,119,255,0.05);
  }
  &.active{
    background: rgba(0,119,255,0.05);
  }
}
.s-code{
  float: right;
  position: absolute;
  top: 0;
  right: 5px;
  width: 24px;
  height: 440px;
  text-align: center;
  font-size: 12px;
  background: #fff;
  li{
    cursor: pointer;
    line-height: 16px;
    color: #A3ACB5;
    &.active{
      color: #33475B;
    }
  }
}
</style>
<style lang="less">
.s-customer-dialog{
  .el-dialog{
    width: 330px;
    border-radius: 4px;
    .el-dialog__header{
      border-bottom: 2px solid #E1E4E7;
    }
    .el-dialog__body{
      padding: 20px 0 0 0;
    }
    .el-dialog__footer{
      padding: 10px;
      border-top: 2px solid #E1E4E7;
      .dialog-footer{
        height: 36px;
        .footer-right{
          float: right;
        }
      }
    }
  }
}
</style>
