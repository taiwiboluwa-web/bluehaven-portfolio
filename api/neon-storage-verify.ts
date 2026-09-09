import { verifyNeonStorageToken } from '../src/lib/neonStorageAuth.js';

type Req={method?:string;headers?:Record<string,string|undefined>;body?:unknown};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;json:(v:unknown)=>void};

export default async function handler(req:Req,res:Res){
 if(req.method!=='POST')return res.status(405).setHeader('content-type','application/json').json({error:'Method not allowed'});
 try{
  const token=req.headers?.authorization?.replace(/^Bearer\s+/i,'')||'';
  const claims=verifyNeonStorageToken(token);
  return res.status(200).setHeader('content-type','application/json').json({ok:true,claims});
 }catch(error){
  return res.status(401).setHeader('content-type','application/json').json({error:error instanceof Error?error.message:'Invalid token'});
 }
}
