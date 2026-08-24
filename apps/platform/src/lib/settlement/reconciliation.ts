export function reconcile(expected:number,actual:number,tolerance=.01){const variance=actual-expected;return{variance,balanced:Math.abs(variance)<=tolerance}}
