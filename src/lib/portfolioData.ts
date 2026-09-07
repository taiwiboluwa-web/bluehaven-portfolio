export type DbProject={id:string;name:string;category?:string|null;description?:string|null;media?:{id:string;storage_url:string;alt_text?:string|null;featured?:boolean;sort_order:number}[]};
export type FallbackProject={title:string;image:string;subtitle:string};
export type DisplayProject={id:string;title:string;subtitle:string;image:string|null};

export function normalizeName(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'');
}

function findLegacy(projectName:string,fallback:FallbackProject[]){
  const normalized=normalizeName(projectName);
  const exact=fallback.find(item=>normalizeName(item.title)===normalized);
  if(exact)return exact;
  return fallback.find(item=>{
    const legacy=normalizeName(item.title);
    return legacy.length>4&&(legacy.includes(normalized)||normalized.includes(legacy));
  });
}

export function buildPortfolioItems(projects:DbProject[],fallback:FallbackProject[]):DisplayProject[]{
  const used=new Set<string>();
  const dynamic=projects.map(project=>{
    const media=[...(project.media||[])].sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))||a.sort_order-b.sort_order);
    const legacy=findLegacy(project.name,fallback);
    if(legacy)used.add(normalizeName(legacy.title));
    return {
      id:project.id,
      title:project.name,
      subtitle:project.description||project.category||legacy?.subtitle||'BlueHaven Studios',
      image:media[0]?.storage_url||legacy?.image||null,
    };
  });
  const legacyOnly=fallback
    .filter(item=>!used.has(normalizeName(item.title)))
    .map((item,index)=>({id:`legacy-${index}-${normalizeName(item.title)}`,title:item.title,subtitle:item.subtitle,image:item.image}));
  return [...dynamic,...legacyOnly];
}
