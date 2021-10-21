// pages/add_student/add_student.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        class_id:'',
        student_name:'',
        new_student:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       let that = this;
       that.setData({
          class_id:options.id,
       })
       that.get_student();
  },
  //获取原有的存放学生的数组
  async get_student(){
     let that = this;
     let result = await db.collection('class').doc(that.data.class_id).get();
     console.log(result)
     that.setData({
        new_student:that.data.new_student.concat(result.data.student)
     })
  },
  //添加
 async add_name(){
       let that = this;
       wx.showLoading({
         title: '正在添加',
       })
       let add_arr = that.data.student_name.split(' ')
       console.log(add_arr)
       //名字去重
       for(let i = 0 ;i < add_arr.length ; i ++){
         for(let j = 0 ;j < that.data.new_student.lengh;j++){
             if( add_arr[i] == that.data.new_student[j] ){
                 that.data.add_arr.splice(i,1)
             }     
         }
      }
       that.setData({
            new_student:that.data.new_student.concat(add_arr)
       })
      let result = await db.collection('class').doc(that.data.class_id).update({
          data:{
             student:that.data.new_student
          }
       })
       console.log(result)
       if(/ok/g.test(result.errMsg)){
           that.setData({
              student_name:'',
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
  //重置
  clear_name(){
    this.setData({
       student_name:'',
    })
  },
  //获取用户输入的学生姓名
  input_name(event){
    let that = this;
    console.log(event)
    that.setData({
       student_name:event.detail.value,
    })
    console.log(that.data.student_name)
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