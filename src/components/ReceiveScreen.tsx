import { useState, useEffect } from 'react';
import { 
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiButtonReact as BuiButton,
} from 'bui/packages/ui/react';
import { 
  createTipPaymentMethods,
  VoltageApiError
} from '../services/voltageApi';
import { isVoltageConfigured } from '../config/voltage';

interface ReceiveScreenProps {
  amount: number;
  onGoBack: () => void;
  onCopy: () => void;
}

interface PaymentData {
  lightningInvoice?: string;
  onchainAddress?: string;
}

export default function ReceiveScreen({ amount, onGoBack, onCopy }: ReceiveScreenProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPayment = async () => {
      if (!isVoltageConfigured()) {
        setError('Voltage API is not properly configured');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await createTipPaymentMethods(
          amount,
          `Bitcoin tip for $${amount} - Max Eve Music & Art`
        );

        console.log('Payment result:', result);
        console.log('Lightning invoice:', result.lightningInvoice);
        
        const newPaymentData = {
          lightningInvoice: result.lightningInvoice,
          onchainAddress: result.onchainAddress,
        };
        
        console.log('Setting payment data:', newPaymentData);
        setPaymentData(newPaymentData);
      } catch (err) {
        console.error('Failed to create payment:', err);
        
        if (err instanceof VoltageApiError) {
          setError(`Payment creation failed: ${err.message}`);
        } else {
          setError('Failed to create payment. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    createPayment();
  }, [amount]);

  const handleCopy = async () => {
    try {
      if (!paymentData?.onchainAddress && !paymentData?.lightningInvoice) {
        console.error('No payment data available to copy');
        return;
      }

      let textToCopy = '';
      
      if (paymentData.onchainAddress && paymentData.lightningInvoice) {
        // Create unified BIP21 string
        textToCopy = `bitcoin:${paymentData.onchainAddress}?lightning=${paymentData.lightningInvoice}`;
      } else if (paymentData.lightningInvoice) {
        textToCopy = paymentData.lightningInvoice;
      } else if (paymentData.onchainAddress) {
        textToCopy = paymentData.onchainAddress;
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        onCopy();
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Debug logging
  console.log('ReceiveScreen render - paymentData:', paymentData);
  console.log('ReceiveScreen render - isLoading:', isLoading);
  console.log('ReceiveScreen render - error:', error);

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-start p-12 gap-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-2">
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#9f9fa9] border border-[var(--system-divider)] flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
        </div>
        
        {/* Name */}
        <p className="text-[var(--text-secondary)] text-2xl font-normal">Max Eve Music & Art</p>
        
        {/* Title */} 
        <h1 className="text-4xl font-normal text-center">Send Max a tip for a great show</h1>
      </div>

      {/* Bitcoin QR Display */}
      <div className="w-[392px]">
        <BuiBitcoinQrDisplay
          key={paymentData?.lightningInvoice || 'loading'} // Force re-render when invoice changes
          address={paymentData?.onchainAddress || ''}
          lightning={paymentData?.lightningInvoice || ''}
          option="lightning"
          selector="toggle"
          size={332}
          showImage={true}
          dotType="dots"
          dotColor="#000000"
          copyOnTap={true}
          placeholder={isLoading}
          error={!!error}
          errorMessage={error || undefined}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-[392px] flex gap-4">
        <BuiButton
          label="Go Back"
          styleType="outline"
          size="large"
          wide={true}
          onClick={onGoBack}
        />
        <BuiButton
          label={isLoading ? "Loading..." : "Copy"}
          styleType="filled"
          size="large"
          wide={true}
          disabled={isLoading || !!error || !paymentData}
          onClick={handleCopy}
        />
      </div>
    </div>
  );
}