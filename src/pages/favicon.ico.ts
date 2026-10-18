import { renderIconPng } from '@/utils/og.util'
import type { APIRoute } from 'astro'

// ICO con un único PNG de 48x48 embebido (válido en todos los navegadores actuales).
export const GET: APIRoute = () => {
  const png = renderIconPng(48)
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0) // reservado
  header.writeUInt16LE(1, 2) // tipo: icono
  header.writeUInt16LE(1, 4) // nº de imágenes
  header.writeUInt8(48, 6) // ancho
  header.writeUInt8(48, 7) // alto
  header.writeUInt8(0, 8) // paleta
  header.writeUInt8(0, 9) // reservado
  header.writeUInt16LE(1, 10) // planos
  header.writeUInt16LE(32, 12) // bits por píxel
  header.writeUInt32LE(png.length, 14) // tamaño de la imagen
  header.writeUInt32LE(22, 18) // offset de la imagen
  return new Response(new Uint8Array(Buffer.concat([header, png])), { headers: { 'Content-Type': 'image/x-icon' } })
}
