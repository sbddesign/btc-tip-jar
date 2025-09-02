import { useState } from 'react'
import './App.css'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton
} from 'bui/packages/ui/react'
import 'bui/packages/ui/tokens.css'

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

function App() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [tipOptionsState, setTipOptionsState] = useState(tipOptions)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: option.primaryAmount === amount
      }))
    )
  }

  const handleContinue = () => {
    if (selectedAmount) {
      console.log(`Proceeding with tip amount: $${selectedAmount}`)
      // TODO: Implement actual tip functionality
    }
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
          amountDefined={false}
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
    </div>
  )
}

export default App
