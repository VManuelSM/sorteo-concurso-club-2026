import './style.css'
import { CATEGORIAS, FOTOS } from './concursantes.js'

const CLAVE = 'sorteo-concurso-club-2026'
const DURACION_MS = 5200
const COLORES = ['#004165', '#772432', '#A9B2B1', '#F2DF74', '#0f6a8b', '#9b3b4a', '#cd202c', '#5b6770']
const TEXTO_OSCURO = new Set(['#A9B2B1', '#F2DF74'])
const ORDINALES = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo']

const $ = (id) => document.getElementById(id)

// Avatar circular: iniciales debajo y la foto encima; si la foto no carga, se retira sola.
function avatar(nombre, clase = '') {
  const partes = nombre.replace(/\b[A-ZÁÉÍÓÚ]\.\s*/g, '').trim().split(/\s+/)
  const iniciales = (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
  const slug = FOTOS[nombre]
  const foto = slug
    ? `<img src="${import.meta.env.BASE_URL}fotos/${slug}.jpg" alt="" onerror="this.remove()">`
    : ''
  return `<span class="avatar ${clase}"><span aria-hidden="true">${iniciales}</span>${foto}</span>`
}
const ruleta = $('ruleta')
const botonGirar = $('girar')

// estado: { [idCategoria]: [nombres en el orden sorteado] }
let estado = cargar()
let activa = CATEGORIAS[0].id
let girando = false
let rotacion = 0

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}')
    const limpio = {}
    for (const c of CATEGORIAS) {
      const orden = Array.isArray(guardado[c.id]) ? guardado[c.id] : []
      // Descarta nombres que ya no estén en la lista de la categoría.
      limpio[c.id] = orden.filter((n) => c.concursantes.includes(n))
    }
    return limpio
  } catch {
    return Object.fromEntries(CATEGORIAS.map((c) => [c.id, []]))
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // Sin almacenamiento el sorteo sigue funcionando; sólo no sobrevive a recargar.
  }
}

const categoria = () => CATEGORIAS.find((c) => c.id === activa)
const pendientes = (c = categoria()) => c.concursantes.filter((n) => !estado[c.id].includes(n))
const terminada = (c) => estado[c.id].length === c.concursantes.length

// Entero aleatorio sin sesgo en [0, n), con el generador criptográfico del navegador.
function azar(n) {
  const limite = Math.floor(0x100000000 / n) * n
  const celda = new Uint32Array(1)
  do crypto.getRandomValues(celda)
  while (celda[0] >= limite)
  return celda[0] % n
}

function punto(grados, radio) {
  const rad = ((grados - 90) * Math.PI) / 180
  return [radio * Math.cos(rad), radio * Math.sin(rad)]
}

function dibujarRuleta() {
  const nombres = pendientes()
  const n = nombres.length
  rotacion = 0
  ruleta.style.transition = 'none'
  ruleta.style.transform = 'rotate(0deg)'

  if (n === 0) {
    ruleta.innerHTML = `
      <circle r="200" fill="#004165" />
      <text class="ruleta__fin" y="-6">Orden</text>
      <text class="ruleta__fin" y="34">sorteado</text>`
    return
  }

  const paso = 360 / n
  let svg = ''
  nombres.forEach((nombre, i) => {
    const color = COLORES[i % COLORES.length]
    const tinta = TEXTO_OSCURO.has(color) ? '#1d2733' : '#ffffff'
    if (n === 1) {
      svg += `<circle r="200" fill="${color}" />`
    } else {
      const [x1, y1] = punto(i * paso - paso / 2, 200)
      const [x2, y2] = punto(i * paso + paso / 2, 200)
      const grande = paso > 180 ? 1 : 0
      svg += `<path d="M0 0 L${x1} ${y1} A200 200 0 ${grande} 1 ${x2} ${y2} Z" fill="${color}" stroke="#ffffff" stroke-width="2" />`
    }
    // El texto corre del centro hacia el borde, sobre el eje del sector.
    // El nombre debe caber entre el botón central y el borde.
    const tamano = Math.min(18, 142 / (nombre.length * 0.6)).toFixed(1)
    svg += `<text class="ruleta__nombre" transform="rotate(${i * paso - 90})" x="188" y="0" fill="${tinta}" font-size="${tamano}">${nombre}</text>`
  })
  svg += '<circle r="200" fill="none" stroke="#ffffff" stroke-width="6" />'
  ruleta.innerHTML = svg
}

function dibujarPestanas() {
  $('pestanas').innerHTML = CATEGORIAS.map((c) => {
    const hechos = estado[c.id].length
    const total = c.concursantes.length
    const clase = ['pestana', c.id === activa ? 'pestana--activa' : '', terminada(c) ? 'pestana--lista' : ''].join(' ')
    return `<button type="button" class="${clase}" data-id="${c.id}">
      <span class="pestana__nombre">${c.nombre}</span>
      <span class="pestana__cuenta">${terminada(c) ? 'Sorteado' : `${hechos} de ${total}`}</span>
    </button>`
  }).join('')
}

function dibujarOrden() {
  const c = categoria()
  const orden = estado[c.id]
  $('orden-titulo').textContent = c.nombre
  $('orden-nota').textContent = c.nota
  $('orden-lista').innerHTML = c.concursantes
    .map((_, i) => {
      const nombre = orden[i]
      const foto = nombre ? avatar(nombre) : ''
      return `<li class="${nombre ? 'ocupado' : 'vacio'}"><span class="orden__n">${i + 1}</span>${foto}<span>${nombre || 'Por sortear'}</span></li>`
    })
    .join('')

  const faltan = pendientes().length
  botonGirar.disabled = girando || faltan === 0
  botonGirar.hidden = faltan === 0
  $('deshacer').disabled = girando || orden.length === 0
  $('reiniciar').disabled = girando || orden.length === 0
  $('estado').textContent =
    faltan === 0
      ? 'Esta categoría ya tiene su orden completo.'
      : `Se sortea el ${ORDINALES[orden.length].toLowerCase()} lugar. Quedan ${faltan} en la ruleta.`
}

function dibujar() {
  dibujarPestanas()
  dibujarRuleta()
  dibujarOrden()
}

function anunciar(lugar, nombre, alCerrar) {
  $('aviso-lugar').textContent = `${ORDINALES[lugar]} lugar de participación`
  $('aviso-nombre').textContent = nombre
  $('aviso-foto').innerHTML = avatar(nombre, 'avatar--grande')
  $('aviso').hidden = false
  const seguir = $('aviso-seguir')
  seguir.focus()
  seguir.onclick = () => {
    $('aviso').hidden = true
    alCerrar()
  }
}

function asignar(nombre) {
  const c = categoria()
  estado[c.id].push(nombre)
  // Si sólo queda una persona, su lugar ya está decidido: es el último.
  const resto = pendientes(c)
  if (resto.length === 1) estado[c.id].push(resto[0])
  guardar()
}

function girar() {
  const nombres = pendientes()
  if (girando || nombres.length === 0) return
  const c = categoria()
  const lugar = estado[c.id].length

  if (nombres.length === 1) {
    asignar(nombres[0])
    dibujar()
    return
  }

  girando = true
  dibujarOrden()

  const n = nombres.length
  const paso = 360 / n
  const elegido = azar(n)
  // Deja el sector elegido bajo el puntero, con un desvío para que no caiga siempre al centro.
  const desvio = (azar(1000) / 1000 - 0.5) * paso * 0.7
  const destino = (((-elegido * paso + desvio) % 360) + 360) % 360
  rotacion = 360 * (5 + azar(3)) + destino

  // Fuerza un reflujo para que la transición arranque desde 0 grados.
  void ruleta.getBoundingClientRect()
  ruleta.style.transition = `transform ${DURACION_MS}ms cubic-bezier(0.12, 0.72, 0.1, 1)`
  ruleta.style.transform = `rotate(${rotacion}deg)`

  setTimeout(() => {
    const nombre = nombres[elegido]
    anunciar(lugar, nombre, () => {
      asignar(nombre)
      girando = false
      dibujar()
    })
  }, DURACION_MS + 150)
}

function textoResultados() {
  const lineas = ['Sorteo del orden de participación', 'Concurso del club 2026-2027 · Toastmasters Pachuca', '']
  for (const c of CATEGORIAS) {
    lineas.push(`*${c.nombre}*`)
    if (estado[c.id].length === 0) lineas.push('Sin sortear')
    estado[c.id].forEach((n, i) => lineas.push(`${i + 1}. ${n}`))
    if (estado[c.id].length > 0 && !terminada(c)) lineas.push('(sorteo incompleto)')
    lineas.push('')
  }
  const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
  lineas.push(`Sorteado el ${fecha}`)
  return lineas.join('\n')
}

$('pestanas').addEventListener('click', (e) => {
  const boton = e.target.closest('[data-id]')
  if (!boton || girando) return
  activa = boton.dataset.id
  dibujar()
})

botonGirar.addEventListener('click', girar)

$('deshacer').addEventListener('click', () => {
  const c = categoria()
  const orden = estado[c.id]
  if (girando || orden.length === 0) return
  // Si el último lugar se asignó solo, se retira junto con el sorteo que lo causó.
  if (terminada(c) && orden.length >= 2) orden.pop()
  orden.pop()
  guardar()
  dibujar()
})

$('reiniciar').addEventListener('click', () => {
  if (girando) return
  estado[activa] = []
  guardar()
  dibujar()
})

$('reiniciar-todo').addEventListener('click', (e) => {
  if (girando) return
  const boton = e.currentTarget
  // Pide una segunda pulsación en lugar de un cuadro de diálogo del navegador.
  if (boton.dataset.confirmar !== 'si') {
    boton.dataset.confirmar = 'si'
    boton.textContent = '¿Seguro? Pulsa otra vez'
    setTimeout(() => {
      boton.dataset.confirmar = ''
      boton.textContent = 'Reiniciar todo'
    }, 3000)
    return
  }
  boton.dataset.confirmar = ''
  boton.textContent = 'Reiniciar todo'
  estado = Object.fromEntries(CATEGORIAS.map((c) => [c.id, []]))
  guardar()
  dibujar()
})

$('copiar').addEventListener('click', async (e) => {
  const boton = e.currentTarget
  const texto = textoResultados()
  try {
    await navigator.clipboard.writeText(texto)
    boton.textContent = 'Copiado'
  } catch {
    boton.textContent = 'No se pudo copiar'
  }
  setTimeout(() => (boton.textContent = 'Copiar resultados'), 2000)
})

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' && e.code !== 'Enter') return
  if (e.target.closest('button')) return
  e.preventDefault()
  if (!$('aviso').hidden) $('aviso-seguir').click()
  else girar()
})

dibujar()
