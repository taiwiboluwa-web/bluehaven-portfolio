import { useEffect } from 'react';

const links=[
  {label:'Home',href:'/'},
  {label:'Stories',href:'/stories'},
  {label:'Services',href:'/services'},
  {label:'Portfolio',href:'/portfolio'},
  {label:'Process',href:'/process'},
  {label:'Inquire',href:'/inquire'},
];

function makeAnchor(label:string,href:string,template:Element){
  const a=document.createElement('a');
  a.href=href;
  a.textContent=label;
  a.className=template.className;
  a.setAttribute('data-bh-nav','1');
  a.style.textDecoration='none';
  return a;
}

function enhanceNavigation(){
  Array.from(document.querySelectorAll('header button')).forEach(button=>{
    const label=(button.textContent||'').trim();
    const match=links.find(l=>label===l.label);
    if(!match||button.getAttribute('data-bh-nav')==='1')return;
    button.replaceWith(makeAnchor(label,match.href,button));
  });

  const desktopNav=document.querySelector('header nav.hidden.md\\:block ul');
  if(desktopNav&&!desktopNav.querySelector('a[href="/stories"]')){
    const template=desktopNav.querySelector('a[href="/"]')||desktopNav.querySelector('a');
    if(template){
      const li=document.createElement('li');
      li.appendChild(makeAnchor('Stories','/stories',template));
      desktopNav.insertBefore(li,desktopNav.children[1]||null);
    }
  }
}

export default function NavigationEnhancement(){
  useEffect(()=>{
    enhanceNavigation();
    const observer=new MutationObserver(enhanceNavigation);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);
  return null;
}
