let items: string[] =["vikas", "rahul"];

export async function GET(){
    return new Response (JSON.stringify(items), {status:200})
}

export async function POST(request: Request){
    const {res} = await  request.json();
    items.push(res);
    return new Response (JSON.stringify(items), {status:201})
}