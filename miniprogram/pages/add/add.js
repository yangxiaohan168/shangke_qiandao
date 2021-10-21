// pages/add/add.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        add_show:false,
        caozuo_show:false,
        class_value:'',
        class_list:[],
        class_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     
  },
  //删除班级
  async delete_class(){
    let that = this;
    let result = await db.collection('class').doc(that.data.class_id).remove() 
    console.log(result)
    if(/ok/g.test(result.errMsg)){
        that.get_class();
        that.setData({
           class_id:'',
           caozuo_show:false,
        })
        wx.hideLoading()
        wx.showToast({
         title: '删除成功',
         icon: 'success',
         duration: 1000
       })
    }else{
       wx.hideLoading()
       wx.showToast({
         title: '删除失败，请重试',
         icon: 'none',
         duration: 2000
       })
    }
  },
 
  //跳转到相应页面
  go(event){
    let that = this;
    that.setData({
       caozuo_show:false,
    })
    let url = event.currentTarget.dataset.url
    wx.navigateTo({
      url: url+'?id='+that.data.class_id,
    })
  },
  //关闭选择操作班级的窗口
  caozuo_Close(){
    this.setData({
      caozuo_show:false,
    })
  },
  //弹窗选择操作班级的功能
  class_caozuo(event){
    let that = this;
    that.setData({
           class_id:event.currentTarget.dataset.id,
           class_name:event.currentTarget.dataset.name,
           caozuo_show:true,
    })
    console.log(that.data.class_id)
  },
  //获取班级列表
  async get_class(){
    let that = this;
    let result = await db.collection('class').where({
                            _openid:app.globalData.openid,
    }).orderBy('creat','asc').get()
    console.log(result)
    that.setData({
      class_list:result.data
    })
  },
  //获取用户输入的班级名称
  onChange(event){
      let that = this;
      console.log(event)
      that.setData({
         class_value:event.detail,
      })
  },
  //弹出添加班级的窗口
  add_class(){
    this.setData({
       add_show:true,
    })
  },
  //取消添加班级
 async add_cancel(){
    this.setData({
       add_show:false,
    })
 },
 //确定添加班级
  async add_comfire(){
    let that = this;
    that.setData({
      add_show:false,
    })
    wx.showLoading({
      title: '正在添加',
    })
    let chaxun = await db.collection('class').where({
        class_name:that.data.class_value,
        _openid:app.globalData.openid,
    }).get()
   console.log(chaxun)
   if(chaxun.data.length!=0){
        wx.hideLoading()
        wx.showToast({
          title: '班级名称不能一样，请更换',
          icon: 'none',
          duration: 2000
        })
        return false;
   }
    let result = await db.collection('class').add({
       data:{
         class_name: that.data.class_value,
         student:[],
         creat:new Date().getTime(),
       }
    })
    console.log(result)
    if(/ok/g.test(result.errMsg)){
      //重新获取班级列表以达到更新数据
      that.get_class();
      that.setData({
         class_value:'',
      })
      wx.hideLoading()
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }else{
      wx.hideLoading()
      wx.showToast({
        title: '添加失败，请重试',
        icon: 'none',
        duration: 2000
      })
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
    that.get_class();
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
    console.log('haha')
    return {
          title: '邀请你加入' + this.data.class_name + '班级，快来看看吧',
          path: '/pages/jiaru_class/jiaru_class?id=' + this.data.class_id,
    }
  }
})