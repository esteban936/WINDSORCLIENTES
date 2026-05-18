import { Button } from '../ui/Button';

const initial = {
  nombre: '',
  email: '',
  celular: '',
  fecha_nacimiento: '',
  direccion: '',
  localidad: '',
  ocupacion: '',
  como_llego: '',
  talle_habitual: '',
  preferencias: '',
  notas: '',
};

export function ClienteForm({ value = initial, onSubmit, submitLabel = 'Guardar cambios', extraAction }) {
  const formValue = { ...initial, ...value };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') payload[key] = null;
    });
    onSubmit(payload, event.nativeEvent.submitter?.value);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <label className="col-span-2">
        <span className="label">Nombre *</span>
        <input className="field mt-1" name="nombre" defaultValue={formValue.nombre ?? ''} required autoFocus />
      </label>
      <label>
        <span className="label">Email</span>
        <input className="field mt-1" name="email" type="email" defaultValue={formValue.email ?? ''} />
      </label>
      <label>
        <span className="label">Celular</span>
        <input className="field mt-1" name="celular" defaultValue={formValue.celular ?? ''} />
      </label>
      <label>
        <span className="label">Fecha de nacimiento</span>
        <input className="field mt-1" name="fecha_nacimiento" type="date" defaultValue={formValue.fecha_nacimiento ?? ''} />
      </label>
      <label>
        <span className="label">Localidad</span>
        <input className="field mt-1" name="localidad" defaultValue={formValue.localidad ?? ''} />
      </label>
      <label className="col-span-2">
        <span className="label">Dirección</span>
        <input className="field mt-1" name="direccion" defaultValue={formValue.direccion ?? ''} />
      </label>
      <label>
        <span className="label">Ocupación</span>
        <input className="field mt-1" name="ocupacion" defaultValue={formValue.ocupacion ?? ''} />
      </label>
      <label>
        <span className="label">Cómo llegó</span>
        <select className="field mt-1" name="como_llego" defaultValue={formValue.como_llego ?? ''}>
          <option value="">Sin especificar</option>
          <option value="referido">Referido</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google</option>
          <option value="paso_por_local">Pasó por el local</option>
          <option value="otro">Otro</option>
        </select>
      </label>
      <label>
        <span className="label">Talle habitual</span>
        <input className="field mt-1" name="talle_habitual" defaultValue={formValue.talle_habitual ?? ''} />
      </label>
      <label className="col-span-2">
        <span className="label">Preferencias</span>
        <textarea className="field mt-1 min-h-24" name="preferencias" defaultValue={formValue.preferencias ?? ''} />
      </label>
      <label className="col-span-2">
        <span className="label">Notas</span>
        <textarea className="field mt-1 min-h-24" name="notas" defaultValue={formValue.notas ?? ''} />
      </label>
      <div className="col-span-2 flex justify-end gap-3">
        {extraAction}
        <Button type="submit" value="save">{submitLabel}</Button>
      </div>
    </form>
  );
}

