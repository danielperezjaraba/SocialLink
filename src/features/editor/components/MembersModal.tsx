import { useEffect, useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { patchFromAgeInput } from '@/features/editor/entityStyle';
import {
  buildFamilyDiagram,
  emptyMember,
  GENERATION_LABELS,
  type FamilyGeneration,
  type FamilyMember,
} from '@/features/editor/layout';
import type { Diagram, Sex } from '@/features/editor/types';

type MembersModalProps = {
  open: boolean;
  onClose: () => void;
  onGenerate: (diagram: Diagram) => void;
};

/**
 * Atajo del familiograma: en lugar de colocar cada figura a mano, se listan los
 * integrantes y la plataforma arma el esquema ordenado por generaciones.
 */
export function MembersModal({ open, onClose, onGenerate }: MembersModalProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (open) {
      setMembers([
        { ...emptyMember(), kinship: 'Jefe o jefa de hogar', sex: 'F', generation: 2 },
        { ...emptyMember(), kinship: 'Compañero o compañera', sex: 'M', generation: 2 },
        { ...emptyMember(), kinship: 'Hijo o hija', sex: 'F', generation: 3 },
      ]);
    }
  }, [open]);

  const update = (id: string, patch: Partial<FamilyMember>) => {
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    );
  };

  const handleGenerate = () => {
    onGenerate(buildFamilyDiagram(members));
    onClose();
  };

  const named = members.filter((member) => member.name.trim().length > 0).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar esquema desde los integrantes"
      description="Registra quiénes componen la familia y la plataforma los organiza por generaciones."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={named === 0}>
            <Wand2 className="h-4 w-4" />
            Generar esquema
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-xl border border-slate-200 p-3">
            <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_auto_auto]">
              <Input
                value={member.name}
                onChange={(event) => update(member.id, { name: event.target.value })}
                placeholder="Nombre"
              />
              <Input
                value={member.kinship}
                onChange={(event) => update(member.id, { kinship: event.target.value })}
                placeholder="Parentesco"
              />
              <Input
                value={member.age}
                onChange={(event) => update(member.id, { age: patchFromAgeInput(event.target.value).age })}
                placeholder="Edad"
                className="sm:w-20"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Quitar integrante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-center">
              <Select
                value={member.sex}
                onChange={(event) => update(member.id, { sex: event.target.value as Sex })}
              >
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="X">Sin dato</option>
              </Select>

              <Select
                value={member.generation}
                onChange={(event) =>
                  update(member.id, {
                    generation: Number(event.target.value) as FamilyGeneration,
                  })
                }
              >
                {([1, 2, 3] as FamilyGeneration[]).map((generation) => (
                  <option key={generation} value={generation}>
                    {GENERATION_LABELS[generation]}
                  </option>
                ))}
              </Select>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={member.cohabits}
                  onChange={(event) => update(member.id, { cohabits: event.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                />
                Convive
              </label>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => setMembers((current) => [...current, emptyMember()])}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          Agregar integrante
        </Button>

        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Al generar el esquema se reemplaza el contenido actual del lienzo.
        </p>
      </div>
    </Modal>
  );
}
