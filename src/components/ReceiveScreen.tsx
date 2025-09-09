import { 
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiButtonReact as BuiButton,
} from 'bui/packages/ui/react';

interface ReceiveScreenProps {
  amount: number;
  onGoBack: () => void;
  onCopy: () => void;
}

// Fake Bitcoin data - will be replaced with real API later
const FAKE_ONCHAIN_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const FAKE_LIGHTNING_INVOICE = 'lnbc1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w';

export default function ReceiveScreen({ onGoBack, onCopy }: ReceiveScreenProps) {
  const handleCopy = async () => {
    try {
      // Copy the unified BIP21 string
      const unifiedString = `bitcoin:${FAKE_ONCHAIN_ADDRESS}?lightning=${FAKE_LIGHTNING_INVOICE}`;
      await navigator.clipboard.writeText(unifiedString);
      onCopy();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
          address={FAKE_ONCHAIN_ADDRESS}
          lightning={FAKE_LIGHTNING_INVOICE}
          option="unified"
          selector="toggle"
          size={332}
          showImage={true}
          dotType="dots"
          dotColor="#000000"
          copyOnTap={true}
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
          label="Copy"
          styleType="filled"
          size="large"
          wide={true}
          onClick={handleCopy}
        />
      </div>
    </div>
  );
}