import React, { useRef, useEffect, useCallback } from 'react';
import { geoOrthographicRaw, geoProjection } from "d3-geo";
import { elementToSVG } from "dom-to-svg";
import './index.css';



export default function CanvasBall2() {
  const elementRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useCallback(() => {

  }, []);

  useEffect(() => {
    // 将 HTML 转化为 SVG
    const svg = elementToSVG(elementRef.current).firstChild;
    const svgStr = new XMLSerializer().serializeToString(svg);

    // 将 SVG 转为图片
    const img = new Image();
    img.crossOrigin = "anonymous";

    // 图片转为canvas
    const imgCanvas = imgRef.current;
    const imgCtx = imgCanvas.getContext("2d");
    img.onload = function() {
      // 获取图片数据
      imgCtx.drawImage(this, 0, 0);
      const rawImageData = imgCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.height).data;

      const projection = geoProjection(geoOrthographicRaw.invert)
      // 绘制贴在球面上的文字
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      const { width, height } = canvas;
      const imgData2 = ctx.getImageData(0, 0, width, height);
      const imgData = imgData2.data;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const [x1, y1] =  projection([x, y]);
          const [x2, y2] = [Math.round(x1), Math.round(y1)];
          imgData[(x + y * width) * 4] = rawImageData[(x2 + y2 * width) * 4];
          imgData[(x + y * width) * 4 + 1] = rawImageData[(x2 + y2 * width) * 4 + 1];
          imgData[(x + y * width) * 4 + 2] = rawImageData[(x2 + y2 * width) * 4 + 2];
          imgData[(x + y * width) * 4 + 3] = rawImageData[(x2 + y2 * width) * 4 + 3];
        }
      }
      // imgData2.data.set(imgData);
      console.log(imgData, rawImageData)
      ctx.putImageData(imgData2, width, height);
    };
    img.src = `data:image/svg+xml,${svgStr}`;
  }, []);

  return (
    <div>
      <div
        ref={elementRef}
        className="text-element"
      >
        示例文字
      </div>
      <canvas width={400} height={200} ref={imgRef} />
      <canvas width={400} height={400} ref={canvasRef} />
    </div>
  )
}
