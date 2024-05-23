// 生成唯一uuid,len为长度，radix为进制，例如(8,10)即长度为8,10进制的uuid
export function uuid(len, radix) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    var r;

    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
}

// 剔除obj中值为null和undefined
export const deleteObjEmpty = (obj) => {
  const params = Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
  return params;
};

// 图片地址是否有效(返回true/false)
export function imgUrlEffective(imgUrl) {
  return new Promise(function (resolve, reject) {
    var ImgObj = new Image();
    ImgObj.src = imgUrl;
    ImgObj.onload = function (res) {
      resolve(true);
    };
    ImgObj.onerror = function (err) {
      reject(false);
    };
  });
}
