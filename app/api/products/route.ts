import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  // Map snake_case to camelCase if needed, or keep as is if frontend matches
  const products = data.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    description: p.description,
    costPrice: p.cost_price,
    sellingPrice: p.selling_price,
    stock: p.stock,
    image: p.image,
    active: p.active,
    trackInventory: p.track_inventory,
    createdAt: p.created_at
  }));

  return Response.json(products);
}

export async function POST(request: Request) {
  const product = await request.json();
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      cost_price: product.costPrice,
      selling_price: product.sellingPrice,
      stock: product.stock,
      image: product.image,
      active: product.active,
      track_inventory: product.trackInventory
    }])
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PUT(request: Request) {
  const product = await request.json();
  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      cost_price: product.costPrice,
      selling_price: product.sellingPrice,
      stock: product.stock,
      image: product.image,
      active: product.active,
      track_inventory: product.trackInventory
    })
    .eq('id', product.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
