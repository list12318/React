import { fabric } from "fabric";

// 大小修改，来自官网方法
export function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
    y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
  return fabric.util.transformPoint(
    { x: x, y: y },
    fabric.util.multiplyTransformMatrices(fabricObject.canvas.viewportTransform, fabricObject.calcTransformMatrix())
  );
}
export function actionHandler(eventData, transform, x, y) {
  var polygon = transform.target,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), "center", "center"),
    polygonBaseSize = getObjectSizeWithStroke(polygon),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
      y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y,
    };
  polygon.points[currentControl.pointIndex] = finalPointPosition;
  return true;
}
export function getObjectSizeWithStroke(object) {
  var stroke = new fabric.Point(object.strokeUniform ? 1 / object.scaleX : 1, object.strokeUniform ? 1 / object.scaleY : 1).multiply(object.strokeWidth);
  return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
}

export function anchorWrapper(anchorIndex, fn) {
  return function (eventData, transform, x, y) {
    var fabricObject = transform.target,
      absolutePoint = fabric.util.transformPoint(
        {
          x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
          y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
        },
        fabricObject.calcTransformMatrix()
      ),
      actionPerformed = fn(eventData, transform, x, y),
      newDim = fabricObject._setPositionDimensions({}),
      polygonBaseSize = getObjectSizeWithStroke(fabricObject),
      newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
      newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;

    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);

    return actionPerformed;
  };
}

// 边界处理，防止拖出画布
export function onMoving(e) {
  let padding = 0; // 内容距离画布的空白宽度，主动设置
  var obj = e.target;
  if (obj.currentHeight > obj.canvas.height - padding * 2 || obj.currentWidth > obj.canvas.width - padding * 2) {
    return;
  }
  obj.setCoords();
  if (obj.getBoundingRect().top < padding || obj.getBoundingRect().left < padding) {
    obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top + padding);
    obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left + padding);
  }
  if (
    obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height - padding ||
    obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width - padding
  ) {
    obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top - padding);
    obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left - padding);
  }
}
