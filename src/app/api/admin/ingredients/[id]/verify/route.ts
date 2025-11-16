import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify or unverify an ingredient
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { verified } = body;

    const updateData: any = {
      verified,
      updated_at: new Date().toISOString(),
    };

    if (verified) {
      updateData.verified_by = user.id;
      updateData.verified_at = new Date().toISOString();
    } else {
      updateData.verified_by = null;
      updateData.verified_at = null;
    }

    const { data, error } = await (supabase
      .from('ingredients') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ingredient:', error);
      return NextResponse.json(
        { error: 'Failed to update ingredient', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ingredient: data });
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to update ingredient', message: error.message },
      { status: 500 }
    );
  }
}
