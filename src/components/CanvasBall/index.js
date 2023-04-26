import React, { useRef, useEffect } from 'react';
import { geoOrthographic } from 'd3-geo';
import { elementToSVG } from "dom-to-svg";
import { loadImg2Canvas } from "./utils";
import './index.css';

let step = null;

function projectionIn(width, height,rawImgData, time ) {
  // 长 * 宽 * rgba
  const newImgData = new Uint8ClampedArray(width * height * 4);
  const projection = geoOrthographic().rotate([time / 10000 * 180, 0]);
  let [lastX, lastY] = [0, 0];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (
        !rawImgData[(y * width + x) * 4] &&
        !rawImgData[(y * width + x) * 4 + 1] &&
        !rawImgData[(y * width + x) * 4 + 2] &&
        !rawImgData[(y * width + x) * 4 + 3]
      ) {
        continue;
      }
      const [nx, ny] = projection([x, y + 80]);
      const [xx, yy] = [Math.round(nx / 2), Math.round(ny/2)];
      // 有间隙
      if (lastX - xx > 1 || lastY - yy > 1) {

      }
      newImgData[(yy * width + xx) * 4] = rawImgData[(y * width + x) * 4]
      newImgData[(yy * width + xx) * 4 + 1] = rawImgData[(y * width + x) * 4 + 1]
      newImgData[(yy * width + xx) * 4 + 2] = rawImgData[(y * width + x) * 4 + 2]
      newImgData[(yy * width + xx) * 4 + 3] = rawImgData[(y * width + x) * 4 + 3]
    }
    lastY = 0;
  }
  return new ImageData(newImgData, width, height);
}

function drawDomToCanvas(item: Node, container) {
  const canvas = document.createElement('canvas');
  canvas.getContext('2d');
  const svg = elementToSVG(item).firstChild;
  // const svg = document.createElement('svg');
  const svgStr = new XMLSerializer().serializeToString(svg);
  const img = document.createElement('img');
  img.src = `data:image/svg+xml,${svgStr}`;

  loadImg2Canvas(img).then((canvas) => {
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rawImgData = imgData.data;
    const { height, width } = canvas;

    const newImg = projectionIn(width, height, rawImgData, 0);
    ctx.putImageData(newImg,0,0);

    step = (time) => {
      const newImg = projectionIn(width, height, rawImgData, time);
      ctx.putImageData(newImg,0,0);
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

// 使用 D3 投影
export default function CanvasBall() {
  const elementRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    drawDomToCanvas(elementRef.current, svgRef.current);
  }, []);

  return (
    <div className="canvas-ball">
      <div
        className="text-element"
        ref={elementRef}
      >
        示例文字
      </div>
      <div className="svg-element" ref={svgRef}>
      </div>
    </div>
  )
}
