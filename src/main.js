(function(){
"use strict";

/* ============ 資料層 ============ */
var KEY = "fairy_profit_journal_v1";
var db = { name:"", createdAt:"", records:[], lastBackup:"" };

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){
      var d = JSON.parse(raw);
      db.name = d.name || "";
      db.createdAt = d.createdAt || "";
      db.records = Array.isArray(d.records) ? d.records : [];
      db.lastBackup = d.lastBackup || "";
    }
  }catch(e){ /* 讀取失敗就當作全新開始 */ }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(db)); }
  catch(e){ toast("儲存失敗，請確認瀏覽器允許儲存資料"); }
}

/* ============ 小工具 ============ */
function pad(n){ return n<10 ? "0"+n : ""+n; }
function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function num(n){ return Math.round(n).toLocaleString("en-US"); }
function money(n){ return (n<0 ? "-NT$ " : "NT$ ") + num(Math.abs(n)); }
function ymOf(dateStr){ return dateStr.slice(0,7); }
function yearOf(dateStr){ return dateStr.slice(0,4); }
function dayOf(dateStr){ return parseInt(dateStr.slice(8,10),10); }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function sum(list){
  var s={sale:0,cost:0,profit:0,count:list.length};
  for(var i=0;i<list.length;i++){ s.sale+=list[i].sale; s.cost+=list[i].cost; }
  s.profit = s.sale - s.cost;
  return s;
}
function byMonth(ym){ return db.records.filter(function(r){ return ymOf(r.date)===ym; }); }
function byYear(y){ return db.records.filter(function(r){ return yearOf(r.date)===y; }); }

var toastTimer;
function toast(msg){
  var t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove("on"); },2600);
}

function setBig(el, value){
  el.innerHTML = '<span class="cur">NT$</span>'+num(Math.abs(value));
  el.classList.toggle("neg", value<0);
  if(value<0) el.innerHTML = '<span class="cur">-NT$</span>'+num(Math.abs(value));
}

/* ============ 畫面切換 ============ */
var current = "home";
function go(id){
  var all=document.querySelectorAll(".screen");
  for(var i=0;i<all.length;i++) all[i].classList.remove("on");
  document.getElementById(id).classList.add("on");
  current=id;
  window.scrollTo(0,0);
  if(id==="home") renderHome();
  if(id==="month") renderMonth();
  if(id==="year") renderYear();
  if(id==="settings") renderSettings();
}
document.addEventListener("click", function(e){
  var el = e.target.closest("[data-go]");
  if(el){ e.preventDefault(); go(el.getAttribute("data-go")); }
});

/* ============ 折線圖 ============ */
/* points: [{label, value, cap}] */
function drawChart(host, points, color){
  if(!points.length || points.every(function(p){ return p.value===0; })){
    host.innerHTML = '<div class="empty">還沒有紀錄。<br>記下第一筆，曲線就會開始長出來 ✨</div>';
    return;
  }
  var W=700, H=250, PL=14, PR=14, PT=26, PB=34;
  var vals = points.map(function(p){ return p.value; });
  var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
  if(min>0) min=0;
  if(max===min) max = min + 1;
  var innerW = W-PL-PR, innerH = H-PT-PB;
  var n = points.length;
  function X(i){ return PL + (n===1 ? innerW/2 : innerW*i/(n-1)); }
  function Y(v){ return PT + innerH - (v-min)/(max-min)*innerH; }

  var line="", area="", dots="", hits="", labels="";
  for(var i=0;i<n;i++){
    var x=X(i), y=Y(points[i].value);
    line += (i?" L":"M")+x.toFixed(1)+" "+y.toFixed(1);
    dots += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(points[i].value?4.5:2.5)+'" fill="#fff" stroke="'+color+'" stroke-width="2.5"/>';
    hits += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="20" fill="transparent" data-i="'+i+'" style="cursor:pointer"/>';
  }
  area = line + " L"+X(n-1).toFixed(1)+" "+Y(min).toFixed(1)+" L"+X(0).toFixed(1)+" "+Y(min).toFixed(1)+" Z";

  var step = n>16 ? Math.ceil(n/7) : (n>8 ? 2 : 1);
  for(var j=0;j<n;j++){
    if(j%step===0 || j===n-1){
      labels += '<text x="'+X(j).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="15" fill="#9B938C" font-family="Noto Sans TC, sans-serif">'+esc(points[j].label)+'</text>';
    }
  }
  var zeroY = Y(0);
  var gid = "g"+Math.random().toString(36).slice(2,7);

  host.innerHTML =
    '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="獲利趨勢圖">'+
      '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0%" stop-color="'+color+'" stop-opacity="0.22"/>'+
        '<stop offset="100%" stop-color="'+color+'" stop-opacity="0"/>'+
      '</linearGradient></defs>'+
      '<line x1="'+PL+'" y1="'+zeroY.toFixed(1)+'" x2="'+(W-PR)+'" y2="'+zeroY.toFixed(1)+'" stroke="#EBE4DB" stroke-width="1.5"/>'+
      '<path d="'+area+'" fill="url(#'+gid+')"/>'+
      '<path d="'+line+'" fill="none" stroke="'+color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
      dots + hits +
      labels +
    '</svg>'+
    '<div class="chart-cap">最高 '+money(max)+'　·　點一下曲線上的圓點看單日數字</div>';

  var cap = host.querySelector(".chart-cap");
  host.querySelectorAll("circle[data-i]").forEach(function(c){
    c.addEventListener("click", function(){
      var p = points[parseInt(c.getAttribute("data-i"),10)];
      cap.innerHTML = esc(p.cap || p.label)+'　獲利 <b>'+money(p.value)+'</b>';
    });
  });
}

/* ============ 首頁 ============ */
function renderHome(){
  var ym = todayStr().slice(0,7);
  var y = todayStr().slice(0,4);
  var m = parseInt(ym.slice(5,7),10);
  var s = sum(byMonth(ym));

  document.getElementById("greetName").textContent = "歡迎" + db.name + "回來 ♡";
  document.getElementById("homeMonthCap").textContent = m+" 月目前獲利";
  setBig(document.getElementById("homeProfit"), s.profit);
  document.getElementById("homeSale").textContent = money(s.sale);
  document.getElementById("homeCost").textContent = money(s.cost);
  document.getElementById("homeTrendTitle").textContent = m+" 月獲利趨勢";

  drawChart(document.getElementById("homeChart"), dailyPoints(ym), "#C09880");

  var ys = sum(byYear(y));
  document.getElementById("homeYearTitle").textContent = y+" 年累積獲利";
  setBig(document.getElementById("homeYearProfit"), ys.profit);

  var all = sum(db.records);
  document.getElementById("allProfit").textContent = money(all.profit);
  document.getElementById("allSale").textContent = money(all.sale);
  document.getElementById("allCost").textContent = money(all.cost);
  document.getElementById("allCount").textContent = all.count + " 筆";
  document.getElementById("allProfit").classList.toggle("neg", all.profit<0);

  var since = document.getElementById("sinceLine");
  if(db.createdAt){
    var d = db.createdAt;
    since.textContent = "從 "+d.slice(0,4)+" 年 "+parseInt(d.slice(5,7),10)+" 月 "+parseInt(d.slice(8,10),10)+" 日開始記錄至今";
  } else { since.textContent = ""; }
}

function dailyPoints(ym){
  var Y = parseInt(ym.slice(0,4),10), M = parseInt(ym.slice(5,7),10);
  var last = new Date(Y, M, 0).getDate();
  var byDay = {};
  byMonth(ym).forEach(function(r){
    var d = dayOf(r.date);
    byDay[d] = (byDay[d]||0) + (r.sale - r.cost);
  });
  var pts=[];
  for(var d=1; d<=last; d++){
    pts.push({ label:String(d), value: byDay[d]||0, cap: M+"/"+d });
  }
  return pts;
}

/* ============ 新增／編輯 ============ */
var editingId = null;

function openEntry(id){
  editingId = id || null;
  var t=document.getElementById("entryTitle");
  var del=document.getElementById("delRec");
  var more=document.getElementById("moreBox");
  if(editingId){
    var r = db.records.find(function(x){ return x.id===editingId; });
    if(!r){ editingId=null; }
    else{
      t.textContent = "修改這筆紀錄";
      document.getElementById("fDate").value = r.date;
      document.getElementById("fSale").value = r.sale;
      document.getElementById("fCost").value = r.cost;
      document.getElementById("fCustomer").value = r.customer||"";
      document.getElementById("fItem").value = r.item||"";
      document.getElementById("fNote").value = r.note||"";
      del.style.display = "block";
      document.getElementById("saveRec").textContent = "儲存修改";
      if(r.customer||r.item||r.note) more.classList.add("on");
      calc(); go("entry"); return;
    }
  }
  t.textContent = "記錄今天的成果";
  document.getElementById("fDate").value = todayStr();
  ["fSale","fCost","fCustomer","fItem","fNote"].forEach(function(k){ document.getElementById(k).value=""; });
  more.classList.remove("on");
  del.style.display = "none";
  document.getElementById("saveRec").textContent = "儲存今天的成果";
  calc(); go("entry");
}

function calc(){
  var s = parseFloat(document.getElementById("fSale").value);
  var c = parseFloat(document.getElementById("fCost").value);
  var box = document.getElementById("calcBox");
  var el = document.getElementById("calcNum");
  var hasS = !isNaN(s), hasC = !isNaN(c);
  if(!hasS && !hasC){ box.classList.add("idle"); el.classList.remove("neg"); el.textContent="NT$ 0"; return; }
  var p = (hasS?s:0) - (hasC?c:0);
  box.classList.remove("idle");
  el.textContent = money(p);
  el.classList.toggle("neg", p<0);
}
["fSale","fCost"].forEach(function(k){
  document.getElementById(k).addEventListener("input", calc);
});

document.getElementById("moreToggle").addEventListener("click", function(){
  document.getElementById("moreBox").classList.toggle("on");
});

document.getElementById("saveRec").addEventListener("click", function(){
  var date = document.getElementById("fDate").value || todayStr();
  var s = parseFloat(document.getElementById("fSale").value);
  var c = parseFloat(document.getElementById("fCost").value);
  if(isNaN(s)){ toast("請填寫銷售金額"); document.getElementById("fSale").focus(); return; }
  if(isNaN(c)){ toast("請填寫成本"); document.getElementById("fCost").focus(); return; }
  if(s<0 || c<0){ toast("金額不能是負數"); return; }

  var rec = {
    id: editingId || uid(),
    date: date,
    sale: s,
    cost: c,
    customer: document.getElementById("fCustomer").value.trim(),
    item: document.getElementById("fItem").value.trim(),
    note: document.getElementById("fNote").value.trim()
  };
  if(editingId){
    var i = db.records.findIndex(function(x){ return x.id===editingId; });
    if(i>=0) db.records[i]=rec;
    save(); toast("✨ 已更新這筆紀錄");
  }else{
    db.records.push(rec);
    save(); toast("✨ 已記錄，今天又多累積 " + money(s-c) + "。");
  }
  editingId=null;
  go("home");
});

document.getElementById("delRec").addEventListener("click", function(){
  if(!editingId) return;
  if(!confirm("確定要刪除這筆紀錄嗎？刪除後無法復原。")) return;
  db.records = db.records.filter(function(x){ return x.id!==editingId; });
  save(); editingId=null;
  toast("已刪除這筆紀錄");
  go("month");
});

document.getElementById("goEntry").addEventListener("click", function(){ openEntry(null); });

/* ============ 月度 ============ */
var viewYM = todayStr().slice(0,7);

function shiftMonth(ym, delta){
  var Y=parseInt(ym.slice(0,4),10), M=parseInt(ym.slice(5,7),10)+delta;
  while(M<1){ M+=12; Y--; }
  while(M>12){ M-=12; Y++; }
  return Y+"-"+pad(M);
}
document.getElementById("mPrev").addEventListener("click", function(){ viewYM=shiftMonth(viewYM,-1); renderMonth(); });
document.getElementById("mNext").addEventListener("click", function(){ viewYM=shiftMonth(viewYM,1); renderMonth(); });

function renderMonth(){
  var Y=viewYM.slice(0,4), M=parseInt(viewYM.slice(5,7),10);
  document.getElementById("mLabel").textContent = Y+" 年 "+M+" 月";
  document.getElementById("mOverviewCap").textContent = M+" 月總獲利";

  var list = byMonth(viewYM).slice().sort(function(a,b){
    return a.date===b.date ? 0 : (a.date<b.date?1:-1);
  });
  var s = sum(list);
  setBig(document.getElementById("mProfit"), s.profit);
  document.getElementById("mSale").textContent = money(s.sale);
  document.getElementById("mCost").textContent = money(s.cost);

  drawChart(document.getElementById("mChart"), dailyPoints(viewYM), "#C09880");

  var box=document.getElementById("mList");
  if(!list.length){
    box.innerHTML = '<div class="empty">這個月還沒有紀錄。<br>回首頁按「＋ 記錄今天的銷售」開始吧 ✨</div>';
    return;
  }
  box.innerHTML = list.map(function(r){
    var p = r.sale - r.cost;
    var tag = [r.customer, r.item].filter(Boolean).join("｜");
    return '<button class="rec" data-id="'+r.id+'">'+
      '<div class="d"><span>'+parseInt(r.date.slice(5,7),10)+' 月 '+parseInt(r.date.slice(8,10),10)+' 日</span>'+
      (tag ? '<span class="tag">'+esc(tag)+'</span>' : '')+'</div>'+
      '<div class="p'+(p<0?' neg':'')+'">'+money(p)+'</div>'+
      '<div class="sc">銷售 '+money(r.sale)+'　｜　成本 '+money(r.cost)+'</div>'+
      (r.note ? '<div class="note">'+esc(r.note)+'</div>' : '')+
    '</button>';
  }).join("");
  box.querySelectorAll(".rec").forEach(function(b){
    b.addEventListener("click", function(){ openEntry(b.getAttribute("data-id")); });
  });
}

/* ============ 年度 ============ */
var viewYear = todayStr().slice(0,4);

function renderYear(){
  var years = {};
  db.records.forEach(function(r){ years[yearOf(r.date)]=true; });
  years[todayStr().slice(0,4)]=true;
  years[viewYear]=true;
  var list = Object.keys(years).sort();

  var pick=document.getElementById("yPick");
  pick.innerHTML = list.map(function(y){
    return '<button class="chip'+(y===viewYear?' on':'')+'" data-y="'+y+'">'+y+'</button>';
  }).join("");
  pick.querySelectorAll(".chip").forEach(function(c){
    c.addEventListener("click", function(){ viewYear=c.getAttribute("data-y"); renderYear(); });
  });

  var recs = byYear(viewYear);
  var s = sum(recs);
  document.getElementById("yCap").textContent = viewYear+" 年總獲利";
  setBig(document.getElementById("yProfit"), s.profit);
  document.getElementById("ySale").textContent = money(s.sale);
  document.getElementById("yCost").textContent = money(s.cost);

  var monthly = [];
  for(var m=1;m<=12;m++){
    var ms = sum(byMonth(viewYear+"-"+pad(m)));
    monthly.push({ label:m+"月", value:ms.profit, cap:viewYear+" 年 "+m+" 月", sale:ms.sale, cost:ms.cost, count:ms.count });
  }
  drawChart(document.getElementById("yChart"), monthly, "#B09E88");

  var box=document.getElementById("yList");
  var rows = monthly.filter(function(m){ return m.count>0; });
  if(!rows.length){
    box.innerHTML = '<div class="empty">'+viewYear+' 年還沒有紀錄。</div>';
  }else{
    box.innerHTML = rows.map(function(m){
      return '<div class="stat-line"><span class="k">'+m.label+'（'+m.count+' 筆）</span>'+
             '<span class="v'+(m.value<0?' neg':' gold')+'">'+money(m.value)+'</span></div>';
    }).join("");
  }
}

/* ============ 設定與備份 ============ */
function renderSettings(){
  document.getElementById("editName").value = db.name;
  var lb=document.getElementById("lastBackup");
  lb.textContent = db.lastBackup ? ("上次匯出：" + db.lastBackup) : "還沒有匯出過備份檔。";
}

document.getElementById("saveName").addEventListener("click", function(){
  var v=document.getElementById("editName").value.trim();
  if(!v){ toast("請填寫名字"); return; }
  db.name=v; save(); toast("已更新，歡迎"+v+" ✨");
});

document.getElementById("doExport").addEventListener("click", function(){
  db.lastBackup = todayStr(); save();
  var blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download = "仙女獲利手帳備份_"+(db.name||"my")+"_"+todayStr()+".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); },1000);
  renderSettings();
  toast("備份檔已下載，記得存到雲端硬碟 ✨");
});

document.getElementById("doImport").addEventListener("click", function(){
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", function(e){
  var f=e.target.files[0]; if(!f) return;
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var d=JSON.parse(reader.result);
      if(!d || !Array.isArray(d.records)) throw new Error("格式不符");
      if(!confirm("匯入後會覆蓋這台裝置目前的紀錄（共 "+db.records.length+" 筆），確定要繼續嗎？")) return;
      db.name = d.name || db.name || "仙女";
      db.createdAt = d.createdAt || todayStr();
      db.records = d.records;
      db.lastBackup = d.lastBackup || "";
      save();
      toast("已匯入 "+d.records.length+" 筆紀錄 ✨");
      go("home");
    }catch(err){
      toast("這個檔案讀不到紀錄，請確認是手帳匯出的備份檔");
    }
  };
  reader.readAsText(f);
  e.target.value="";
});

document.getElementById("wipeAll").addEventListener("click", function(){
  if(!confirm("這會刪除這台裝置上的全部紀錄，且無法復原。確定嗎？")) return;
  if(!confirm("再確認一次：真的要清除全部紀錄嗎？")) return;
  localStorage.removeItem(KEY);
  db={ name:"", createdAt:"", records:[], lastBackup:"" };
  toast("已清除，手帳重新開始");
  go("welcome");
});

/* ============ 開場流程 ============ */
document.getElementById("goSetup").addEventListener("click", function(){ go("setup"); setTimeout(function(){ document.getElementById("nameInput").focus(); },200); });
document.getElementById("createBook").addEventListener("click", function(){
  var v=document.getElementById("nameInput").value.trim();
  if(!v){ toast("先告訴手帳怎麼稱呼你 ✨"); return; }
  db.name=v; db.createdAt=todayStr(); save();
  toast("手帳建立好了，歡迎"+v+" ✨");
  go("home");
});
document.getElementById("nameInput").addEventListener("keydown", function(e){
  if(e.key==="Enter") document.getElementById("createBook").click();
});

load();
go(db.name ? "home" : "welcome");

})();
