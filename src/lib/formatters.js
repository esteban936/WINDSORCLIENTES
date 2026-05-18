export const humanize = (value = '') =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace('Muneca', 'Muñeca')
    .replace('Pantalon', 'Pantalón')
    .replace('Bicep', 'Bíceps');

export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}`));
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const today = () => new Date().toISOString().slice(0, 10);

export const ageOnNextBirthday = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const birthdayThisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (birthdayThisYear < now) age += 1;
  return age;
};

export const summarizePrendas = (prendas = []) =>
  prendas.map((item) => `${humanize(item.prenda)}${item.detalle ? `: ${item.detalle}` : ''}`).join(', ');

