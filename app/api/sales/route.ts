import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const sale = await request.json();
  const txId = `TX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // 1. Insert the Sale
  const { error: saleError } = await supabase
    .from('sales')
    .insert([{
      id: txId,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total
    }]);

  if (saleError) return Response.json({ error: saleError.message }, { status: 500 });

  // 2. Insert Sale Items
  const saleItems = sale.items.map((item: any) => ({
    sale_id: txId,
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.total
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems);

  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 });

  // 3. Update Inventory (Optional logic)
  for (const item of sale.items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock, track_inventory')
      .eq('id', item.productId)
      .single();

    if (product?.track_inventory) {
      await supabase
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.productId);
    }
  }

  return Response.json({ id: txId, success: true });
}
