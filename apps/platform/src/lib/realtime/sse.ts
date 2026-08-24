export function createSseStream(signal: AbortSignal) {
  const encoder = new TextEncoder(); let timer: ReturnType<typeof setInterval>;
  return new ReadableStream({
    start(controller) {
      const push=()=>controller.enqueue(encoder.encode(`event: telemetry
data: ${JSON.stringify({ timestamp:new Date().toISOString(), powerMw:Number((85+Math.random()*12).toFixed(2)), frequencyHz:Number((49.98+Math.random()*.05).toFixed(3)) })}

`));
      push(); timer=setInterval(push,3000); signal.addEventListener("abort",()=>{clearInterval(timer); controller.close();});
    }, cancel(){ clearInterval(timer); }
  });
}
