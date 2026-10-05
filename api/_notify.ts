const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,(c:string)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[c]);

export async function notifyPendingCommunityPost(post:{title:string;username:string;display_name:string;category:string}){
  const key=process.env.RESEND_API_KEY;
  const from=process.env.RESEND_FROM_EMAIL;
  const to=process.env.BLUEHAVEN_ADMIN_EMAIL;
  if(!key||!from||!to)return;
  const reviewUrl='https://www.bluehavens.name.ng/admin/blog';
  const subject='BlueHaven Stories: post waiting for approval';
  const text='A new community story is waiting for your review.\n\nTitle: '+post.title+'\nAuthor: @'+post.username+' ('+post.display_name+')\nCategory: '+post.category+'\n\nReview: '+reviewUrl;
  const html='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>New BlueHaven story waiting for approval</h2><p><strong>'+esc(post.title)+'</strong></p><p>By @'+esc(post.username)+' · '+esc(post.display_name)+'</p><p>Category: '+esc(post.category)+'</p><p><a href="'+reviewUrl+'">Open the BlueHaven admin review queue</a></p></div>';
  try{
    await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,text,html})});
  }catch(error){console.error('BlueHaven pending-post email failed',error)}
}