// Concursantes por categoría, en orden de inscripción.
// Corte del 12-nov-2026. Para agregar o quitar a alguien, edita estas listas
// y pulsa «Reiniciar esta categoría» en la pantalla.

export const CATEGORIAS = [
  {
    id: 'table-topics',
    nombre: 'Table Topics',
    nota: 'Respuesta de 1 a 2 minutos. Mismo tema para todos.',
    concursantes: ['Carlos A. Sánchez', 'Fátima Vital', 'Bolívar Pedroza'],
  },
  {
    id: 'relatos',
    nombre: 'Relatos Fantásticos',
    nota: 'Relato de 3 a 5 minutos.',
    concursantes: ['Carlos A. Sánchez', 'Gabriela Alquicirez', 'Fátima Vital', 'Bolívar Pedroza'],
  },
  {
    id: 'oratoria',
    nombre: 'Oratoria en español',
    nota: 'Discurso de 5 a 7 minutos.',
    concursantes: ['Carlos A. Sánchez', 'Samuel Pérez', 'Gabriela Meneses', 'Edgar Uribe', 'Wendolyn García'],
  },
  {
    id: 'international',
    nombre: 'International Speech',
    nota: 'Discurso en inglés de 5 a 7 minutos.',
    concursantes: ['Carlos A. Sánchez', 'Samuel Pérez'],
  },
]

// Foto de cada concursante: public/fotos/<slug>.jpg. Si falta el archivo, se muestran las iniciales.
export const FOTOS = {
  'Carlos A. Sánchez': 'carlos-sanchez',
  'Samuel Pérez': 'samuel-perez',
  'Fátima Vital': 'fatima-vital',
  'Bolívar Pedroza': 'bolivar-pedroza',
  'Gabriela Alquicirez': 'gabriela-alquicirez',
  'Gabriela Meneses': 'gabriela-meneses',
  'Edgar Uribe': 'edgar-uribe',
  'Wendolyn García': 'wendolyn-garcia',
}
