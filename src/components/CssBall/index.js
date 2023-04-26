import React from 'react';
import './index.css';

/**
 * 使用CSS进行 3D 旋转：
 * 缺点：
 * 1. 只能进行线性变换，如果要实现球形效果，需要更多的DOM节点性能不行
 * 2. 不存在一个直接把平面投影到球体上的线性变换
 * @returns {JSX.Element}
 * @constructor
 */
export default function CssBall() {
  const itemLen = 10;

  return (
    <div className="app">
      <div className="ball">
        {[...new Array(itemLen)].map((v, i) => (
          <div
            className="ball-item"
            style={{
              transform: `rotateY(${i * 180 / itemLen}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
