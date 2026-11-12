'use strict';
function deliveryTextLength(text){return Array.from(text).length;}
function cutleryRequest(value){if(value==='none')return '수저는 필요 없어요. 감사합니다.';const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=10?`수저 ${n}세트 챙겨주세요. 감사합니다.`:'';}
function compactDriverRequest(type,target,custom,extra,recipient){
  const messages={front:'1층 프런트에 맡겨주세요.',door:`${target||'객실'} 문 앞에 놓아주세요.`,table:'배달 테이블에 놓아주세요.',doorFront:`${target||'객실'} 문 앞, 불가 시 1층 프런트에 맡겨주세요.`,homeDoor:`${target||'숙소 현관문'} 앞에 놓아주세요.`,commonDoor:'공동현관 앞에 놓아주세요.',firstEntrance:'1층 출입구 앞에 놓아주세요.',homeCommon:`${target||'숙소 현관문'} 앞, 불가 시 공동현관 앞에 놓아주세요.`,custom:custom};
  return [messages[type]||'',extra,'사진 부탁드립니다.',recipient?'수령자: '+recipient:''].filter(Boolean).join(' ').trim();
}
if(typeof module!=='undefined')module.exports={deliveryTextLength,compactDriverRequest,cutleryRequest};
if(typeof document!=='undefined'){
  const root=document.getElementById('diOutput');
  root.className='';
  root.innerHTML=`<div class="field"><label for="diFinalAddress">整合地址（含房號／樓層）</label><textarea id="diFinalAddress" readonly placeholder="產生後顯示完整地址"></textarea><button type="button" class="secondary" onclick="copyDeliveryField('diFinalAddress')">📋 複製地址</button></div><div class="field" style="margin-top:20px"><label for="diDriverText">給外送員（韓文，最多 50 字）</label><textarea id="diDriverText" maxlength="50" placeholder="產生後可自行調整韓文放置需求"></textarea><div id="diDriverCount" class="hint" role="status">0 / 50 字</div><button type="button" class="secondary" onclick="copyDeliveryField('diDriverText')">📋 複製給外送員</button></div><div class="field" style="margin-top:20px"><label for="diStoreText">給店家（韓文，選填，最多 50 字）</label><textarea id="diStoreText" maxlength="50" placeholder="請自行填寫韓文餐點需求，例如：수저는 필요 없어요."></textarea><div id="diStoreCount" class="hint" role="status">0 / 50 字</div><button type="button" class="secondary" onclick="copyDeliveryField('diStoreText')">📋 複製給店家</button></div>`;
  const get=id=>document.getElementById(id);
  const cutlery=document.createElement('select');cutlery.id='diCutlery';cutlery.setAttribute('aria-label','幾人份餐具');cutlery.style.marginBottom='10px';
  cutlery.innerHTML='<option value="">餐具：不指定／自行填寫</option><option value="none">不需要餐具</option>'+Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1} 人份餐具</option>`).join('');
  get('diStoreText').before(cutlery);
  cutlery.addEventListener('change',()=>{const next=cutleryRequest(cutlery.value),current=get('diStoreText').value.trim();if(current&&current!==get('diStoreText').dataset.cutleryText&&!confirm('要用餐具需求取代目前的店家備註嗎？')){cutlery.value=get('diStoreText').dataset.cutleryValue||'';return;}get('diStoreText').value=next;get('diStoreText').dataset.cutleryText=next;get('diStoreText').dataset.cutleryValue=cutlery.value;countNotes();});
  function countNotes(){for(const [id,counter] of [['diDriverText','diDriverCount'],['diStoreText','diStoreCount']]){const n=deliveryTextLength(get(id).value);get(counter).textContent=n+' / 50 字（含空格與標點）';get(counter).style.color=n>50?'#c0392b':'';}}
  for(const id of ['diDriverText','diStoreText'])get(id).addEventListener('input',countNotes);
  window.resetDeliveryOutputs=()=>{get('diFinalAddress').value='';get('diDriverText').value='';get('diCount').textContent='地址已修改，請重新產生外送資訊。';countNotes();};
  window.generateDeliveryInfo=(scroll=false)=>{
    const address=get('diAddress').value.trim();if(!address){toast('請先填寫完整韓文地址');return '';}
    const room=diUnit(get('diRoom').value.trim(),'호'),floor=diUnit(get('diFloor').value.trim(),'층');
    const target=[room,floor].filter(Boolean).join(' ');
    get('diFinalAddress').value=[address,target].filter(Boolean).join(' ');
    const driver=compactDriverRequest(get('diDropoff').value,target,get('diCustom').value.trim(),get('diExtra').value.trim(),get('diRecipient').value.trim());
    if(deliveryTextLength(driver)>50){get('diDriverText').value='';get('diCount').textContent='外送員需求共 '+deliveryTextLength(driver)+' 字，超過 50 字，尚未產生。請精簡上方自訂需求、備註或姓名後重試；也可直接在下方填寫 50 字內韓文。';toast('外送員文字超過 50 字，請精簡；系統不會截斷需求。');}
    else {get('diDriverText').value=driver;get('diCount').textContent='三個欄位可分別複製；店家需求自行填寫，不會被重新產生覆蓋。';}
    countNotes();if(scroll)root.scrollIntoView({behavior:'smooth',block:'start'});
    return get('diFinalAddress').value;
  };
  window.copyDeliveryField=async id=>{const text=get(id).value.trim();if(!text)return toast('這個欄位是空白，請先產生或填寫。');if(id!=='diFinalAddress'&&deliveryTextLength(text)>50)return toast('文字超過 50 字，請精簡後再複製。');await copyText(text);toast('已複製'+(id==='diFinalAddress'?'地址':id==='diDriverText'?'給外送員的文字':'給店家的文字'));};
  const allButton=document.querySelector('button[onclick="copyDeliveryInfo()"]');if(allButton)allButton.remove();
  window.clearDeliveryInfo=()=>{if(!confirm('確定要清除目前的外送資訊嗎？'))return;['diAddress','diRecipient','diRoom','diFloor','diCustom','diExtra','diStoreText'].forEach(id=>get(id).value='');cutlery.value='';get('diStoreText').dataset.cutleryText='';get('diStoreText').dataset.cutleryValue='';get('diStayType').value='hotel';updateDIOptions();if(window.aaReset)window.aaReset();resetDeliveryOutputs();get('diCount').textContent='填寫完成後，按下「產生外送資訊」。';};
  for(const id of ['diAddress','diRoom','diFloor','diRecipient','diCustom','diExtra','diDropoff','diStayType'])get(id).addEventListener('input',()=>resetDeliveryOutputs());
  get('diCount').textContent='填寫完成後，按下「產生外送資訊」。';
  const notice=get('diExtra').closest('.grid').querySelector('.notice');notice.textContent='地址、外送員需求與店家需求分開複製。外送員預設加入拍照要求；超過 50 字會要求精簡，不會直接截斷。店家需求請在產生結果區自行填寫韓文。';
  const oldBring=window.bringQuoteAddress;window.bringQuoteAddress=()=>{oldBring();resetDeliveryOutputs();};
  countNotes();
}
