import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Fetch user's credit transactions
    const { data: transactions, error: transactionsError, count } = await supabase
      .from('credit_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        description,
        created_at,
        video_id,
        subscription_id
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (transactionsError) {
      console.error('Failed to fetch credit transactions:', transactionsError);
      return NextResponse.json(
        { error: 'Failed to fetch credit history' },
        { status: 500 }
      );
    }

    // Transform transactions for frontend
    const formattedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      type: transaction.transaction_type,
      amount: Math.abs(transaction.amount), // Always show positive amounts
      description: transaction.description,
      created_at: transaction.created_at,
      isCredit: transaction.amount > 0, // true for purchases/refunds, false for usage
      videoId: transaction.video_id,
      subscriptionId: transaction.subscription_id
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}