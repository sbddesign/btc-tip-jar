import { BuiButtonReact as BuiButton } from 'bui/packages/ui/react';

interface SuccessScreenProps {
  onLeaveAnotherTip: () => void;
}

export default function SuccessScreen({ onLeaveAnotherTip }: SuccessScreenProps) {
  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-center p-12 gap-8 relative overflow-hidden">

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 z-10">
        {/* Profile Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-[#9f9fa9] border border-[var(--system-divider)] flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
        </div>

        {/* Name */}
        <p className="text-[var(--text-secondary)] text-2xl font-normal">Max Eve Music & Art</p>

        {/* Thank you message */}
        <h1 className="text-4xl font-normal text-center">Thank you for your support!</h1>

        {/* Leave Another Tip Button */}
        <BuiButton
          label="Leave Another Tip"
          styleType="filled"
          size="large"
          onClick={onLeaveAnotherTip}
        />
      </div>
    </div>
  );
}
