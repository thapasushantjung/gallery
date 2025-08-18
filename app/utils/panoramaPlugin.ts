// Panorama effect plugin (same math as demo)
export function PanoramaPlugin({ swiper: a, extendParams: s, on: o }: any) {
  s({ panoramaEffect: { depth: 200, rotate: 30 } });
  
  o("beforeInit", () => {
    if (a.params.effect !== "panorama") return;
    a.classNames.push(`${a.params.containerModifierClass}panorama`);
    a.classNames.push(`${a.params.containerModifierClass}3d`);
    const r = { watchSlidesProgress: true };
    Object.assign(a.params, r);
    Object.assign(a.originalParams, r);
  });
  
  o("progress", () => {
    if (a.params.effect !== "panorama") return;
    const r = a.slidesSizesGrid;
    const { depth: e = 200, rotate: t = 30 } = a.params.panoramaEffect;
    const g = (t * Math.PI) / 180 / 2;
    const h = 1 / (180 / t);
    for (let i = 0; i < a.slides.length; i += 1) {
      const d = a.slides[i];
      const P = (d as any).progress;
      const c = r[i];
      const y = a.params.centeredSlides ? 0 : (a.params.slidesPerView - 1) * 0.5;
      const l = P + y;
      const f = 1 - Math.cos(l * h * Math.PI);
      const m = `${(l * (c / 3)) * f}px`;
      const p = l * t;
      const u = `${(c * 0.5) / Math.sin(g) * f - e}px`;
      (d as HTMLElement).style.transform = a.params.direction === "horizontal"
        ? `translateX(${m}) translateZ(${u}) rotateY(${p}deg)`
        : `translateY(${m}) translateZ(${u}) rotateX(${-p}deg)`;
    }
  });
  
  o("setTransition", (_r: any, e: number) => {
    if (a.params.effect !== "panorama") return;
    a.slides.forEach((t: HTMLElement) => {
      t.style.transitionDuration = `${e}ms`;
    });
  });
}
