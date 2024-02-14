"use client";

import { Loader2, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export default function NewRecord() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const beginRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  async function handle() {
    if (!beginRef.current || !endRef.current) return;
    setIsSaving(true);
    await fetch(`/api/records`, {
      method: "POST",
      body: JSON.stringify({
        begin: new Date(beginRef.current.value).toISOString(),
        end: new Date(endRef.current.value).toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());
    setIsSaving(false);
    router.refresh();
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isSaving}
          className="inline-flex items-center"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <PlusCircle />}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0" />
        <Dialog.Content className="rounded-xl drop-shadow-lg bg-white p-4 fixed top-28 left-1/2 -translate-x-1/2">
          <Dialog.Title className="text-lg font-bold">
            Novo registro
          </Dialog.Title>
          <Dialog.Description className="text-sm">
            Criar um novo registro manualmente.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              className="absolute top-[10px] right-[10px]"
              aria-label="Close"
            >
              <X />
            </button>
          </Dialog.Close>
          <div className="flex flex-col gap-4 mt-4">
            <label htmlFor="begin">
              Início
              <input
                id="begin"
                type="datetime-local"
                ref={beginRef}
                className="block"
              />
            </label>
            <label htmlFor="end">
              Fim
              <input
                id="end"
                type="datetime-local"
                ref={endRef}
                className="block"
              />
            </label>
            <button
              onClick={() => {
                handle();
              }}
            >
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
