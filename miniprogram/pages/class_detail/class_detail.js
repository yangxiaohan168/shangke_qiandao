// pages/class_detail/class_detail.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       edit_show:true,
       class_id:'',
       student:[],
       yuan_student:[],
       xuan_arr:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.setData({
        class_id:options.id,
      })
      that.get_student()
  },
  //删除学生
  async delete_student(){
     let that = this;
     wx.showLoading({
       title: '正在删除',
     })
     for(let i=0;i<that.data.xuan_arr.length;i++){
         let one = that.data.xuan_arr[i]
         that.data.yuan_student.splice(one,1)
         that.data.student.splice(one,1)
     }
     //更新数据
     that.setData({
        xuan_arr:that.data.xuan_arr,
        yuan_student:that.data.yuan_student,
        student:that.data.student,
     })
     let result = await db.collection('class').doc(that.data.class_id).update({
        data:{
           student:that.data.yuan_student,
        }
     })
     if(/ok/g.test(result.errMsg)){
         wx.hideLoading()
         wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
         })
         setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
         },1000)
      }else{
         wx.hideLoading()
         wx.showToast({
            title: '删除失败，请重试',
            icon: 'none',
            duration: 2000
         })
      }

  },
  //选择学生
  onChange(event){
     let that = this;
     let xiabiao = event.currentTarget.dataset.index;
     if(that.data.xuan_arr.includes(xiabiao)){
        that.data.student[xiabiao].checked =  false;
        let xia = that.data.xuan_arr.indexOf(xiabiao)
        that.data.xuan_arr.splice(xia,1)
        //更新数据
        that.setData({
          student:that.data.student,
          xuan_arr:that.data.xuan_arr
        })
     }else{
        that.data.student[xiabiao].checked =  true;
        //更新数据
        that.setData({
           xuan_arr:  that.data.xuan_arr.concat(xiabiao),
           student:that.data.student,
        })
     }
     
  },
  //编辑
  edit(){
    this.setData({
       edit_show:false,
    })
  },
  //取消
  cancel_student(){
    this.setData({
      edit_show:true,
   })
  },
   //获取原有的存放学生的数组
   async get_student(){
      let that = this;
      let result = await db.collection('class').doc(that.data.class_id).get();
      console.log(result)
      that.setData({
         yuan_student:that.data.yuan_student.concat(result.data.student)
      })
      for(let i=0;i<result.data.student.length;i++){
          let obj ={}
          obj.name = result.data.student[i]
          obj.checked = false;
          that.setData({
             student:that.data.student.concat(obj)
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