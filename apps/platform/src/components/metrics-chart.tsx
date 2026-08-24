"use client";
import dynamic from'next/dynamic';const Chart=dynamic(()=>import('./metrics-chart-client'),{ssr:false});export default Chart;
