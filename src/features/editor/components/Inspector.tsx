import { MousePointerSquareDashed, Palette, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import {
  isValidBirthDate,
  MAX_AGE,
  maxBirthDateIso,
  minBirthDateIso,
  normalizeColor,
  patchFromAgeInput,
} from '@/features/editor/entityStyle';
import { RelationPreview } from '@/features/editor/components/Previews';
import { isAnnotationShape, isPersonShape, shapeLabel } from '@/features/editor/shapes';
import type {
  EntityData,
  EntityNode,
  EntityShape,
  RelationData,
  RelationEdge,
  ToolCatalog,
} from '@/features/editor/types';

const SHAPE_OPTIONS: EntityShape[] = [
  'male',
  'female',
  'unknown',
  'pregnancy',
  'patient_male',
  'patient_female',
  'stillborn',
  'induced_abortion',
  'spontaneous_abortion',
  'disorder_untreated',
  'disorder_treated',
  'substance_use',
  'substance_recovery',
  'resource',
  'household',
];

type InspectorProps = {
  catalog: ToolCatalog;
  node: EntityNode | null;
  edge: RelationEdge | null;
  saving: boolean;
  onNodeChange: (id: string, patch: Partial<EntityData>) => void;
  onNodeDelete: (id: string) => void;
  onEdgeChange: (id: string, patch: Partial<RelationData>) => void;
  onEdgeDelete: (id: string) => void;
  onSave: () => void;
};

export function Inspector({
  catalog,
  node,
  edge,
  saving,
  onNodeChange,
  onNodeDelete,
  onEdgeChange,
  onEdgeDelete,
  onSave,
}: InspectorProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
      {node ? (
        <EntityForm
          catalog={catalog}
          node={node}
          saving={saving}
          onChange={onNodeChange}
          onDelete={onNodeDelete}
          onSave={onSave}
        />
      ) : edge ? (
        <RelationForm
          catalog={catalog}
          edge={edge}
          saving={saving}
          onChange={onEdgeChange}
          onDelete={onEdgeDelete}
          onSave={onSave}
        />
      ) : (
        <EmptySelection catalog={catalog} />
      )}
    </aside>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <h2 className="font-display text-sm font-bold tracking-wide text-slate-900 uppercase">
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function EntityForm({
  catalog,
  node,
  saving,
  onChange,
  onDelete,
  onSave,
}: {
  catalog: ToolCatalog;
  node: EntityNode;
  saving: boolean;
  onChange: (id: string, patch: Partial<EntityData>) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}) {
  const data = node.data;
  const isResource = data.shape === 'resource';
  const isHousehold = data.shape === 'household';
  const isAnnotation = isAnnotationShape(data.shape);
  const showPersonFields = isPersonShape(data.shape) && !isAnnotation;
  const set = (patch: Partial<EntityData>) => onChange(node.id, patch);

  return (
    <>
      <PanelHeader
        title={
          isResource
            ? 'Información de la red'
            : isHousehold
              ? 'Hogar conviviente'
              : isAnnotation
                ? 'Símbolo del genograma'
                : 'Información de la persona'
        }
        subtitle={
          isResource
            ? 'Describe el recurso del entorno y su papel en el caso.'
            : isHousehold
              ? 'Óvalo punteado: colócalo detrás de quienes viven en casa.'
              : 'Los cambios se reflejan en el lienzo de inmediato.'
        }
      />

      <div className="space-y-3.5 px-4 py-4">
        <Field label={isResource ? 'Nombre de la red' : 'Nombre'}>
          <Input
            value={data.name}
            onChange={(event) => set({ name: event.target.value })}
            placeholder={isResource ? 'Ej. Hospital San José' : 'Ej. María Pérez'}
          />
        </Field>

        {showPersonFields && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Edad"
                hint={`Máximo ${MAX_AGE} años. Se estima la fecha de nacimiento según la edad y la fecha de hoy.`}
              >
                <Input
                  value={data.age}
                  onChange={(event) => set(patchFromAgeInput(event.target.value))}
                  placeholder="Ej. 34"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Sexo">
                <Select value={data.sex} onChange={(event) => set({ sex: event.target.value as EntityData['sex'] })}>
                  <option value="">Sin dato</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="X">Otro</option>
                </Select>
              </Field>
            </div>

            <Field
              label="Fecha de nacimiento"
              hint={`No puede implicar más de ${MAX_AGE} años ni ser futura. Puedes corregirla manualmente; no cambia la edad.`}
            >
              <Input
                type="date"
                min={minBirthDateIso()}
                max={maxBirthDateIso()}
                value={data.birthDate}
                onChange={(event) => {
                  const value = event.target.value;
                  if (isValidBirthDate(value)) {
                    set({ birthDate: value });
                  }
                }}
              />
            </Field>

            <Field label="Ocupación">
              <Input
                value={data.occupation}
                onChange={(event) => set({ occupation: event.target.value })}
                placeholder="Ej. Docente"
              />
            </Field>

            <Field label="Parentesco" hint="Relación con la persona índice del caso.">
              <Input
                value={data.kinship}
                onChange={(event) => set({ kinship: event.target.value })}
                placeholder="Ej. Madre"
              />
            </Field>

            <Field label="Figura">
              <Select
                value={data.shape}
                onChange={(event) => set({ shape: event.target.value as EntityData['shape'] })}
              >
                {SHAPE_OPTIONS.map((shape) => (
                  <option key={shape} value={shape}>
                    {shapeLabel(shape)}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="space-y-2 rounded-xl bg-slate-50 px-3 py-3">
              <Checkbox
                label="Convive en el hogar"
                checked={data.cohabits}
                onChange={(checked) => set({ cohabits: checked })}
              />
              <Checkbox
                label="Persona fallecida"
                checked={data.deceased}
                onChange={(checked) => set({ deceased: checked })}
              />
              <Checkbox
                label="Persona índice del caso"
                checked={data.isIndex}
                onChange={(checked) => set({ isIndex: checked })}
              />
            </div>

            <DisplayOptions data={data} isResource={false} set={set} />

            <AppearanceSection data={data} set={set} />
          </>
        )}

        {isResource && (
          <>
            <DisplayOptions data={data} isResource set={set} />
            <AppearanceSection data={data} set={set} />
          </>
        )}

        {(isHousehold || isAnnotation) && (
          <>
            <Field label="Figura">
              <Select
                value={data.shape}
                onChange={(event) => set({ shape: event.target.value as EntityData['shape'] })}
              >
                {SHAPE_OPTIONS.map((shape) => (
                  <option key={shape} value={shape}>
                    {shapeLabel(shape)}
                  </option>
                ))}
              </Select>
            </Field>
            <AppearanceSection data={data} set={set} />
          </>
        )}

        <Field label="Observaciones">
          <Textarea
            value={data.notes}
            onChange={(event) => set({ notes: event.target.value })}
            placeholder={
              isResource
                ? 'Frecuencia de contacto, calidad del servicio, barreras de acceso…'
                : 'Situación de salud, escolaridad, hechos relevantes…'
            }
          />
        </Field>

        <p className="text-[11px] text-slate-400">
          Elemento de {catalog.name.toLowerCase()}.
        </p>
      </div>

      <FormActions saving={saving} onSave={onSave} onDelete={() => onDelete(node.id)} />
    </>
  );
}

function RelationForm({
  catalog,
  edge,
  saving,
  onChange,
  onDelete,
  onSave,
}: {
  catalog: ToolCatalog;
  edge: RelationEdge;
  saving: boolean;
  onChange: (id: string, patch: Partial<RelationData>) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}) {
  const current = edge.data?.relation ?? catalog.relations[0].id;
  const definition = catalog.relations.find((item) => item.id === current) ?? catalog.relations[0];

  return (
    <>
      <PanelHeader
        title="Información del vínculo"
        subtitle="Define qué tipo de relación une a los dos elementos."
      />

      <div className="space-y-3.5 px-4 py-4">
        <div className="space-y-1">
          {catalog.relations.map((relation) => (
            <label
              key={relation.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="relation"
                className="accent-brand-600"
                checked={relation.id === current}
                onChange={() => onChange(edge.id, { relation: relation.id })}
              />
              <RelationPreview relation={relation} />
              <span className="text-xs font-medium text-slate-700">{relation.label}</span>
            </label>
          ))}
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          {definition.hint}
        </p>

        <Field label="Observación" hint="Aparece como etiqueta sobre la línea.">
          <Input
            value={edge.data?.note ?? ''}
            onChange={(event) => onChange(edge.id, { note: event.target.value })}
            placeholder="Ej. Contacto solo en vacaciones"
          />
        </Field>

        <RelationAppearanceSection
          strokeColor={edge.data?.strokeColor ?? ''}
          defaultColor={definition.color}
          onChange={(strokeColor) => onChange(edge.id, { strokeColor })}
        />
      </div>

      <FormActions saving={saving} onSave={onSave} onDelete={() => onDelete(edge.id)} />
    </>
  );
}

function FormActions({
  saving,
  onSave,
  onDelete,
}: {
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-auto flex gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
      <Button size="sm" onClick={onSave} loading={saving} className="flex-1">
        <Save className="h-4 w-4" />
        Guardar
      </Button>
      <Button size="sm" variant="danger" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}

function DisplayOptions({
  data,
  isResource,
  set,
}: {
  data: EntityData;
  isResource: boolean;
  set: (patch: Partial<EntityData>) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 px-3 py-3">
      <p className="text-xs font-semibold text-slate-700">Texto en el símbolo</p>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Elige qué datos se muestran dentro de la figura. También puedes hacer doble clic sobre
        el símbolo para editar nombre y edad al instante.
      </p>
      {!isResource && (
        <>
          <Checkbox
            label="Mostrar edad dentro del símbolo"
            checked={data.showAge !== false}
            onChange={(checked) => set({ showAge: checked })}
          />
          <Checkbox
            label="Mostrar fecha de nacimiento dentro del símbolo"
            checked={data.showBirthDate}
            onChange={(checked) => set({ showBirthDate: checked })}
          />
        </>
      )}
      <Checkbox
        label="Mostrar nombre dentro del símbolo"
        checked={data.showNameInside}
        onChange={(checked) => set({ showNameInside: checked })}
      />
    </div>
  );
}

function AppearanceSection({
  data,
  set,
}: {
  data: EntityData;
  set: (patch: Partial<EntityData>) => void;
}) {
  const hasCustomColors = Boolean(data.strokeColor || data.fillColor || data.textColor);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 px-3 py-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-slate-500" />
        <p className="text-xs font-semibold text-slate-700">Colores del símbolo</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ColorField
          label="Borde"
          value={data.strokeColor}
          fallback="#334155"
          onChange={(value) => set({ strokeColor: normalizeColor(value) })}
        />
        <ColorField
          label="Fondo"
          value={data.fillColor}
          fallback="#ffffff"
          onChange={(value) => set({ fillColor: normalizeColor(value) })}
        />
        <ColorField
          label="Texto"
          value={data.textColor}
          fallback="#475569"
          onChange={(value) => set({ textColor: normalizeColor(value) })}
        />
      </div>
      {hasCustomColors && (
        <button
          type="button"
          onClick={() => set({ strokeColor: '', fillColor: '', textColor: '' })}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
        >
          Restaurar colores por convención
        </button>
      )}
    </div>
  );
}

function RelationAppearanceSection({
  strokeColor,
  defaultColor,
  onChange,
}: {
  strokeColor: string;
  defaultColor: string;
  onChange: (strokeColor: string) => void;
}) {
  const hasCustomColor = Boolean(strokeColor);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 px-3 py-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-slate-500" />
        <p className="text-xs font-semibold text-slate-700">Color de la línea</p>
      </div>

      <ColorField
        label="Trazo"
        value={strokeColor}
        fallback={defaultColor}
        onChange={(value) => onChange(normalizeColor(value))}
      />

      {hasCustomColor && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
        >
          Restaurar color por convención
        </button>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const display = value || fallback;

  return (
    <Field label={label}>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={display}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={fallback}
          className="min-w-0 font-mono text-[11px]"
        />
      </div>
    </Field>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
      />
      {label}
    </label>
  );
}

function EmptySelection({ catalog }: { catalog: ToolCatalog }) {
  return (
    <>
      <PanelHeader title="Detalle" subtitle="Aquí aparecen los datos de lo que selecciones." />
      <div className="px-4 py-8 text-center">
        <MousePointerSquareDashed className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">Nada seleccionado</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Haz clic sobre una figura para registrar sus datos, o sobre una línea para cambiar el tipo
          de vínculo.
        </p>
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Convenciones
        </h3>
        <ul className="space-y-1.5">
          {catalog.relations.map((relation) => (
            <li key={relation.id} className="flex items-center gap-2">
              <RelationPreview relation={relation} />
              <span className="text-[11px] text-slate-600">{relation.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
