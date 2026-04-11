import { supabasePublic } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Product {
  id: string
  slug: string
  name: string
  price_cop: number
  is_active: boolean
}

export async function GET(): Promise<NextResponse> {
  const { data, error } = await supabasePublic
    .from('products')
    .select('id, slug, name, price_cop, is_active')

  if (error) {
    return NextResponse.json({ ok: false, count: 0, data: [], error: error.message }, { status: 500 })
  }

  const products = (data ?? []) as Product[]

  return NextResponse.json({ ok: true, count: products.length, data: products, error: null })
}
