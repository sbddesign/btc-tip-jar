import { useState, useEffect } from 'react';
import { 
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiButtonReact as BuiButton,
  BuiMoneyValueReact as BuiMoneyValue,
  BuiBitcoinValueReact as BuiBitcoinValue,
} from '@sbddesign/bui-ui/react';
import { 
  createTipPaymentMethods,
  VoltageApiError
} from '../services/voltageApi';
import { isVoltageConfigured } from '../config/voltage';
import { Recipient } from './Recipient';
// Import icons as React components
const CopyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V7C18 5.89543 17.1046 5 16 5H14M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M12 12H16M12 16H16M8 12H8.01M8 16H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

interface ReceiveScreenProps {
  amount: number;
  bitcoinAmount: number;
  onGoBack: () => void;
  onCopy: () => void;
}

interface PaymentData {
  lightningInvoice?: string;
  onchainAddress?: string;
}

export default function ReceiveScreen({ amount, bitcoinAmount, onGoBack, onCopy }: ReceiveScreenProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

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
          `Bitcoin tip for $${amount} - ${import.meta.env.VITE_TIP_JAR_NAME || "Recipient"}`
        );

        console.log('Payment result:', result);
        console.log('Lightning invoice:', result.lightningInvoice);
        
        const newPaymentData = {
          lightningInvoice: result.lightningInvoice,
          onchainAddress: result.onchainAddress,
        };
        
        console.log('Setting payment data:', newPaymentData);
        setPaymentData(newPaymentData);

        // Start polling for payment completion in the background
        console.log('Starting payment completion polling...');
        result.pollForCompletion()
          .then((completedPayment) => {
            console.log('Payment completed!', completedPayment);
            setIsPaymentComplete(true);
            // Don't call onPaymentComplete() - we'll handle it in the UI
          })
          .catch((pollError) => {
            console.error('Payment completion polling failed:', pollError);
            // Don't show error to user, they might have paid successfully
            // The polling might fail due to network issues, etc.
          });
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
        setIsCopied(true);
        onCopy();
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLeaveAnotherTip = () => {
    // Go back to landing screen by calling onGoBack
    onGoBack();
  };

  // Debug logging
  console.log('ReceiveScreen render - paymentData:', paymentData);
  console.log('ReceiveScreen render - isLoading:', isLoading);
  console.log('ReceiveScreen render - error:', error);

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-start p-12 gap-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-2">
        <Recipient size="Small" />
        <h1 className="text-4xl font-normal text-center">{import.meta.env.VITE_TIP_JAR_SLOGAN || "Send us a tip"}</h1>
      </div>

      {/* Amount Display */}
      <div className="flex items-center gap-8">
        <BuiMoneyValue
          amount={amount.toString()}
          symbol="$"
          showEstimate="true"
          textSize="3xl"
        />
        <span className="text-[var(--text-secondary)]">
          <BuiBitcoinValue
            amount={bitcoinAmount.toString()}
            showEstimate="false"
            textSize="3xl"
          />
        </span>
      </div>

      {/* Bitcoin QR Display */}
      <div className="w-[392px]">
        <BuiBitcoinQrDisplay
          key={paymentData?.lightningInvoice || 'loading'} // Force re-render when invoice changes
          lightning={paymentData?.lightningInvoice || ''}
          option="lightning"
          selector="toggle"
          size="264"
          showImage="true"
          dotType="dot"
          dotColor="#000000"
          copyOnTap="true"
          placeholder={isLoading ? "true" : ""}
          error={error ? "true" : ""}
          errorMessage={error || undefined}
          complete={isPaymentComplete ? "true" : ""}
        />
      </div>

      {/* Bottom Navigation - Vertical Layout */}
      <div className="w-[314px] flex flex-col gap-4">
        {isPaymentComplete ? (
          <BuiButton
            label="Leave Another Tip"
            styleType="filled"
            size="large"
            wide="true"
            onClick={handleLeaveAnotherTip}
          >
            <CheckCircleIcon />
          </BuiButton>
        ) : (
          <>
            <BuiButton
              label={isCopied ? "Copied!" : (isLoading ? "Loading..." : "Copy")}
              styleType="filled"
              size="large"
              wide="true"
              disabled={isLoading || !!error || !paymentData ? "true" : "false"}
              onClick={handleCopy}
            >
              {isCopied ? <CheckCircleIcon /> : <CopyIcon />}
            </BuiButton>
            <BuiButton
              label="Go Back"
              styleType="outline"
              size="large"
              wide="true"
              onClick={onGoBack}
            >
              <ArrowLeftIcon />
            </BuiButton>
          </>
        )}
      </div>
    </div>
  );
}