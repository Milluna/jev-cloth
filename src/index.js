export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/jev") {
      if (request.method !== "POST") return Response.json({error:"Method not allowed"},{status:405});
      if (!env.TYPESAFE_API_KEY) return Response.json({error:"TYPESAFE_API_KEY binding is not configured"},{status:500});
      let apiKey;
      try { apiKey = await env.TYPESAFE_API_KEY.get(); }
      catch { return Response.json({error:"Failed to read TYPESAFE_API_KEY from Secrets Store"},{status:500}); }
      if (!apiKey) return Response.json({error:"TYPESAFE_API_KEY is empty"},{status:500});
      let body;
      try { body = await request.json(); }
      catch { return Response.json({error:"Invalid JSON"},{status:400}); }
      body.model = "jev-1.13.0";
      const upstream = await fetch("https://api.typesafe.ai/v1/systemone", {
        method:"POST",
        headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},
        body:JSON.stringify(body)
      });
      return new Response(await upstream.text(), {
        status:upstream.status,
        headers:{"Content-Type":upstream.headers.get("Content-Type")||"application/json","Cache-Control":"no-store"}
      });
    }
    return env.ASSETS.fetch(request);
  }
};