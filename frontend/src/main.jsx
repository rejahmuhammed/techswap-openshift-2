import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

const API=(import.meta.env.VITE_API_URL||'/api').replace(/\/$/,'');
function App(){
 const [health,setHealth]=useState('Checking backend…'); const [products,setProducts]=useState([]); const [problem,setProblem]=useState(''); const [result,setResult]=useState(null);
 useEffect(()=>{fetch(`${API.replace(/\/api$/,'')}/health`).then(r=>r.json()).then(d=>setHealth(`Backend: ${d.status}`)).catch(()=>setHealth('Backend unavailable')); fetch(`${API}/products`).then(r=>r.json()).then(d=>setProducts(d.data||[])).catch(()=>{});},[]);
 const solve=()=>{const p=problem.toLowerCase(); let rec=p.includes('slow')||p.includes('storage')?['SSD','RAM']:p.includes('display')?['Monitor','Graphics Card']:p.includes('phone')?['Smartphone']:['Laptop','SSD']; setResult(rec);};
 return <div><header><div className="nav"><b>TechSwap</b><span>Buy · Sell · Problem Solver</span><a href="/health" target="_blank">API Health</a></div></header><main>
 <section className="hero"><div><p className="tag">CLOUD & DEVOPS DEMO</p><h1>TechSwap</h1><p>Electronics marketplace powered by React, Node.js, PostgreSQL and OpenShift.</p><div className="status">{health}</div></div></section>
 <section className="card"><h2>Problem Solver</h2><p>Describe your device problem and get a quick recommendation.</p><textarea value={problem} onChange={e=>setProblem(e.target.value)} placeholder="My laptop is very slow and needs more storage…"/><button onClick={solve}>Find Solutions</button>{result&&<div className="result"><b>Recommended:</b> {result.join(' · ')}</div>}</section>
 <section><h2>Marketplace</h2><div className="grid">{products.length?products.map(p=><div className="product" key={p.id}><h3>{p.name}</h3><p>{p.brand||'Tech'} · {p.condition||'PRE_OWNED'}</p><strong>₹{p.price}</strong></div>):['Kingston 1TB SSD','Corsair 16GB RAM','Samsung Galaxy S23'].map((x,i)=><div className="product" key={x}><h3>{x}</h3><p>Demo marketplace item</p><strong>₹{[3200,2800,32000][i]}</strong></div>)}</div></section>
 <section className="devops"><h2>OpenShift Deployment</h2><div className="grid small"><div><b>Frontend</b><br/>React + Vite + Nginx</div><div><b>Backend</b><br/>Node.js + Express</div><div><b>Database</b><br/>PostgreSQL + PVC</div><div><b>Platform</b><br/>OpenShift 4.21</div></div></section>
 </main></div>}
createRoot(document.getElementById('root')).render(<App/>);
