# UniquePay
微信支付、支付宝支付聚合SDK，支持内置对象调用、jsSdk 调用

### install 

```
npm install unique-pay
```

#### npm

```js
import uniquePay from 'unique-pay';
Vue.use(uniquePay,{
    useSdk: false //是否使用各自平台 jssdk
});
```

#### script

> 默认挂载到 window.UniquePay

- 非jssdk版本

```js
<script src="path/unique-pay/src/UniquePay.js"></script>

```

- jssdk版本(增加 "usesdk" 屬性)

```js
<script src="path/unique-pay/src/UniquePay.js" usesdk></script>

```

### use
```vue
<template>
   <div class="input-box clearFix">
	<button v-on:click="pay">测试支付</button>
   </div>
</template>

<script>
    export default {
        name: 'app',
        data () {
          return {
            params: {} //各支付平台参数
          }
        },
        methods:{
          pay() {
            this.$uniquePay
                .pay(this.params)
                .then(resp => {
                  console.log(resp);
                })
                .catch(err => {
                  console.log(err);
                })
          }
        }
    }
</script>

```

```html
仅当 script 标签引入时使用
<body>
   <body>
		<button onclick="pay()">pay</button>
	</body>
	<script type="text/javascript" src="js/UniquePay.js"></script>
	<script>
		function pay() {
			//初始化SDK
			UniquePay.initSdk({
				"appId": "",
				"timeStamp": "",
				"nonceStr": "",
				"signature": "",
				"jsApiList": ["chooseWXPay"]
			})
			window.UniquePay.pay({
				"appId": "",
				"timeStamp": "",
				"nonceStr": "",
				"signType": "",
				"paySign": "",
				"package": ""
			}).then(res => console.log(res));
		}
	</script>
</body>
```

### 配置说明
```js
{
    useSdk:Bool //是否使用各自平台 jssdk，为 true 时，自动识别当前调用环境（微信/支付宝）注入支付平台jssdk，默认为 false（调用内置桥接对象）
}
```

### 方法说明

#### initSdk

>初始化SDK(仅用于微信SDK模式签名)

(void) this.$uniquePay.initSdk(signatureConfig /**微信权限验证配置**/)  

#### pay

>自动识别当前调用环境，执行对应支付函数

(Promise) this.$uniquePay.pay(params)  

(Promise) this.$uniquePay.pay(params, signatureConfig /**微信权限验证配置，initSdk后不需要传递**/)  

#### wechatPay(非SDK模式)

>手动调用微信支付桥接对象，内部调用 WeixinJSBridge.invoke('getBrandWCPayRequest')

(Promise) this.$uniquePay.wechatPay(params)  

#### wechatPay(SDK模式)

>手动调用微信支付jsapi，内部调用 wx.chooseWXPay(params)

(Promise) this.$uniquePay.wechatPay(params, signatureConfig /**微信权限验证配置，initSdk后不需要传递**/)  

#### aliPay(非SDK模式)

>非SDK模式:内部调用 AlipayJSBridge.call('tradePay')
>SDK模式:内部调用 ap.tradePay(options)

(Promise) this.$uniquePay.aliPay(params) 


###  参数说明

#### 微信

[支付参数](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_7&index=6)

[权限验证配置](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)

#### 支付宝

[支付参数](https://myjsapi.alipay.com/jsapi/native/trade-pay.html)


###  回调说明

```js
{
    code: '',  //微信平台回调['ok'|'cancel'|'fail']，支付宝平台请参考官方文档 resultCode
    message: '', //回调消息
    ...          //支付平台返回的其他参数
}
```

##### License
-------

[LICENSE](https://github.com/mvpleung/UniquePay/blob/master/LICENSE)
