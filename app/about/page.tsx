"use client"

import { useState, useEffect } from "react"

export default function page ()  {
    const [items, setitems] = useState<string[]>([]);
    const [value, setvalue] = useState<string>("");


    useEffect(() => {
      loadData(); 
    }, [])
    
    const loadData = async ()=>{
        const res =await fetch('/api');
        const data = await res.json();
        setitems(data);
    }
  return (<>
     {items.map((item, index)=>(
        <div key={index}>{item}</div>
     ))}
    <div>page1</div>
  </>
  )
}