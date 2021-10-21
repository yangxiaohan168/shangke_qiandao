
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       shuju:'',
       student_name:'',
       success_show:false,
       class_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      console.log(options.id)
      that.setData({
         class_id:options.id
      })
      that.get_xinxi(options.id)
  },
  //获取班级信息
  async get_xinxi(id){
    let that = this;
    let result = await db.collection('class').doc(id).get()
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
          that.setData({
             shuju:result.data
          })
          console.log(result)
    }
  },
  //获取用户输入的名字
  onChange(event){
    let that = this;
    that.setData({
       student_name:event.detail,
    })
  },
  //加入
 async jiaru(){
    let that = this
    let arr = that.data.shuju.student;
    if(that.data.student_name==''){
           wx.showToast({
              title: '请先输入需要加入班级的姓名',
              icon: 'none',
              duration: 2000
            })
            return false;
    }

    let cunzai
    for(let i=0;i<that.data.shuju.student.length;i++){
      if(that.data.shuju.student[i]==that.data.student_name){
          cunzai = true
      }
    }
    if(cunzai){
      wx.showToast({
        title: '你已经加入该班级了，请勿重复加入',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    
    wx.showLoading({
      title: '正在加入',
    })
    console.log(arr)
    let result = await db.collection('class').doc(that.data.class_id).update({
      data:{
          student:arr.concat(that.data.student_name),
      }
    })
    if(/ok/g.test(result.errMsg)){
     
      that.setData({
        success_show:true,
      })
       wx.hideLoading()
       wx.showToast({
       title: '加入成功',
       icon: 'success',
       duration: 2000
     })
 
    }else{
      wx.hideLoading()
      wx.showToast({
      title: '加入失败，请重试',
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