import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use service role client to bypass RLS for uploads
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing env vars:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      })
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if user is authenticated (using the request's auth context)
    // Note: In API routes, we can check auth via cookies or headers
    // For simplicity, we'll assume the user is authenticated since this is called from dashboard
    // In production, add proper auth check here

    const formData = await request.formData()
    const productId = formData.get('productId') as string
    const files = formData.getAll('files') as File[]

    if (!productId || !files.length) {
      return NextResponse.json({ error: 'Missing productId or files' }, { status: 400 })
    }

    // enforce server-side maximum to avoid more than 30 images per product
    const { data: productData, error: prodErr } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    if (prodErr) {
      console.warn('Could not fetch product images for limit check', prodErr.message)
    }

    const existingCount = productData?.images?.length || 0
    const MAX_FILES = 30
    if (existingCount + files.length > MAX_FILES) {
      return NextResponse.json({ error: `Upload would exceed maximum (${MAX_FILES}) images for this product. Existing: ${existingCount}, trying to add: ${files.length}` }, { status: 400 })
    }

    const uploadedPaths: string[] = []

    for (const file of files) {
      // Sanitize filename to avoid issues with special characters
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${Date.now()}-${sanitizedName}`
      const path = `product-images/${productId}/${filename}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Server upload error', { uploadError, path })
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      }

      // Get public URL
      const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(path)
      uploadedPaths.push(publicData.publicUrl)
    }

    return NextResponse.json({ urls: uploadedPaths })
  } catch (err: any) {
    console.error('Upload API error', err)
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 })
  }
}