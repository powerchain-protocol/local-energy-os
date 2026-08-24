import{NextResponse}from"next/server";import{orderBook}from"@/data/exchange";import{clearingPrice,marketLiquidity}from"@/lib/exchange";
export async function GET(){return NextResponse.json({data:{levels:orderBook,clearingPrice:clearingPrice(orderBook),liquidity:marketLiquidity(orderBook)},meta:{market:"local-renewable-energy",timestamp:new Date().toISOString()}})}
