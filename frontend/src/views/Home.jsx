import React from 'react'
import { createMenuItem } from '../controllers/api'

export default function Home(){
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState('')

  async function handleCreate(){
    setLoading(true)
    setMsg('')
    try{
      const item = await createMenuItem({ name: 'Teste', description: 'Item de teste', price: 9.9 });
      setMsg('Criado id: ' + item.id);
    }catch(e){
      setMsg('Erro: ' + (e.message || e));
    }finally{ setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <h1>App React (Frontend)</h1>
      <p>Monorepo inicial — conecte com a API em <code>/api</code>.</p>
      <button onClick={handleCreate} disabled={loading} style={{padding:'8px 12px'}}>
        {loading ? 'Enviando...' : 'Cadastrar produto'}
      </button>
      <div style={{marginTop:12}}>{msg}</div>
    </div>
  )
}
