import React, { useRef, useEffect, useCallback } from 'react';
import { geoOrthographic } from "d3-geo";
import { elementToSVG } from "dom-to-svg";

// 图像放大倍数，用于消除间隙（暂时）
const zoom = 1;

export default function CanvasBall2({children}) {
  const elementRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // 投影方法（将平面投影为球体）
  const projectionIn = useCallback((width, height,rawImgData, time) => {
    // 长 * 宽 * rgba
    const newImgData = new Uint8ClampedArray(width * height * 4);
    // 计算旋转的进度
    const rotateRatio = time / 10000;
    // 使用 d3 计算投影函数
    const projection = geoOrthographic().rotate([-rotateRatio * 360]);
    // 计算需要在视窗内展示的范围
    const xStart = Math.floor((1/4 - 1/16 + rotateRatio) * width) % width;
    let xEnd = Math.ceil((3/4 - 1/16 + rotateRatio) * width) % width;
    if (xEnd < xStart) {
      xEnd += width;
    }

    // 对原始图像进行投影
    for (let y = 0; y < height; y++) {
      for (let x1 = xStart; x1 < xEnd; x1++) {
        const x = x1 % width;
        if (
          !rawImgData[(y * width + x) * 4] &&
          !rawImgData[(y * width + x) * 4 + 1] &&
          !rawImgData[(y * width + x) * 4 + 2] &&
          !rawImgData[(y * width + x) * 4 + 3]
        ) {
          continue;
        }
        // TODO: 有间隙? 暂时用加倍来处理，之后可以加一个补空隙的方法
        const [nx, ny] = projection([x / zoom, y / zoom + 80]);
        const [xx, yy] = [Math.round(nx / 2 - 116), Math.round(ny / 2)];

        newImgData[(yy * width + xx) * 4] = rawImgData[(y * width + x) * 4];
        newImgData[(yy * width + xx) * 4 + 1] = rawImgData[(y * width + x) * 4 + 1];
        newImgData[(yy * width + xx) * 4 + 2] = rawImgData[(y * width + x) * 4 + 2];
        newImgData[(yy * width + xx) * 4 + 3] = rawImgData[(y * width + x) * 4 + 3];

        /**
         * 可以通过计算下一个点点坐标修正当前渲染点的范围。
         */
        // const [lx, ly] = projection([(x + 1) / zoom, (y + 1) / zoom + 80]);
        // for () { for () // TODO }
      }
    }
    return new ImageData(newImgData, width, height);
  }, []);

  // DOM 转 SVG 转 canvas
  useEffect(() => {
    // 将 HTML 转化为 SVG
    const svg = elementToSVG(elementRef.current).firstChild;
    const svgStr = new XMLSerializer().serializeToString(svg);

    // 将 SVG 转为图片
    const img = new Image();
    img.crossOrigin = "anonymous";

    // 图片转为canvas
    const imgCanvas = imgRef.current;
    const imgCtx = imgCanvas.getContext("2d",{
      willReadFrequently: true
    });
    img.onload = function() {
      // 获取图片数据
      imgCtx.drawImage(this, 0, 0);
      const rawImageData = imgCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.height).data;

      // 绘制贴在球面上的文字
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      const { width, height } = imgCanvas;

      // 渲染动画
      const step = (time) => {
        const newImageData = projectionIn(width, height, rawImageData, time);
        ctx.putImageData(newImageData, 0, 0);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    img.src = `data:image/svg+xml,${svgStr}`;
  }, []);

  return (
    <div>
      <div
        style={{
          zoom: 1 / zoom,
          fontSize: `${72 * zoom}px`,
          height: 200 * zoom,
          width: 400 * zoom,
          textAlign: "center",
          lineHeight: `${200 * zoom}px`,
        }}
        ref={elementRef}
      >
        {children ? children : '示例DOM'}
      </div>
      <canvas style={{display: 'none'}} width={400 * zoom} height={200 * zoom} ref={imgRef} />
      <div
        style={{
          transform: 'scale(2)',
          marginLeft: 250,
          marginTop: 150,
          height: 250,
          width: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 80px 80px, #5cabff00, #00000050)'
        }}
      >
        <canvas width={250} height={250} ref={canvasRef} />
      </div>
    </div>
  )
}
