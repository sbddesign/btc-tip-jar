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
    primarySymbol: '$',
    secondaryAmount: 8607,
    secondarySymbol: '₿',
    emoji: '🧡',
    message: 'Super',
    selected: false
  },
  {
    id: 2,
    primaryAmount: 20,
    primarySymbol: '$',
    secondaryAmount: 17214,
    secondarySymbol: '₿',
    emoji: '🎉',
    message: 'Amazing',
    selected: false
  },
  {
    id: 3,
    primaryAmount: 50,
    primarySymbol: '$',
    secondaryAmount: 43035,
    secondarySymbol: '₿',
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
    <div className="bitcoin-tip-jar">
      {/* Header Section */}
      <div className="header">
        <div className="avatar-container">
          <div className="avatar">
            <div className="avatar-image"></div>
          </div>
          <h1 className="creator-name">Max Eve Music & Art</h1>
          <p className="tagline">Send Max a tip for a great show</p>
        </div>
      </div>

      {/* Amount Selection Grid */}
      <div className="amount-grid">
        {tipOptionsState.map((option) => (
          <div 
            key={option.id}
            className={`amount-tile ${option.selected ? 'selected' : ''}`}
            onClick={() => handleAmountSelect(option.primaryAmount)}
          >
            <BuiAmountOptionTile
              emoji={option.emoji}
              message={option.message}
              show-emoji="true"
              show-message="true"
              show-secondary-currency="true"
              bitcoin-first="false"
              custom="false"
              amount-defined="true"
              selected={option.selected ? "true" : "false"}
              primary-amount={option.primaryAmount}
              primary-symbol={option.primarySymbol}
              secondary-amount={option.secondaryAmount}
              secondary-symbol={option.secondarySymbol}
              show-estimate="true"
              primary-text-size="6xl"
              secondary-text-size="2xl"
            />
          </div>
        ))}
        
        {/* Custom Amount Tile */}
        <div className="amount-tile custom-tile">
          <div className="custom-amount-content">
            <h3>Custom Amount</h3>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="continue-section">
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
