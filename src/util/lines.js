// 线段相交判断
export function isIntersect(line1, line2) {
  // 转换成一般式: Ax+By = C
  var a1 = line1.end.y - line1.start.y;
  var b1 = line1.start.x - line1.end.x;
  var c1 = a1 * line1.start.x + b1 * line1.start.y;

  //转换成一般式: Ax+By = C
  var a2 = line2.end.y - line2.start.y;
  var b2 = line2.start.x - line2.end.x;
  var c2 = a2 * line2.start.x + b2 * line2.start.y;

  // 计算交点
  var d = a1 * b2 - a2 * b1;

  // 当d==0时，两线平行
  if (d == 0) {
    return false;
  } else {
    var x = (b2 * c1 - b1 * c2) / d;
    var y = (a1 * c2 - a2 * c1) / d;

    // 检测交点是否在两条线段上
    if (
      (isInBetween(line1.start.x, x, line1.end.x) || isInBetween(line1.start.y, y, line1.end.y)) &&
      (isInBetween(line2.start.x, x, line2.end.x) || isInBetween(line2.start.y, y, line2.end.y))
    ) {
      return true;
    }
  }

  return false;
}
//如果b在a和c之间，返回true
//当a==b或者b==c时排除结果，返回false
const isInBetween = (a, b, c) => {
  // 如果b几乎等于a或c，返回false.为了避免浮点运行时两值几乎相等，但存在相差0.00000...0001的这种情况出现使用下面方式进行避免
  if (Math.abs(a - b) < 0.000001 || Math.abs(b - c) < 0.000001) {
    return false;
  }

  return (a < b && b < c) || (c < b && b < a);
};
// 将点组合为线段
export function convertFormat(data) {
  const segments = data.slice(0, -1).map((point, index) => {
    return {
      start: point,
      end: data[index + 1],
    };
  });
  return segments;
}
