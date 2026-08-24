"use server";import{searchDocumentation}from"@/services/docs/search";export async function findDocumentation(query:string){return searchDocumentation(query)}
