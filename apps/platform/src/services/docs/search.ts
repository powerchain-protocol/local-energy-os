import{DOCUMENTATION_CATALOG}from"@/config/docs/catalog";
export function searchDocumentation(query:string){const q=query.trim().toLowerCase();if(!q)return DOCUMENTATION_CATALOG;return DOCUMENTATION_CATALOG.filter(x=>`${x.title} ${x.description} ${x.category}`.toLowerCase().includes(q))}
