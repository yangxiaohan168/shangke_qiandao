// pages/code_qiandao/code_qiandao.js
// 引入地图SDK核心类
var QQMapWX = require('../../util/qqmap-wx-jssdk.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: '填入你的腾讯地图key' // 必填
});
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       shuju:'',
       student_name:'',
       success_show:false,
       qiandao_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
     
      const scene = decodeURIComponent(options.scene);

      that.setData({
         qiandao_id:scene,
      })
      that.get_xinxi(options.scene)
  },
  //获取面对面签到信息
  async get_xinxi(id){
    let that = this;
    let result = await db.collection('qiandao').doc(id).get()
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
          that.setData({
             shuju:result.data
          })
          console.log(result)
          console.log(that.data.shuju)
    }
    if(!/ok/g.test(result.errMsg)){
      wx.showToast({
        title: '没有获取到',
        icon: 'none',
        duration: 2000
      })
      
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
    let cunzai = false
    let xiabiao
    for(let i=0;i<that.data.shuju.student.length;i++){
       if(that.data.shuju.student[i].name==that.data.student_name){
           cunzai = true
           xiabiao = i
       }
    }
    if(!cunzai){
      wx.showToast({
        title: '您还不是该班级学生，无法签到，请联系老师添加',
        icon: 'none',
        duration: 4000
      })
      return false;
    }
    let now = new Date().getTime()
    if(now<that.data.shuju.start_haomiao){
      wx.showToast({
        title: '还没到签到时间哦',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.shuju.student[xiabiao].state!='未到'){
      wx.showToast({
        title: '您已经签到过了，请勿重复签到',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({
      title: '正在签到',
    })
    let jili = await that.jisuan()
    console.log(jili)
    
    if(jili[0]>200){
      wx.hideLoading()
      wx.showToast({
        title: '距离过远，无法签到',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
            // let shijian = new Date(now)
            // let yue = shijian.getMonth()+1;
            // let ri = shijian.getDate();
            // let shi = shijian.getHours();
            // let fen = shijian.getMinutes();
            // let miao = shijian.getSeconds();
            
            let arr = that.data.shuju.student
           
           
            console.log(xiabiao)
            let obj = {}
            if(now>that.data.shuju.end_haomiao){
              obj.state = '迟到'
            }
            if(now<that.data.shuju.end_haomiao){
              obj.state = '已到'
            }
            arr[xiabiao].state = obj.state
            let result = await db.collection('qiandao').doc(that.data.qiandao_id).update({
              data:{
                  student:arr,
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
  jisuan(){
    let that = this;
    console.log(that.data.shuju.qiandao_latitude)
    console.log(that.data.shuju.qiandao_longitude)
   return new Promise(function(resolve, reject){
    qqmapsdk.calculateDistance({
      //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      //from参数不填默认当前地址
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      from: '', //若起点有数据则采用起点坐标，若为空默认当前地址
      to: [{
        latitude: that.data.shuju.qiandao_latitude,
        longitude: that.data.shuju.qiandao_longitude,
      }], //终点坐标
      success: function(res) {//成功后的回调
        console.log(res);
       
        resolve(res);
      },
      fail: function(error) {
        console.error(error);
      }
  });
     
  });


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