export function quorum(total:number,bps=6700){return Math.max(3,Math.ceil(total*bps/10000))}
