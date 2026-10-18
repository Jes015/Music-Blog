import { renderIconPng } from '@/utils/og.util'
import type { APIRoute, GetStaticPaths } from 'astro'

const SIZES = [48, 180, 192, 512]

export const getStaticPaths = (() => SIZES.map((size) => ({ params: { size: String(size) } }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ params }) => {
  const png = renderIconPng(Number(params.size))
  return new Response(png, { headers: { 'Content-Type': 'image/png' } })
}
