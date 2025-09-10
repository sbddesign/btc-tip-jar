import { useState, useRef, useEffect } from 'react'
import './App.css'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton,
  BuiNumpadReact as BuiNumpad
} from 'bui/packages/ui/react'
import 'bui/packages/ui/tokens.css'
import ReceiveScreen from './components/ReceiveScreen'
import SuccessScreen from './components/SuccessScreen'

// Type definition for NumPadClickDetail
interface NumPadClickDetail {
  number: string;
  content: 'number' | 'icon';
}

// Mock data for the tip amounts
const tipOptions = [
  {
    id: 1,
    primaryAmount: 10,
    secondaryAmount: 8607,
    emoji: '🧡',
    message: 'Super',
    selected: false
  },
  {
    id: 2,
    primaryAmount: 20,
    secondaryAmount: 17214,
    emoji: '🎉',
    message: 'Amazing',
    selected: false
  },
  {
    id: 3,
    primaryAmount: 50,
    secondaryAmount: 43035,
    emoji: '🔥',
    message: 'Incredible',
    selected: false
  }
]

// Custom Amount Modal component
function CustomAmountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentAmount,
  onAmountChange
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  currentAmount: string;
  onAmountChange: (amount: string) => void;
}) {
  const numpadRef = useRef<HTMLElement>(null);
  
  // Event listener for numpad-click events
  useEffect(() => {
    const numpadElement = numpadRef.current;
    if (!numpadElement || !isOpen) return;

    const handleNumpadClick = (event: CustomEvent<NumPadClickDetail>) => {
      console.log('NumPad click detected:', event.detail);
      
      const { number, content } = event.detail;
      
              if (content === 'icon') {
          // Handle backspace
          onAmountChange(currentAmount.slice(0, -1) || '0');
        } else {
          // Handle number input
          if (number === '.' && currentAmount.includes('.')) return; // Prevent multiple decimal points
          if (currentAmount === '0' && number !== '.') {
            onAmountChange(number);
          } else {
            onAmountChange(currentAmount + number);
          }
        }
    };

    // Add event listener for the custom numpad-click event
    numpadElement.addEventListener('numpad-click', handleNumpadClick as EventListener);

    // Cleanup function to remove event listener
    return () => {
      numpadElement.removeEventListener('numpad-click', handleNumpadClick as EventListener);
    };
  }, [isOpen, currentAmount]);
  
  const handleConfirm = () => {
    const numAmount = parseFloat(currentAmount);
    if (numAmount > 0) {
      onConfirm(numAmount);
    }
  };
  
  const isAmountValid = parseFloat(currentAmount) > 0;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 lg:p-12">
      <div className="bg-[var(--background)] rounded-[24px] flex flex-col lg:flex-row w-full max-w-6xl gap-6 p-6 lg:p-12 max-md:h-full overflow-x-hidden overflow-y-auto">
        <div className="lg:basis-3/5 lg:w-3/5">
          <h2 className="text-2xl lg:text-4xl text-center mb-6">Choose custom amount</h2>
                     <BuiAmountOptionTile
             showMessage={false}
             showEmoji={false}
             primaryAmount={currentAmount}
             secondaryAmount={(parseFloat(currentAmount) * 0.000025).toFixed(6)}
           />
        </div>
                 <div className="lg:basis-2/5 lg:w-2/5 text-center flex flex-col items-center gap-6">
           {/* Numpad */}
             <BuiNumpad ref={numpadRef} />
          
          {/* Action Buttons */}
          <div className="flex gap-6 w-full">
            <BuiButton
              label="Go Back"
              styleType="outline"
              wide={true}
              onClick={onClose}
            >
            </BuiButton>
                         <BuiButton
               label="Continue"
               wide={true}
               disabled={!isAmountValid}
               onClick={handleConfirm}
             >
            </BuiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [tipOptionsState, setTipOptionsState] = useState(tipOptions)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [currentInputAmount, setCurrentInputAmount] = useState('0')
  const [showReceiveScreen, setShowReceiveScreen] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: option.primaryAmount === amount
      }))
    )
  }

  const handleCustomSelect = () => {
    setShowCustomModal(true)
  }

  const handleCustomConfirm = (amount: number) => {
    setSelectedAmount(amount)
    setCurrentInputAmount(amount.toString())
    setShowCustomModal(false)
    // Update the custom tile to show the selected amount
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: false
      }))
    )
  }

  const handleContinue = () => {
    if (selectedAmount) {
      console.log(`Proceeding with tip amount: $${selectedAmount}`)
      setShowReceiveScreen(true)
    }
  }

  const handleGoBack = () => {
    setShowReceiveScreen(false)
  }

  const handleCopy = () => {
    console.log('Payment details copied to clipboard!')
    // You could show a toast notification here
  }

  const handlePaymentComplete = () => {
    setShowReceiveScreen(false)
    setShowSuccessScreen(true)
  }

  const handleLeaveAnotherTip = () => {
    // Reset all state to start over
    setShowSuccessScreen(false)
    setShowReceiveScreen(false)
    setSelectedAmount(null)
    setCurrentInputAmount('0')
    setTipOptionsState(tipOptions.map(option => ({ ...option, selected: false })))
  }

  // Show success screen if payment is completed
  if (showSuccessScreen) {
    return (
      <SuccessScreen 
        onLeaveAnotherTip={handleLeaveAnotherTip}
      />
    );
  }

  // Show receive screen if user has selected amount and clicked continue
  if (showReceiveScreen && selectedAmount) {
    return (
      <ReceiveScreen 
        amount={selectedAmount}
        onGoBack={handleGoBack}
        onCopy={handleCopy}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <div className="text-center flex flex-col gap-8 lg:gap-12 p-6 lg:p-12">
      <header className="flex flex-col gap-4 lg:gap-6">
          <div className="w-24 h-24 lg:w-40 lg:h-40 rounded-full overflow-hidden mx-auto">
            <div className="bg-linear-to-br from-purple-500 to-pink-500 w-full h-full"></div>
          </div>
          <h1 className="text-2xl text-[var(--text-secondary)]">Max Eve Music & Art</h1>
          <p className="text-3xl lg:text-5xl">Send Max a tip for a great show</p>
      </header>

      <div className="flex flex-col lg:flex-row w-full gap-6 max-w-xl lg:max-w-7xl mx-auto">
        {tipOptionsState.map((option) => (
          <BuiAmountOptionTile
            emoji={option.emoji}
            message={option.message}
            showEmoji={true}
            showMessage={true}
            showSecondaryCurrency={true}
            custom={false}
            selected={option.selected}
            primaryAmount={option.primaryAmount}
            primarySymbol={'$'}
            secondaryAmount={option.secondaryAmount}
            secondarySymbol={'₿'}
            showEstimate={true}
            primaryTextSize="6xl"
            secondaryTextSize="2xl"
            onClick={() => handleAmountSelect(option.primaryAmount)}
            key={option.id}
          />
        ))}
        <BuiAmountOptionTile
          custom={true}
          amountDefined={currentInputAmount !== '0'}
          primaryAmount={currentInputAmount}
          onClick={handleCustomSelect}
          selected={selectedAmount !== null && !tipOptionsState.some(opt => opt.selected)}
        />
      </div>

      <div className="text-center">
        <BuiButton
          style-type="filled"
          size="large"
          label="Continue"
          disabled={!selectedAmount}
          onClick={handleContinue}
        />
      </div>

      <CustomAmountModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleCustomConfirm}
        currentAmount={currentInputAmount}
        onAmountChange={setCurrentInputAmount}
      />
    </div>
  )
}

export default App
