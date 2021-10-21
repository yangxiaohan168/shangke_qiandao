// pages/code_mianqian/code_mianqian.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       shuju:'',
       student_name:'',
       success_show:false,
       mianqian_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      const scene = decodeURIComponent(options.scene);
      console.log(scene)
      that.setData({
         mianqian_id:scene
      })
      that.get_xinxi(options.scene)
  },
  //获取面对面签到信息
  async get_xinxi(id){
    let that = this;
    let result = await db.collection('mian_qian').doc(id).get()
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
          that.setData({
             shuju:result.data
          })
          console.log(result)
    }
  },
  //获取用户输入的签到名字
  onChange(event){
    let that = this;
    that.setData({
       student_name:event.detail,
    })
  },
  //点击签到
 async qiandao(){
    let that = this
    if(that.data.student_name==''){
           wx.showToast({
              title: '请先输入需要签到的姓名',
              icon: 'none',
              duration: 2000
            })
            return false;
    }

    let cunzai
    for(let i=0;i<that.data.shuju.student.length;i++){
      if(that.data.shuju.student[i].name==that.data.student_name){
          cunzai = true
      }
    }
    if(cunzai){
      wx.showToast({
        title: '你已经签到过了，请勿重复签到',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    wx.showLoading({
      title: '正在签到',
    })
    
    let now = new Date().getTime()
    
            let shijian = new Date(now)
            let yue = shijian.getMonth()+1;
            let ri = shijian.getDate();
            let shi = shijian.getHours();
            let fen = shijian.getMinutes();
            let miao = shijian.getSeconds();

            let arr = that.data.shuju.student
            let obj = {}
            obj.name = that.data.student_name
            obj.qiandao_time = yue+'-'+ri+'-'+shi+':'+fen+':'+miao
            if(now>that.data.shuju.jiezhi_haomiao){
                obj.state = '迟到'
              
            }
            if(now<that.data.shuju.jiezhi_haomiao){
               obj.state = '已到'
               
            }
            
            
            let result = await db.collection('mian_qian').doc(that.data.mianqian_id).update({
              data:{
                  student:arr.concat(obj),
                  creat:now,
              }
            })
            if(/ok/g.test(result.errMsg)){
             
              that.setData({
                success_show:true,
              })
               wx.hideLoading()
               wx.showToast({
               title: '签到成功',
               icon: 'success',
               duration: 2000
             })
         
            }else{
              wx.hideLoading()
              wx.showToast({
              title: '签到失败，请重试',
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