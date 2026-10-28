(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.TimeModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TYPES={vacation:'Urlaub',special:'Sonderurlaub',unpaid:'Unbezahlter Urlaub',sick:'Krankheit',childSick:'Kind krank',parent:'Elternzeit',overtime:'Überstundenabbau'};
const DEFAULT_WEEK=['office','home','office','home','home'];
const LOC={office:'Büro',home:'Home Office',travel:'Dienstreise'};
const pad=n=>String(n).padStart(2,'0');
function dateKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function parseDate(s){let [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);}
function addDays(s,n){let d=parseDate(s);d.setDate(d.getDate()+n);return dateKey(d);}
function daysBetween(a,b){let out=[];for(let k=a;k<=b;k=addDays(k,1))out.push(k);return out;}
function weekday(s){return (parseDate(s).getDay()+6)%7;}
function easter(y){let a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return dateKey(new Date(y,month-1,day,12));}
function holiday(s){const y=+s.slice(0,4);let fixed={'01-01':'Neujahr','05-01':'Tag der Arbeit','10-03':'Tag der Deutschen Einheit','11-01':'Allerheiligen','12-25':'1. Weihnachtstag','12-26':'2. Weihnachtstag'};let f=fixed[s.slice(5)];if(f)return f;let e=easter(y),mov=[[-2,'Karfreitag'],[1,'Ostermontag'],[39,'Christi Himmelfahrt'],[50,'Pfingstmontag'],[60,'Fronleichnam']];return mov.find(x=>addDays(e,x[0])===s)?.[1]||null;}
function minutes(t){if(!t)return null;let [h,m]=t.split(':').map(Number);return h*60+m;}
function duration(start,end){if(!start||!end)return 0;let n=minutes(end)-minutes(start);return n<0?n+1440:n;}
function fmt(n){let sign=n<0?'−':'';n=Math.abs(Math.round(n));return `${sign}${Math.floor(n/60)}:${pad(n%60)}`;}
function signed(n){return (n>0?'+':'')+fmt(n);}
function defaults(today=dateKey(new Date())){return {version:1,startDate:today,initialBalance:0,defaultBreak:60,weeklyRules:[{from:'1900-01-01',hours:40}],locationRules:[{from:'1900-01-01',week:[...DEFAULT_WEEK]}],annualAllowance:30,vacationYears:{},entries:{},notified:{}};}
function rule(rules,date){return [...(rules||[])].filter(r=>r.from<=date).sort((a,b)=>b.from.localeCompare(a.from))[0]||rules?.[0];}
function dailyTarget(s,data){let w=weekday(s);return w>4?0:Math.round((Number(rule(data.weeklyRules,s)?.hours)||0)*60/5);}
function standardLoc(s,data){return rule(data.locationRules,s)?.week?.[weekday(s)]||'home';}
function entry(s,data,today=dateKey(new Date())){if(s<data.startDate)return null;let raw=data.entries[s];if(raw)return {...raw,source:'manual'};if(s>=today||weekday(s)>4||holiday(s))return null;return {type:'auto',net:dailyTarget(s,data),location:standardLoc(s,data),source:'auto'};}
function parentMonths(data,year){let months=[];for(let m=1;m<=12;m++){let last=new Date(year,m,0).getDate(),start=`${year}-${pad(m)}-01`,end=`${year}-${pad(m)}-${pad(last)}`;if(daysBetween(start,end).every(d=>data.entries[d]?.type==='parent'))months.push(m);}return months;}
function vacationQuota(data,year){let cfg=data.vacationYears[year]||{};let annual=Number(data.annualAllowance)||0;let defaultBase=annual;if(data.startDate.slice(0,4)===String(year)){let month=+data.startDate.slice(5,7);defaultBase=Math.ceil((13-month)*annual/12);}let base=cfg.base===undefined?defaultBase:Number(cfg.base);let reduction=parentMonths(data,year).length*annual/12;return {base,carry:Number(cfg.carry)||0,adjustment:Number(cfg.adjustment)||0,reduction};}
function vacationUsed(data,year){return Object.entries(data.entries).filter(([d,e])=>d.slice(0,4)===String(year)&&['vacation','special','unpaid'].includes(e.type)&&weekday(d)<5&&!holiday(d)).length;}
function vacationBalance(data,year){let q=vacationQuota(data,year);return {...q,used:vacationUsed(data,year),remaining:q.base+q.carry+q.adjustment-q.reduction-vacationUsed(data,year)};}
function creditFactor(raw){const n=Number(raw?.factor);return Number.isFinite(n)&&n>=0&&n<=500?n/100:1;}
function day(s,data,today=dateKey(new Date()),now=new Date()){
 const wd=weekday(s),hol=holiday(s),target=dailyTarget(s,data),raw=entry(s,data,today);let type=raw?.type||null,location=raw?.location||standardLoc(s,data);let actual=0,credited=0,balance=0,net=0,auto=false,estimated=false,breakM=raw?.breakM??data.defaultBreak;
 if(type==='work'){if(raw.end){net=Math.max(0,duration(raw.start,raw.end)-breakM);actual=net;}else if(s<today){net=target;actual=net;auto=true;estimated=true;}else if(s===today){let current=now.getHours()*60+now.getMinutes();let elapsed=current-minutes(raw.start);if(elapsed<0)elapsed+=1440;net=Math.max(0,elapsed-(data.defaultBreak||0));estimated=true;}}
 else if(type==='auto'){net=Number(raw.net)||target;actual=net;auto=true;}
 else if(type==='vacation'||type==='special'||type==='sick'){credited=s<=today?target:0;}
 else if(type==='unpaid'||type==='parent'||type==='overtime'){credited=0;}
 else if(hol){credited=s<=today?target:0;}
 // On nonworking holidays the daily target is satisfied, and worked holiday hours add at 1.5x.
 if(hol&&type==='work')credited=target;
 let applicableTarget=(type==='parent'||type==='unpaid'||type==='childSick')?0:target;
 let workCredit=actual*((wd>4||hol)?creditFactor(raw):1);
 balance=workCredit+credited-(s<=today?applicableTarget:0);
 if(s===today&&!raw)balance=0;
 // Live running work is not included in finalized balances until punched out.
 if(type==='work'&&!raw.end&&s===today){balance=0;actual=0;workCredit=0;}
 return {date:s,weekday:wd,holiday:hol,target:applicableTarget,raw,type,location,actual,net,credited,workCredit,balance,auto,estimated,breakM,finished:!!raw?.end,factor:(wd>4||hol)?Math.round(creditFactor(raw)*100):100};
}
function period(data,from,to,today=dateKey(new Date())){if(!from||!to||from>to)return [];let start=from<data.startDate?data.startDate:from;return start>to?[]:daysBetween(start,to).map(d=>day(d,data,today));}
function totals(rows,data){let worked=0,credited=0,balance=0,office=0,home=0,travel=0,auto=0;let absence={vacation:0,special:0,unpaid:0,sick:0,childSick:0,parent:0,holiday:0};for(let d of rows){worked+=d.actual;credited+=d.credited;balance+=d.balance;if(d.auto)auto++;if((d.type==='work'||d.type==='auto')&&d.actual>0){const regular=d.weekday<5&&!d.holiday;const approvedExtra=(d.weekday>4||!!d.holiday)&&d.factor===150;if(regular||approvedExtra){if(d.location==='office')office++;else if(d.location==='home')home++;else if(d.location==='travel')travel++;}}if(absence[d.type]!==undefined)absence[d.type]++;else if(d.holiday)absence.holiday++;}return {worked,credited,balance,office,home,travel,auto,absence,finalBalance:(Number(data.initialBalance)||0)+balance};}
function merge(current,backup){if(!backup||backup.version!==1||typeof backup.entries!=='object'||!backup.weeklyRules||!backup.locationRules)throw Error('Ungültige oder nicht unterstützte Sicherungsdatei.');return {...current,...backup,entries:{...current.entries,...backup.entries},vacationYears:{...current.vacationYears,...backup.vacationYears},notified:{...current.notified,...backup.notified}};}
return {creditFactor,TYPES,LOC,DEFAULT_WEEK,pad,dateKey,parseDate,addDays,daysBetween,weekday,easter,holiday,minutes,duration,fmt,signed,defaults,rule,dailyTarget,standardLoc,entry,parentMonths,vacationQuota,vacationBalance,day,period,totals,merge};
});
