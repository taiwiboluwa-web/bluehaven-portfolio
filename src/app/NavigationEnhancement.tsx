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

  Array.from(document.querySelectorAll('header ul')).forEach(list=>{
    if(list.querySelector('a[href="/stories"]'))return;
    const home=list.querySelector('a[href="/"]');
    if(!home)return;
    const li=document.createElement('li');
    li.appendChild(makeAnchor('Stories','/stories',home));
    list.insertBefore(li,list.children[1]||null);
  });
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
