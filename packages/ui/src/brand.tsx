import type { SVGProps } from "react";

export function PowerChainMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M8 5h15.1C29.7 5 34 9.3 34 15.2c0 4.6-2.6 8.2-6.8 9.7L18 35v-9.2l6.3-7H18V12h5.2c1.9 0 3.2 1.1 3.2 2.8 0 1.8-1.3 2.9-3.2 2.9H15.7V35H8V5Z"/>
    </svg>
  );
}

export function PowerChainBrand({ product }: { product?: string }) {
  return (
    <span className="pc-brand-lockup">
      <span className="pc-brand-mark"><PowerChainMark /></span>
      <span className="pc-brand-copy">
        <span className="pc-brand-name"><strong>Power</strong><span>Chain</span></span>
        {product ? <span className="pc-brand-product">{product}</span> : null}
      </span>
    </span>
  );
}
