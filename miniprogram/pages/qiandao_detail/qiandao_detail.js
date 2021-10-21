// pages/qiandao_detail/qiandao_detail.js

const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
        student:[],
        yuan_student:[],
        dianming_way:1,
        index_arr:[],
        qiandao_id:'',
        gundong:false,
        start_time:'设置',
        start_haomiao:'',
        end_time:'设置',
        end_haomiao:'',
        qiandao_location:'设置',
        qiandao_latitude:'',
        qiandao_longitude:'',

        start_show:false,
        end_show:false,
        jian_name:'',
        

        minDate: new Date().getTime(),
        formatter(type, value) {
          if (type === 'year') {
            return `${value}年`;
          }
          if (type === 'month') {
            return `${value}月`;
          }
          if (type === 'day') {
            return `${value}日`;
          }
          if (type === 'hour') {
            return `${value}时`;
          }
          if (type === 'minute') {
            return `${value}分`;
          }
          return value;
        },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     let that = this;
     let id = options.id
     that.setData({
        qiandao_id:options.id,
     })
     that.get_qiandao(id)
  },
  //导出记录
  daochu(){
     let that = this;
     wx.showLoading({
       title: '正在导出',
     })
     console.log(that.data.student)
     wx.cloud.callFunction({
        name:'excel',
        data:{
            jian_name:that.data.jian_name,
            student:that.data.student,
        },
        success:function(res){
           console.log(res)
               //下载excel文件
                wx.cloud.downloadFile({
                  fileID: res.result.fileID,
                  success: res => { 
                    console.log("文件下载成功",res);
                    wx.hideLoading()
                    //打开文件
                    const filePath = res.tempFilePath
                    wx.showModal({
                      title: '提示',
                      content: '下载成功，请打开另存',
                      showCancel:false,
                      confirmText:'前往另存',
                      success (res) {
                        if (res.confirm) {
                          console.log('用户点击确定')
                          wx.openDocument({
                            filePath: filePath,
                            success: function (re) {
                              console.log('文件打开成功',re)
                            }
                          })
                        } else if (res.cancel) {
                          console.log('用户点击取消')
                        }
                      }
                    })

                  }
                })
        },
        fail(er){
          console.log(er)
          wx.hideLoading()
        }
     })
  },
  //生成二维码
  chang_code(){
    let that = this;
    if(that.data.start_time=='设置'){
          wx.showToast({
            title: '请先设置开始时间',
            icon: 'none',
            duration: 1000
          })
          return false;
    }
    if(that.data.end_time=='设置'){
      wx.showToast({
        title: '请先设置结束时间',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if(that.data.qiandao_location=='设置'){
      wx.showToast({
        title: '请先设置签到位置',
        icon: 'none',
        duration: 1000
      })
      return false;
     }
    wx.showLoading({
      title: '正在生成',
    })
    //调用云函数获取云函数生成的小程序码
    wx.cloud.callFunction({
      name:'get_code',
      data:{
         qiandao_id:that.data.qiandao_id,
         page:'pages/code_qiandao/code_qiandao',
      },
      success:function(res){
            console.log(res)
            db.collection('qiandao').doc(that.data.qiandao_id).update({
              data:{
                   start_time:that.data.start_time,
                   start_haomiao:that.data.start_haomiao,
                   end_time:that.data.end_time,
                   end_haomiao:that.data.end_haomiao,
                   qiandao_location:that.data.qiandao_location,
                   qiandao_latitude:that.data.qiandao_latitude,
                   qiandao_longitude:that.data.qiandao_longitude,
                   code:res.result,
              },
              success:function(re){
                   console.log(res.result)
                   wx.hideLoading()
                   wx.previewImage({
                    urls: [res.result] // 需要预览的图片http链接列表
                  })
              },
              fail(e){
                wx.hideLoading()
                wx.showToast({
                  title: '生成失败，请重试',
                  icon: 'none',
                  duration: 2000
                })
              }
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
  //选择签到位置
    set_location:function(){
      let that = this;
      wx.chooseLocation({
                success:function(res){
                   console.log(res)
                   that.setData({
                       qiandao_location:res.name,
                       qiandao_latitude:res.latitude,
                       qiandao_longitude:res.longitude,
                   })
                }
      })
    },
  //取消选择开始时间
  start_cancel(){
    this.setData({
       start_show:false,
    })
  },
  //取消选择结束时间
  end_cancel(){
    this.setData({
       end_show:false,
    })
  },
  //获取开始时间
  start_change(event){
    let that = this;
    console.log(event.detail.getValues())
    let time = event.detail.getValues()
    that.setData({
       start_time:time[0]+'/'+time[1]+'/'+time[2]+' '+time[3]+':'+time[4],
    })
  },
  //获取结束时间
  end_change(event){
    let that = this;
    console.log(event.detail.getValues())
    let time = event.detail.getValues()
    that.setData({
       end_time:time[0]+time[1]+time[2]+time[3]+time[4],
    })
    console.log(that.data.end_time)
  },
  //确定开始时间
  start_confirm(event){
    let that = this;
    if(that.data.start_time=='设置'){
      let nian = new Date().getFullYear();
      let yue = new Date().getMonth()+1;
      let ri = new Date().getDate();
      let shi = new Date().getHours();
      let fen = new Date().getMinutes();
      that.setData({
          start_time:nian+'年'+yue+'月'+ri+'日'+shi+'时'+fen+'分',
          start_show:false,
      })
      return false;
    }
    that.setData({
       start_haomiao:event.detail,
       start_show:false,
    })
    
  },
   //确定结束时间
   end_confirm(event){
    let that = this;
    if(that.data.end_time=='设置'){
      let nian = new Date().getFullYear();
      let yue = new Date().getMonth()+1;
      let ri = new Date().getDate();
      let shi = new Date().getHours();
      let fen = new Date().getMinutes();
      that.setData({
          end_time:nian+'年'+yue+'月'+ri+'日'+shi+'时'+fen+'分',
          end_show:false,
      })
      return false;
    }
    that.setData({
       end_haomiao:event.detail,
       end_show:false,
    })
  },
   //弹窗选择结束时间
   set_end(){
    this.setData({
       end_show:true,
       start_show:false,
    })
  },
  //弹窗选择开始时间
  set_start(){
    this.setData({
       start_show:true,
       end_show:false,
    })
  },
  //修改状态
  async caozuo_state(event){
    let that = this;
    if(that.data.index_arr.length==0){
      wx.showToast({
        title: '请先选择需要操作的姓名',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    let state = event.currentTarget.dataset.text
    console.log(state)
    for(let i=0;i<that.data.index_arr.length;i++){
        let xiabiao = that.data.index_arr[i]; 
        that.data.student[xiabiao].state = state;
        
    }
    for(let i=0;i<that.data.student.length;i++){
        //改为没有选中
        that.data.student[i].checked = false;
        that.data.yuan_student[i].checked = false;
    }
    that.setData({
       student:that.data.student,
       yuan_student:that.data.yuan_student,
       index_arr:[],
    })
    console.log(that.data.index_arr)
    console.log(that.data.yuan_student)
    let result = await db.collection('qiandao').doc(that.data.qiandao_id).update({
      data:{
        student:that.data.yuan_student,
      }
    })
    if(/ok/g.test(result.errMsg)){
        wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 1000
      })
 
    }

  },
  //选择
  xuan(event){
    let that = this;
    let index = event.currentTarget.dataset.index
    console.log(that.data.student[index].checked)
    if(that.data.student[index].checked){
          console.log('lian')
            that.data.student[index].checked = false,
            that.setData({
              student:that.data.student
            })
            //去除下标
            let xiabiao = that.data.index_arr.includes(index);
            let xia = that.data.index_arr.indexOf(index);
            console.log(xiabiao)
            if(xiabiao){
              that.data.index_arr.splice(xia,1)
              that.setData({
                index_arr:that.data.index_arr
              })
              console.log(that.data.index_arr)
            }
            console.log(that.data.index_arr.length)
    }else{
          console.log('不亮变亮')
          that.data.student[index].checked = true,
          that.setData({
            student:that.data.student
          })
          let xiabiao = that.data.index_arr.includes(index);
          console.log(xiabiao)
          //增加下标
          if(!xiabiao){
            that.setData({
              index_arr:that.data.index_arr.concat(index)
            })
            console.log(that.data.index_arr)
          }
    }
   
  },
  //更改点名方式
  gengai(event){
    let that = this
    console.log(event)
    that.setData({
        dianming_way:event.currentTarget.dataset.id,
    })
    console.log(that.data.dianming_way)
  },
  //获取签到记录的详细信息
 async get_qiandao(id){
     let that = this;
     let result = await db.collection('qiandao').doc(id).get()
     console.log(result)
     that.setData({
      yuan_student:result.data.student,
      student:result.data.student,
    })
     if(result.data.length!=0&&/ok/g.test(result.errMsg)){
          wx.setNavigationBarTitle({
            title: result.data.qiandao_name+'详情'
          })
          that.setData({
              jian_name:result.data.qiandao_name
          })
     }
     console.log(that.data.student)
    console.log(that.data.yuan_student)

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