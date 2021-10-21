// pages/my/my.js
const db =wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xuan_show:false,
    class:[],
    class_name:'请选择班级',
    student:[],
    add_show:false,
    qiandao_value:'',
    qiandao_list:[],
    caozuo_show:false,
    qiandao_id:'',
    new_student:[],

    miandui_show:false,
    mianqian_value:'',
    mianqian_list:[],
    jiezhi_show:false,
    jiezhi_time:'设置',

    minDate: new Date().getTime(),
    jiezhi_haomiao:'',
    mcaozuo_show:false,
    mianqian_id:'',
    mianqian_jianname:'',
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

  },
  //导出记录
 async daochu(){
    let that = this;
    wx.showLoading({
      title: '正在导出',
    })
    let re = await db.collection('mian_qian').doc(that.data.mianqian_id).get();
    console.log(that.data.student)
    wx.cloud.callFunction({
       name:'excel',
       data:{
           jian_name:that.data.mianqian_jianname,
           student:re.data.student,
       },
       success:function(res){
          console.log(res)
              //下载excel文件
               wx.cloud.downloadFile({
                 fileID: res.result.fileID,
                 success: res => { 
                   console.log("文件下载成功",res);
                   wx.hideLoading()
                   that.setData({
                      mcaozuo_show:false,
                   })
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
    //确定截止时间
    jiezhi_confirm(event){
      let that = this;
      if(that.data.jiezhi_time=='设置'){
        let nian = new Date().getFullYear();
        let yue = new Date().getMonth()+1;
        let ri = new Date().getDate();
        let shi = new Date().getHours();
        let fen = new Date().getMinutes();
        that.setData({
            jiezhi_time:nian+'年'+yue+'月'+ri+'日'+shi+'时'+fen+'分',
            jiezhi_show:false,
        })
        return false;
      }
      that.setData({
         jiezhi_haomiao:event.detail,
         jiezhi_show:false,
      })
      
    },
  //关闭选择截止时间的窗口
  jiezhi_cancel(){
    this.setData({
          jiezhi_show:false,
    })
  },
  //选择截止时间
    jiezhi_change(event){
      let that = this;
      console.log(event.detail.getValues())
      let time = event.detail.getValues()
      that.setData({
         jiezhi_time:time[0]+time[1]+time[2]+time[3]+time[4],
      })
      console.log(that.data.jiezhi_time)
    },
    //获取用户输入的签到名称
    mian_onChange(event){
      let that = this;
      console.log(event)
      that.setData({
             mianqian_value:event.detail,
      })
    },
  //关闭输入签到名称的窗口
  mian_cancel(){
    this.setData({
        miandui_show:false,
    })
  },
  //获取面对面签到列表
 async get_mianqian(){
    let that = this;
    let result = await db.collection('mian_qian').where({
      _openid:app.globalData.openid,
    }).orderBy('creat','desc').get()
    if(/ok/g.test(result.errMsg)){
      that.setData({
            mianqian_list:result.data,
      })

    }
  },
  //新建面对面签到名称
 async mian_comfire(){
     let that = this;
     if(that.data.mianqian_value==''){
      wx.showToast({
        title: '签到名称不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.jiezhi_time=='设置'){
      wx.showToast({
        title: '请先选择截止时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({
      title: '正在新建',
    })
    console.log(that.data.mianqian_value)
    let result = await db.collection('mian_qian').where({
        mianqian_name:that.data.mianqian_value,
        _openid:app.globalData.openid,
    }).get()
    console.log(result)
    //签到名称重复
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
         wx.hideLoading()
         wx.showToast({
          title: '签到名称已存在，请更换',
          icon: 'none',
          duration: 2000
        })
        return false;
    }
    //签到名称不重复
    if(result.data.length==0&&/ok/g.test(result.errMsg)){
      
  
      let yue = new Date().getMonth()+1;
      let ri = new Date().getDate();
      let shi = new Date().getHours();
      let fen = new Date().getMinutes();
      let miao = new Date().getSeconds();
      let add_result = await db.collection('mian_qian').add({
        data:{
           creat:new Date().getTime(),
           mianqian_name:that.data.mianqian_value,
           riqi:yue+'-'+ri+'-'+shi+':'+fen+':'+miao,
           student:[],
           jiezhi_haomiao:that.data.jiezhi_haomiao,
           jiezhi_time:that.data.jiezhi_time,
        }
      })
      if(/ok/g.test(add_result.errMsg)){
           that.get_mianqian();
           that.setData({
             miandui_show:false,
             mianqian_value:'',
           })
            wx.hideLoading()
            wx.showToast({
            title: '新建成功',
            icon: 'success',
            duration: 2000
          })
      
      }
    }

  },
  //删除面对面签到记录
 async delete_mianqian(){
    let that = this;
    let result = await db.collection('mian_qian').doc(that.data.mianqian_id).remove() 
    console.log(result)
    if(/ok/g.test(result.errMsg)){
        that.get_mianqian();
        that.setData({
           mianqian_id:'',
           mcaozuo_show:false,
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
  //跳转面对面签到详情
  go_miandui(event){
    let that = this;
    let url = event.currentTarget.dataset.url
    that.setData({
      mcaozuo_show:false,
    })

    wx.navigateTo({
      url: url+'?id='+that.data.mianqian_id,
    })
  
  },
  //关闭选择操作面对面的窗口
  mcaozuo_Close(){
    this.setData({
       mcaozuo_show:false,
    })
  },
    //弹窗选择操作面对面的功能
    mianqian_caozuo(event){
      let that = this;
      that.setData({
             mianqian_id:event.currentTarget.dataset.id,
             mianqian_jianname:event.currentTarget.dataset.mianqian_jianname,
             mcaozuo_show:true,
      })
      console.log(that.data.mianqian_id)
    },
  //删除签到
  async delete_qiandao(){
    let that = this;
    that.setData({
      caozuo_show:false,
    })
    wx.showLoading({
      title: '正在删除',
    })
    let result = await db.collection('qiandao').doc(that.data.qiandao_id).remove()
    if(/ok/g.test(result.errMsg)){
         
         that.get_qiandao();
          wx.hideLoading()
          wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 2000
        })
    }
  },
  //跳转签到
  go(event){
    let that = this;
    let url = event.currentTarget.dataset.url
    wx.navigateTo({
      url: url+'?id='+that.data.qiandao_id,
    })
  },
  //关闭操作窗口
  caozuo_Close(){
    this.setData({
      caozuo_show:false,
    })
  },
  //显示操作
  qiandao_caozuo(event){
    this.setData({
       caozuo_show:true,
       qiandao_id:event.currentTarget.dataset.id,
    })
  },
  //获取签到列表
  async get_qiandao(){
    let that = this;
    let result = await db.collection('qiandao').where({
        class_name:that.data.class_name,
        _openid:app.globalData.openid,
    }).orderBy('creat','desc').get()
    if(/ok/g.test(result.errMsg)){
       that.setData({
            qiandao_list:result.data,
       })
    }
  },
  //获取用户输入的签到名称
  onChange(event){
    let that = this;
    console.log(event)
    that.setData({
           qiandao_value:event.detail,
    })
  },
  //新建签到
  async add_comfire(){
    let that = this;
    if(that.data.qiandao_value==''){
      wx.showToast({
        title: '签到名称不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({
      title: '正在新建',
    })
    console.log(that.data.qiandao_value)
    let result = await db.collection('qiandao').where({
        qiandao_name:that.data.qiandao_value,
        _openid:app.globalData.openid,
    }).get()
    console.log(result)
    //签到名称重复
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
         wx.hideLoading()
         wx.showToast({
          title: '签到名称已存在，请更换',
          icon: 'none',
          duration: 2000
        })
        return false;
    }
    //签到名称不重复
    if(result.data.length==0&&/ok/g.test(result.errMsg)){
      console.log(that.data.student)
      for(let i=0;i<that.data.student.length;i++){
          let obj ={}
          obj.name = that.data.student[i]
          obj.state = '未到'; 
          obj.checked = false;
          that.setData({
            new_student:that.data.new_student.concat(obj)
          })
          console.log(that.data.new_student)
      }
      let yue = new Date().getMonth()+1;
      let ri = new Date().getDate();
      let shi = new Date().getHours();
      let fen = new Date().getMinutes();
      let miao = new Date().getSeconds();
      let add_result = await db.collection('qiandao').add({
        data:{
           creat:new Date().getTime(),
           qiandao_name:that.data.qiandao_value,
           class_name:that.data.class_name,
           riqi:yue+'-'+ri+'-'+shi+':'+fen+':'+miao,
           student:that.data.new_student,
        }
      })
      if(/ok/g.test(add_result.errMsg)){
           that.get_qiandao();
           that.setData({
             add_show:false,
             qiandao_value:'',
           })
            wx.hideLoading()
            wx.showToast({
            title: '新建成功',
            icon: 'success',
            duration: 2000
          })
      
      }
    }

  },
  //关闭新建签到的窗口
  add_cancel(){
    this.setData({
      add_show:false,
    })
  },
  //新建签到
  async add_qiandao(){
    let that = this;
    if(that.data.class_name=='请选择班级'){
      wx.showToast({
        title: '请先选择班级',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    that.setData({
       add_show:true,
    })
  },
  //确认班级
 async class_confirm(event){
    let that = this
    console.log(event)
    that.setData({
       xuan_show:false,
       class_name:event.detail.value,
    })
    //获取学生名单
    let result = await db.collection('class').where({
       class_name:event.detail.value,
       _openid:app.globalData.openid,
    }).get()
    if(result.data.length!=0&&/ok/g.test(result.errMsg)){
        that.setData({
          student:result.data[0].student,
          qiandao_list:[],
        })
        that.get_qiandao();
    }
    console.log(that.data.student)

  },
  //获取班级
  async get_class(){
      let that = this;
      let result = await db.collection('class').where({
         _openid:app.globalData.openid,
      }).limit(20).orderBy('creat','desc').get()
      console.log(result)
      if(result.data.length!=0&&/ok/g.test(result.errMsg)){
        for(let i=0;i<result.data.length;i++){
            that.setData({
               class:that.data.class.concat(result.data[i].class_name)
            })
        }
        console.log(that.data.class)
        if(that.data.class_name=='请选择班级'){
          that.setData({
            class_name:that.data.class[0],
            student:result.data[0].student
          })
          that.get_qiandao();
          console.log(that.data.student)
        }
      }
  },
  //关闭选择班级的窗口
  class_cancel(){
      this.setData({
        xuan_show:false,
      })
  },
  //打卡选择班级的窗口
  xuan_class(){
     this.setData({
       xuan_show:true,
     })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //打开新建面对面签到的窗口
  add_miandui(){
    this.setData({
       miandui_show:true,
    })
  },
  //设置截止时间
  set_jiezhi(){
      this.setData({
        jiezhi_show:true,
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      let that = this;
      that.get_class();
      that.get_mianqian();
      that.setData({
        caozuo_show:false,
        class:[],
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