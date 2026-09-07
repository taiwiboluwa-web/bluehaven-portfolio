export type DbProject={id:string;name:string;category?:string|null;description?:string|null;media?:{id:string;storage_url:string;alt_text?:string|null;featured?:boolean;sort_order:number}[]};
export type FallbackProject={title:string;image:string;subtitle:string};
export type DisplayProject={id:string;title:string;subtitle:string;image:string|null};

export function normalizeName(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'');
}

export function buildPortfolioItems(projects:DbProject[],fallback:FallbackProject[]):DisplayProject[]{
  const byName=new Map(fallback.map(item=>[normalizeName(item.title),item]));
  const used=new Set<string>();
  const dynamic=projects.map(project=>{
    const media=[...(project.media||[])].sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))||a.sort_order-b.sort_order);
    const legacy=byName.get(normalizeName(project.name));
    const key=normalizeName(project.name);
    used.add(key);
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
