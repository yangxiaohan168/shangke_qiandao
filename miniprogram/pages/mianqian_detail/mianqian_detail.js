// pages/mianqian_detail/mianqian_detail.js
const db =wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
       mianqian_id:'',
       student:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       let that = this;
       that.setData({
         mianqian_id:options.id
       })
       that.get_student(options.id);
       console.log(options)
  },
   //生成二维码
   chang_code(){
    let that = this;

    wx.showLoading({
      title: '正在生成',
    })
    //调用云函数获取云函数生成的小程序码
    wx.cloud.callFunction({
      name:'get_code',
      data:{
         qiandao_id:that.data.mianqian_id,
         page:'pages/code_mianqian/code_mianqian',
      },
      success:function(res){
            console.log(res)
            wx.hideLoading()
            wx.previewImage({
               urls: [res.result] // 需要预览的图片http链接列表
            })
      },
      fail(er){
        console.log(er)
        wx.hideLoading()
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //获取面对面签到记录
  async get_student(id){
    let that = this;
    console.log(id)
    let result = await db.collection('mian_qian').doc(id).get()
    console.log(result)
    that.setData({
         student:result.data.student,
   })
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
         wx.setNavigationBarTitle({
           title: result.data.mianqian_name+'详情'
         })
    }
    console.log(that.data.student)

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