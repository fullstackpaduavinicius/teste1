import { useState } from 'react';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';

export default function Signup() {
  const register = useAuth(s => s.register);
  const [f, setF] = useState({ name:'', email:'', phone:'', password:'', marketingOptIn:true });

  async function onSubmit(e){
    e.preventDefault();
    await register(f);
    toast.success('Cadastro criado! Confirme seu e-mail para ativar a conta.');
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Nome" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="E-mail" type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="Telefone (WhatsApp)" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="Senha" type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.marketingOptIn} onChange={e=>setF({...f,marketingOptIn:e.target.checked})}/>
          Aceito receber promoções e cupons por e-mail
        </label>
        <button className="w-full bg-black text-white rounded p-2">Criar conta</button>
      </form>
    </div>
  );
}
