import { useEffect } from 'react';
import App from './App';
import SiteEnhancements from './SiteEnhancements';

const targets:Record<string,string>={services:'services',portfolio:'portfolio',process:'process',inquire:'contact'};

function directChild(node:Element,root:HTMLElement){
  let current=node;
  while(current.parentElement&&current.parentElement!==root)current=current.parentElement;
  return current;
}

function applyRouteVisibility(){
  const key=window.location.pathname.split('/')[1]||'';
  const root=document.querySelector('.min-h-screen.w-full.overflow-x-hidden') as HTMLElement|null;
  if(!root)return;

  const header=document.querySelector('header');
  const footer=document.querySelector('footer');
  const keep=new Set<Element>();
  if(header)keep.add(directChild(header,root));
  if(footer)keep.add(directChild(footer,root));

  const targetId=targets[key];
  if(targetId){
    const target=document.getElementById(targetId);
    if(!target)return;
    keep.add(directChild(target,root));
    Array.from(root.children).forEach(child=>{
      if(keep.has(child)||child.querySelector('header')||child.querySelector('footer'))return;
      (child as HTMLElement).dataset.bluehavenRouteHidden='1';
      (child as HTMLElement).style.display='none';
    });
    window.scrollTo({top:0});
    return;
  }

  if(key!=='')return;

  const latest=document.getElementById('bluehaven-managed-work');
  if(!latest)return;
  const latestRoot=directChild(latest,root);
  let afterLatest=false;
  Array.from(root.children).forEach(child=>{
    if(child===latestRoot){afterLatest=true;return;}
    if(!afterLatest||keep.has(child)||child.querySelector('header')||child.querySelector('footer'))return;
    (child as HTMLElement).dataset.bluehavenHomeAfterLatest='1';
    (child as HTMLElement).style.display='none';
  });
}

export default function RouteView(){
  useEffect(()=>{
    const timer=window.setTimeout(applyRouteVisibility,180);
    const observer=new MutationObserver(()=>applyRouteVisibility());
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{window.clearTimeout(timer);observer.disconnect()};
  },[]);
  return <><App/><SiteEnhancements/></>;
}
