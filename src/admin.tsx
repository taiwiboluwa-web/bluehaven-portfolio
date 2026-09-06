import { createRoot } from 'react-dom/client';
import './styles/index.css';

const nativeFetch=window.fetch.bind(window);
const CHUNK_RAW_BYTES=2*1024*1024;
const MAX_UPLOAD_BYTES=20*1024*1024;

function decodedBase64Bytes(base64:string){
 const padding=base64.endsWith('==')?2:base64.endsWith('=')?1:0;
 return Math.floor(base64.length*3/4)-padding;
}

window.fetch=async (input:RequestInfo|URL,init?:RequestInit):Promise<Response>=>{
 const url=typeof input==='string'?input:input instanceof URL?input.toString():input.url;
 if(url.endsWith('/api/portfolio')&&init?.method==='POST'&&typeof init.body==='string'){
  try{
   const payload=JSON.parse(init.body);
   if(payload?.action==='upload'&&typeof payload.data_url==='string'){
    const match=payload.data_url.match(/^data:([^;]+);base64,(.+)$/s);
    if(match){
     const mime=match[1],base64=match[2],totalSize=decodedBase64Bytes(base64);
     if(totalSize>MAX_UPLOAD_BYTES)return new Response(JSON.stringify({error:'Image must be 20MB or smaller'}),{status:413,headers:{'content-type':'application/json'}});
     const uploadId=crypto.randomUUID();
     const chunkChars=Math.floor(CHUNK_RAW_BYTES/3)*4;
     const totalChunks=Math.ceil(base64.length/chunkChars);
     for(let index=0;index<totalChunks;index++){
      const chunk=base64.slice(index*chunkChars,(index+1)*chunkChars);
      const chunkResponse=await nativeFetch('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'upload_chunk',upload_id:uploadId,project_id:payload.project_id,chunk_index:index,total_chunks:totalChunks,total_size:totalSize,file_name:payload.file_name,mime_type:mime,alt_text:payload.alt_text,data_url:`data:${mime};base64,${chunk}`})});
      if(!chunkResponse.ok)return chunkResponse;
     }
     return nativeFetch('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'finalize_upload',upload_id:uploadId,project_id:payload.project_id,total_size:totalSize,file_name:payload.file_name,mime_type:mime})});
    }
   }
  }catch(error){
   console.error('BlueHaven upload bridge error:',error);
  }
 }
 return nativeFetch(input,init);
};

import Admin from './app/Admin';

createRoot(document.getElementById('admin-root')!).render(<Admin />);
