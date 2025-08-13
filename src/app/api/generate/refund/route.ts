import { NextRequest, NextResponse } from 'next/server';
import { refundCredits } from '@/lib/credits-manager';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { taskId, reason } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Processing refund request for task: ${taskId}`);

    // Get user from auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check if there's already a credit transaction for this task
    const { data: existingTransaction } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'usage')
      .like('description', `%Task: ${taskId}%`)
      .single();

    if (!existingTransaction) {
      console.log(`⚠️ No credit transaction found for task ${taskId}`);
      return NextResponse.json(
        { error: 'No credit transaction found for this task' },
        { status: 404 }
      );
    }

    // Check if refund already processed
    const { data: existingRefund } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'refund')
      .like('description', `%Task: ${taskId}%`)
      .single();

    if (existingRefund) {
      console.log(`✅ Refund already processed for task ${taskId}`);
      return NextResponse.json({
        success: true,
        message: 'Refund already processed',
        alreadyProcessed: true
      });
    }

    // Process refund
    const refundAmount = Math.abs(existingTransaction.amount); // Convert negative amount to positive
    const refundResult = await refundCredits(
      user.id,
      refundAmount,
      `Video generation failed: ${reason || 'Unknown error'}`,
      taskId
    );

    if (!refundResult.success) {
      console.error('Failed to process refund:', refundResult.error);
      return NextResponse.json(
        { error: refundResult.error || 'Failed to process refund' },
        { status: 500 }
      );
    }

    console.log(`💰 Refund processed successfully for task ${taskId}. New balance: ${refundResult.newCredits}`);

    return NextResponse.json({
      success: true,
      refundAmount,
      newCredits: refundResult.newCredits,
      message: 'Credits refunded successfully'
    });

  } catch (error) {
    console.error('❌ Refund processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
}