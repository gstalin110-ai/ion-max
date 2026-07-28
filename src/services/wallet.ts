import { supabase } from '@/lib/supabase';
import { Wallet, WalletTransaction, Withdrawal } from '@/lib/types';
import { encryptBankData, encryptPayPalData, encryptCardData, maskAccountNumber, maskEmail, decryptBankData, decryptPayPalData, decryptCardData } from '@/src/lib/encryption';

/**
 * SERVICIO DE BILLETERA (WALLET) - IÓN MAX
 * Este servicio maneja la lógica financiera, depósitos y retiros.
 */

export const walletService = {
  /**
   * Obtiene el balance actual del usuario
   */
  async getBalance(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Wallet;
  },

  /**
   * Obtiene el historial de transacciones (Ledger)
   */
  async getHistory(walletId: string) {
    const { data, error } = await supabase
      .from('wallet_ledger')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  /**
   * Crea una solicitud de retiro (Withdrawal) con datos encriptados
   * Los datos de pago se encriptan automáticamente según el método seleccionado
   */
  async requestWithdrawal(userId: string, amount: number, method: string, paymentData: any) {
    // 1. Verificar saldo suficiente
    const wallet = await this.getBalance(userId);
    if (wallet.available_balance < amount) {
      throw new Error('Saldo insuficiente para realizar el retiro');
    }

    // 2. Encriptar datos según el método de pago
    let encryptedData: string;
    
    switch (method) {
      case 'bank_transfer':
        encryptedData = encryptBankData({
          accountNumber: paymentData.accountNumber,
          routingNumber: paymentData.routingNumber,
          bankName: paymentData.bankName,
          accountHolderName: paymentData.accountHolderName
        });
        break;
      case 'paypal':
        encryptedData = encryptPayPalData({
          email: paymentData.email
        });
        break;
      case 'card':
        encryptedData = encryptCardData({
          lastFourDigits: paymentData.lastFourDigits,
          cardType: paymentData.cardType,
          cardHolderName: paymentData.cardHolderName
        });
        break;
      default:
        throw new Error('Método de pago no soportado');
    }

    // 3. Crear la solicitud en estado 'pending'
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: userId,
        amount,
        payout_method: method,
        encrypted_data: encryptedData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Opcional: Podríamos "bloquear" el saldo del usuario pasándolo a 'pending_balance'
    // Esto evita que el usuario gaste el dinero mientras se procesa el retiro.
    const { error: updateError } = await supabase.rpc('move_to_pending_balance', {
      user_wallet_id: wallet.id,
      amount_to_move: amount
    });

    if (updateError) {
      console.warn('No se pudo bloquear el saldo:', updateError);
    }

    return data;
  },

  /**
   * Lógica para procesar depósitos (Simulación de entrada de Stripe)
   * NOTA: Esto normalmente se llama desde un Webhook de Stripe en el servidor.
   */
  async processDeposit(userId: string, amount: number, referenceId: string) {
    const { data, error } = await supabase.rpc('process_wallet_deposit', {
      target_user_id: userId,
      deposit_amount: amount,
      ref_id: referenceId
    });

    if (error) throw error;
    return data;
  },

  /**
   * Simula la creación de un Payment Intent con Stripe (MOCK)
   * En producción, esto llamaría a la API de Stripe real
   */
  async createStripePaymentIntent(userId: string, amount: number) {
    // Simulación: crear un payment intent en Stripe
    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      amount: amount * 100, // Stripe usa centavos
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
    };

    // Guardar el intent en Supabase para seguimiento
    const { data, error } = await supabase
      .from('payment_intents')
      .insert({
        user_id: userId,
        stripe_intent_id: mockPaymentIntent.id,
        amount,
        currency: 'usd',
        status: 'pending',
        metadata: { mock: true }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...mockPaymentIntent,
      db_record: data
    };
  },

  /**
   * Simula la confirmación de un pago con Stripe (MOCK)
   * En producción, esto se manejaría vía webhook de Stripe
   */
  async confirmMockPayment(intentId: string) {
    // Simular proceso de confirmación
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de red

    // Actualizar el payment intent en Supabase
    const { data, error } = await supabase
      .from('payment_intents')
      .update({ status: 'succeeded' })
      .eq('stripe_intent_id', intentId)
      .select()
      .single();

    if (error) throw error;

    // Procesar el depósito en la wallet del usuario
    await this.processDeposit(data.user_id, data.amount, intentId);

    return {
      success: true,
      payment_intent: data
    };
  },

  /**
   * Obtiene los métodos de pago disponibles (MOCK)
   */
  async getPaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Tarjeta de crédito/débito',
        icon: '💳',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        enabled: true
      },
      {
        id: 'bank_transfer',
        name: 'Transferencia bancaria',
        icon: '🏦',
        enabled: false
      }
    ];
  },

  /**
   * Obtiene las solicitudes de retiro pendientes (para el owner/admin)
   * Los datos sensibles se desencriptan y enmascaran para mostrar información segura
   */
  async getPendingWithdrawals() {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*, profiles:user_id ( full_name, email )')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Desencriptar y enmascarar datos sensibles
    return (data ?? []).map(request => {
      let maskedData: any = {};

      try {
        if (request.payout_method === 'bank_transfer') {
          const bankData = decryptBankData(request.encrypted_data);
          maskedData = {
            accountNumber: maskAccountNumber(bankData.accountNumber),
            bankName: bankData.bankName,
            accountHolderName: bankData.accountHolderName
          };
        } else if (request.payout_method === 'paypal') {
          const paypalData = decryptPayPalData(request.encrypted_data);
          maskedData = {
            email: maskEmail(paypalData.email)
          };
        } else if (request.payout_method === 'card') {
          const cardData = decryptCardData(request.encrypted_data);
          maskedData = {
            lastFourDigits: cardData.lastFourDigits,
            cardType: cardData.cardType,
            cardHolderName: cardData.cardHolderName
          };
        }
      } catch (decryptError) {
        console.error('Error desencriptando datos de retiro:', decryptError);
        maskedData = { error: 'Datos no disponibles' };
      }

      return {
        ...request,
        masked_payment_data: maskedData
      };
    });
  },

  /**
   * Aprueba o rechaza una solicitud de retiro
   */
  async processWithdrawalRequest(requestId: string, status: 'approved' | 'rejected', adminId: string) {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({ 
        status,
        processed_by: adminId,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Si fue aprobado, el saldo ya fue bloqueado, solo necesitamos confirmar
    // Si fue rechazado, necesitamos devolver el saldo al usuario
    if (status === 'rejected') {
      // Lógica para devolver el saldo (implementación pendiente)
    }

    return data;
  }
};
