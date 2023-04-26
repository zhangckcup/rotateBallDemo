export const loadImg2Canvas = (element) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 处理 canvas 受污染的情况
    img.crossOrigin = "anonymous";
    img.onerror = reject;
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);

      // 编辑图片data
      resolve(canvas);
    };

    img.src = element.src;
  });
};
