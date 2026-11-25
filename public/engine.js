export const money = n => Number.isFinite(n) ? Math.round(n*100)/100 : null;
const positive = n => typeof n==='number' && Number.isFinite(n) && n>0;
export function evaluate(item){
 const reasons=[]; const campaigns=Array.isArray(item.campaigns)?item.campaigns:[];
 if(!/^MLB\d+$/.test(item.id||'')) reasons.push('Código MLB inválido');
 if(!item.sku) reasons.push('SKU ausente');
 if(!positive(item.original)) reasons.push('Preço original inválido');
 if(item.listingStatus!=='active') reasons.push('Anúncio não confirmado ativo');
 if(item.statusVerified!==true || item.campaignsComplete!==true) reasons.push('Status ou campanhas incompletos');
 if(campaigns.some(c=>c.status==='started'||c.status==='active')) reasons.push('Promoção ativa — excluir');
 if(campaigns.some(c=>c.status==='pending')) reasons.push('Promoção programada — revisar conflito');
 if(campaigns.some(c=>!['candidate','finished','started','active','pending'].includes(c.status))) reasons.push('Status desconhecido');
 const sales=(Array.isArray(item.sales)?item.sales:[]).filter(s=>s.status==='paid'&&positive(s.price)&&positive(s.quantity)&&Number.isFinite(Date.parse(s.date))).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 const last=sales.slice(0,3); const known=positive(item.cost)&&item.costSku===item.sku;
 if(item.cost!=null&&!known) reasons.push('Custo inválido ou SKU divergente');
 if(last.length<3) reasons.push('Menos de três vendas válidas');
 const avg=last.length===3?money(last.reduce((a,s)=>a+s.price,0)/3):null;
 const net=last.length===3&&last.every(s=>positive(s.net))?money(last.reduce((a,s)=>a+s.net,0)/3):null;
 const reference=known?avg:sales.find(s=>s.price<item.original)?.price??null;
 if(!known&&!reference) reasons.push('Sem custo e sem preço histórico inferior ao original');
 if(net===null) reasons.push('Retorno histórico incompleto');
 const options=campaigns.filter(c=>c.status==='candidate').map(c=>{
 const valid=positive(c.price)&&c.price<item.original&&positive(c.net)&&c.netVerified===true&&c.meliPlus!==true&&!!c.id&&(!c.end||Date.parse(c.end)>Date.now())&&(!c.start||Date.parse(c.start)<=Date.now())&&(!known||c.net>item.cost)&& (known||c.price===reference);
 return {...c,valid,discount:money((1-c.price/item.original)*100),partial:known?money(c.net-item.cost):null,margin:known?money((c.net-item.cost)/c.price*100):null,delta:net===null?null:money(c.net-net),distance:reference===null?Infinity:Math.abs(c.price-reference)};
 }).sort((a,b)=>Number(b.valid)-Number(a.valid)||a.distance-b.distance||b.net-a.net);
 if(!options.some(c=>c.valid)) reasons.push('Nenhuma opção com retorno validado e preço compatível');
 return {id:item.id,known,reference,avg,net,last,options,reasons,ready:reasons.length===0, recommendation:reasons.length?null:options.find(c=>c.valid)?.id};
}
