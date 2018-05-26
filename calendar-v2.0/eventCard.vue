<template>
  <span></span>
</template>

<script>
  export default {
    name: 'event-card',
    props: {
      cardConfig: {
        data: {
          type: Object
        },
        visible: {
          type: Boolean,
          default: false
        },
        eClick: null
      }
    },
    watch: {
      'cardConfig.eClick' () {
        console.log(this.cardConfig.eClick)
      },
      'cardConfig.visible' () {
        console.log(this.cardConfig.visible)
        this.initCard()
      },
      cardConfig () {
        this.initCard()
      }
    },
    mounted () {
      this.initCard()
      window.addEventListener('click', this.clickOtherClose, true)
    },
    methods: {
      initCard () {
        if (this.cardConfig.visible) {
          let body = document.body
          let card = body.querySelector('.calendar-card')
          let left = this.cardConfig.eClick.clientX + 10
          let top = this.cardConfig.eClick.clientY + window.scrollY + 10
          if (card) {
            card.style.left = left + 'px'
            card.style.top = top + 'px'
            card.style.display = 'block'
            card.innerHTML = this.createHtml(this.cardConfig.data, left, top)
          } else {
            let cardBox = document.createElement('div')
            cardBox.className = 'calendar-card'
            cardBox.style.left = left + 'px'
            cardBox.style.top = top + 'px'
            cardBox.style.display = 'block'
            cardBox.innerHTML = this.createHtml(this.cardConfig.data, left, top)
            body.appendChild(cardBox)
          }
        } else {
          let body = document.body
          let card = body.querySelector('.calendar-card')
          if (card) {
            card.style.display = 'none'
          }
        }
      },
      createHtml (data, top = 0, left = 0) {
        let tmpl = `<div class="card-body">
            <div class="card-body-header">
              <i class="m-icon icon-calendar normal-text calendar-icon"></i>
              <span class="text-span normal-text">5月7日  — 5月8日 </span>
            </div>
            <div class="card-body-content">
              <div class="type-btn">
                <input type="checkbox" class="calendar-done">
                <span class="type-circle" style="background: rgb(255, 51, 51);"></span>
              </div>
              <div class="title-text">
                <span class="normal-text">多跟进几次</span>
              </div>
            </div>
            <div class="card-body-attendents">
                <ul>
                  <li>关联客户：<a target="_blank" class="c-link company-link">comp7</a></li>
                  <li>参与人：Dick;Kula</li>
                  <li>创建人：Dick</li>
                </ul>
            </div>
          </div>
          <div class="card-footer">
            <a class="e-edit c-link">编辑</a>
            <a class="e-delete c-link">删除</a>
          </div>`
        return tmpl
      },
      clickOtherClose (e) {
        let tag = true
        e.path.forEach(element => {
          if (element.className && (element.className.includes('fc-day-grid-event') || element.className.includes('calendar-card'))) {
            tag = false
          }
        })
        if (tag) {
          this.$emit('handleClose', 'winClose')
        }
      }
    }
  }
</script>
<style lang="less">
.calendar-card {
  position: absolute;
  z-index: 99;
  width: 360px;
  background: #fff;
  -webkit-box-shadow: 2px 2px 5px #aaa;
  box-shadow: 2px 2px 5px #aaa;
  .card-body {
    padding: 16px;
    border-bottom: 1px solid #ccc;
  }
  .card-body-header {
    margin-bottom: 10px;
  }
  .card-body-content {
    display: flex;
    .type-btn {
      flex-shrink: 0;
    }
    .calendar-done {
      vertical-align: baseline;
    }
    .type-circle {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .title-text {
      padding-left: 10px;
      flex: 1;
    }
    .title-text span {
      display: block;
      max-width: 300px;
      word-break: normal;
      word-wrap: break-word;
    }
  }
  .card-body-attendents {
    margin: 10px 0 0 19px;
    margin-top: 10px;
    font-size: 12px;
    color: #949494;
  }
  .card-footer {
    padding: 8px;
    text-align: right;
    background: #f6f6f6;
    .c-link {
      margin-right: 10px;
      vertical-align: middle;
      color: #188ae8;
      cursor: pointer;
    }
  }
}
</style>

