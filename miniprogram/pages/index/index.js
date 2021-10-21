// pages/index/index.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      tip:'欢迎使用上课点名小程序',
      class_name:'请选择班级',
      class:[],
      xuan_show:false,
      student:[],
      xuan_student:'',
      timer:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_tip();
     
  },
  // dianji(){
  //   wx.navigateTo({
  //     url: '/pages/code_mianqian/code_mianqian?id=fa24ce1a616d9d7800bb70a0296dd29f',
  //   })
  // },
  //开始和停止随机点名
  start(event){
     let that = this;
     let type = event.currentTarget.dataset.type
      if(that.data.timer==''){
            that.data.timer = setInterval(() => {
              let xiabiao = Math.floor(Math.random()*that.data.student.length)
              console.log(xiabiao)
              that.setData({
                xuan_student:that.data.student[xiabiao]
              })
            }, 200);
      }else{
            //清除上一个
            clearInterval(that.data.timer)
            that.setData({
              timer:''
            })
            //再新建一个
            that.data.timer = setInterval(() => {
              let xiabiao = Math.floor(Math.random()*that.data.student.length)
              console.log(xiabiao)
              that.setData({
                xuan_student:that.data.student[xiabiao]
              })
            }, 200);
            console.log('新建了')
      }
  },
  end(){
    let that = this
    clearInterval(that.data.timer)
  },
    //获取存放学生的student数组
  async get_student(){
    let that = this;
    let result = await db.collection('class').where({
      class_name:that.data.class_name,
      _openid:app.globalData.openid,
    }).get()
    console.log(result)
    if(result.data.length!=0){
        that.setData({
           student:that.data.student.concat(result.data[0].student)
        })
    }
  },
     //获取用户选择的班级
     class_confirm(event){
      let that = this;
      console.log(event)
      that.setData({
         class_name:event.detail.value,
         xuan_show:false,
      })
      //获取签到信息
      that.get_student()

    },
    //关闭 班级选择
    class_cancel(){
      this.setData({
        xuan_show:false,
      })
    },
    //打开选择班级窗口
    xuan_class(){
      this.setData({
         xuan_show:true,
      })
    },
  //调用login云函数获取用户的_openid
  async get_openid(){
    let that = this;
    let res = await wx.cloud.callFunction({
        name:'login',
        data:{},
    })
    console.log(res)
    app.globalData.openid = res.result.openid
    that.get_class();
    //因为_openid永远不变，所以我们可以设置缓存
    wx.setStorage({
      key:'openid',
      data:res.result.openid
    })
  },
  //获取通知
  async get_tip(){
      let that = this;
      let result =  await db.collection('tip').limit(1).get()
      console.log(result)
      if(result.data.length!=0){
         that.setData({
            tip:result.data[0].tip
         })
      }
  },
  //获取班级目录
  async get_class(){
    let that = this;
    let result =  await db.collection('class').where({
       _openid:app.globalData.openid,
    }).limit(20).orderBy('creat','desc').get()
    if(result.data.length!=0){
        if(that.data.class_name=='请选择班级'){
          that.setData({
            class_name:result.data[0].class_name,
            student:result.data[0].student,
          })
        }
       if(that.data.class.length==0){
         that.setData({
           class:[],
         })
        for(let i=0;i<result.data.length;i++){
          let name = result.data[i].class_name
          //that.data.class.concat(name)
          that.setData({
           class:that.data.class.concat(name)
          })
        }
        console.log(that.data.class)
       }
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
 onShow: function () {
    let that = this;
    wx.getStorage({
      key:'openid',
      success:function(res){
           app.globalData.openid = res.data
           console.log(app.globalData.openid)
           that.get_class();
      },
      fail(er){
             //云函数获取用户的_openid
             that.get_openid()
      }
    })
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})