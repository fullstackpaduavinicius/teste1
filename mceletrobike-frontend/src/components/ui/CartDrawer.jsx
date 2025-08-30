import * as Dialog from '@radix-ui/react-dialog';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardBody } from './ui/card';

export default function CartDrawer({ items = [], onCheckout }) {
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary"><ShoppingCart size={18}/> Carrinho ({items.length})</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed right-0 top-0 h-dvh w-[92vw] max-w-md bg-white shadow-xl p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-lg font-semibold">Seu carrinho</Dialog.Title>
            <Dialog.Close className="p-2 rounded-lg hover:bg-black/5"><X/></Dialog.Close>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100dvh-160px)] pr-1">
            {items.length === 0 ? (
              <p className="text-sm text-black/60">Seu carrinho está vazio.</p>
            ) : items.map((it) => (
              <Card key={it.id}><CardBody className="flex items-center gap-3">
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded-lg"/>
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-black/60">x{it.qty}</div>
                </div>
                <div className="font-semibold">
                  {it.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
                </div>
              </CardBody></Card>
            ))}
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between mb-3">
              <span className="text-black/70">Subtotal</span>
              <span className="font-semibold">
                {subtotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
              </span>
            </div>
            <Button className="w-full" onClick={onCheckout}>Finalizar compra</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
