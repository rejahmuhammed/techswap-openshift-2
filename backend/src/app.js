require('dotenv').config();
const express=require('express'); const cors=require('cors'); const {Pool}=require('pg');
const app=express(); const PORT=process.env.PORT||3000;
app.use(cors({origin:true,credentials:true})); app.use(express.json());
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:undefined,max:10});
app.get('/health',(req,res)=>res.json({status:'ok',service:'techswap-backend',timestamp:new Date().toISOString()}));
app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}catch(e){res.status(503).json({status:'degraded',database:'unavailable'});}});
app.get('/api/products',async(req,res)=>{try{const r=await pool.query('SELECT id,name,brand,price,condition,description FROM products ORDER BY created_at DESC LIMIT 20');res.json({success:true,data:r.rows});}catch(e){console.error(e);res.json({success:true,data:[]});}});
app.get('/api/categories',async(req,res)=>{try{const r=await pool.query('SELECT id,name,slug FROM categories ORDER BY name');res.json(r.rows);}catch(e){res.json([]);}});
app.use((req,res)=>res.status(404).json({error:'Not found'}));
async function start(){try{await pool.query('SELECT 1');console.log('Database connected successfully');}catch(e){console.warn('Database not ready at startup:',e.message)} app.listen(PORT,'0.0.0.0',()=>console.log(`Server running on port ${PORT}`));}
start();
