/*
 * 支付聚合
 * @Author: liangzc 
 * @Date: 2018-01-12
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-02-11 15:11:24
 */
class _$UniquePay {
  constructor() {
    if (typeof $globalConfig === 'undefined' || !$globalConfig.navigator) {
      window.$globalConfig = {
        navigator: {
          isWechat: navigator.userAgent.match(/(MicroMessenger)\/([\d\.]+)/i) !== null,
          isAlipay: navigator.userAgent.match(/(AlipayClient)\/([\d\.]+)/i) !== null
        }
      }
    }
    this.init();
  }

  /**
     * 初始化
     */
  init() {
    if ($globalConfig.navigator.isWechat || $globalConfig.navigator.isAlipay) {
      this.loadJS($globalConfig.navigator.isWechat ? '//res.wx.qq.com/open/js/jweixin-1.2.0.js' : '//a.alipayobjects.com/g/component/antbridge/1.1.4/antbridge.min.js');
    }
  }

  /**
     * 加载 js 文件
     * @param {String} path js相对路径 
     */
  loadJS(path) {
    if (!path || path === '') {
      console.error('UniquePay init fail , path : null');
      return;
    }
    let a = document.createElement('script');
    a.src = location.protocol + path;
    a.onload = () => {
      console.log('UniquePay init success !!! ');
    };
    a.onerror = () => {
      console.error('UniquePay init fail , path : ', path);
    };
    let c = document.getElementsByTagName('script')[0];
    c.parentNode.insertBefore(a, c);
  }

  /**
     * 唤起支付
     * @param {Object} options 支付参数，参考各支付平台
     * @param {Object} signatureConfig 仅限微信 jssdk，签名配置信息，参考微信官方 jssdk 文档
     * 
     * @returns {Promise}
     */
  pay(options, signatureConfig) {
    return $globalConfig.navigator.isWechat ? this.wechatPay(options, signatureConfig) : $globalConfig.navigator.isAlipay ? this.aliPay(options) : new Promise((resolve, reject) => { });
  }

  /**
     * 调起微信支付
     * @param {Object} options 微信支付参数，参考微信官方支付文档
     * @{options}  timestamp 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
     * @{options}  nonceStr 支付签名随机串，不长于 32 位
     * @{options}  package 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
     * @{options}  signType 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
     * @{options}  paySi gn 支付签名
     * 
     * @param {Object} signatureConfig 签名配置信息，参考微信官方 jssdk 文档
     * 
     * @returns {Promise}
     */
  wechatPay(options, signatureConfig) {
    return new Promise((resolve, reject) => {
      if (!options || Object.prototype.toString.call(options) !== '[object Object]') {
        reject({ message: '唤起微信支付参数错误，参数[options]：' + JSON.stringify(options) });
        return;
      }
      //唤起支付
      let _wixinPay = () => {
        options.success = res => {
          resolve({
            code: (res.err_msg || '').split(':')[1] || 'ok',
            message: res.errMsg || res.err_desc || ''
          });
        };
        options.cancel = res => {
          reject({
            code: (res.err_msg || '').split(':')[1] || 'cancel',
            message: res.errMsg || res.err_desc || '支付取消'
          });
        };
        options.fail = res => {
          reject({
            code: (res.err_msg || '').split(':')[1] || 'fail',
            message: res.errMsg || res.err_desc || '支付失败'
          });
        };
        wx.chooseWXPay(options);
      };

      if (this.signature !== true && signatureConfig) { //未注入签名数据
        signatureConfig.debug = process.env.NODE_ENV !== 'production';
        signatureConfig.jsApiList = ['checkJsApi', 'chooseWXPay'];
        wx.config(signatureConfig);
        wx.ready(() => {
          this.signature = true;
          // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          _wixinPay();
        });
        wx.error(res => {
          this.signature = false;
          reject({
            code: 'fail',
            message: res.errMsg || res.err_desc || 'jsapi配置失败'
          });
        })
      } else {
        _wixinPay();
      }
    });
  }

  /**
     * 调起支付宝支付
     * @param {Object} options 支付参数（tradeNO/orderStr），参考支付宝官方支付文档
     * @{options} tradeNO 交易号
     * @{options} orderStr 交易字符串
     * 
     * @returns {Promise}
     */
  aliPay(options) {
    return new Promise((resolve, reject) => {
      if (!options || Object.prototype.toString.call(options) !== '[object Object]') {
        reject({ message: '唤起支付宝参数错误，参数[options]：' + JSON.stringify(options) });
        return;
      }
      ap.tradePay(options, result => {
        result.code = result.resultCode;
        switch (result.resultCode) {
          case '9000': //支付成功
            resolve(result);
            break;
          case '8000': //后台获取支付结果超时，暂时未拿到支付结果
          case '6004': //支付过程中网络出错， 暂时未拿到支付结果
            result.message = '支付处理中，请稍后在您的订单中查看';
            reject(result);
            break;
          case '6001': //用户中途取消
          case '99': //用户点击忘记密码快捷界面退出(only iOS since 9.5)
            break;
          default:
            result.message = '支付异常,请关闭页面后重试';
            reject(result);
            break;
        }
      });
    });
  }
}

typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = new _$UniquePay() : window.UniquePay = new _$UniquePay();