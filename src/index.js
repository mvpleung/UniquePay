/*
 * @Author: liangzc 
 * @Date: 2018-02-09 
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-03-16 15:23:17
 */
/**
 * @param {Vue} Vue Vue对象
 * @param {Object} options {useSdk: Boolean} 是否使用对应平台的 jssdk
 */
let install = function(Vue, options = {}) {
  if (install.installed) return;
  Vue.$uniquePay = Vue.prototype.$uniquePay = new (require('./UniquePay'))(
    options.useSdk
  );
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
}
module.exports = install;
