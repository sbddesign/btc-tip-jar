import { BuiButtonReact as BuiButton } from '@sbddesign/bui-ui/react';
import { Recipient } from './Recipient';

interface SuccessScreenProps {
  onLeaveAnotherTip: () => void;
}

export default function SuccessScreen({ onLeaveAnotherTip }: SuccessScreenProps) {
  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-center p-12 gap-8 relative overflow-hidden">

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 z-10">
        <Recipient size="Large" />
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
