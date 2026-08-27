export async function fetchHealth(){
  const res = await fetch('/api/health');
  if(!res.ok) throw new Error('Network error');
  return res.json();
}

export async function createMenuItem(payload){
  const res = await fetch('/api/menuitems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('Failed to create');
  return res.json();
}
